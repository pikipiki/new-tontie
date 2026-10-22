import { expect, test, type Page } from '@playwright/test'

function watchRuntime(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

test('adventure renders, accepts keyboard input, pauses and mutes', async ({
  page,
}, testInfo) => {
  const errors = watchRuntime(page)
  await page.goto('./')
  await expect(
    page.getByRole('button', { name: /Start adventure/ }),
  ).toBeVisible()
  await expect(page.locator('canvas').first()).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('welcome.png') })
  await page.getByRole('button', { name: /Start adventure/ }).click()
  await expect(page.getByRole('group').getByRole('button')).toHaveCount(9)
  await page.screenshot({ path: testInfo.outputPath('playing.png') })
  // 3D Canvas accepts direct pointer clicks and registers them without errors
  const canvas = page.locator('canvas').first()
  await canvas.click({ position: { x: 200, y: 100 } })
  await page.keyboard.press('Numpad5')
  await page.keyboard.press('Digit0')
  await expect(page.getByRole('button', { name: /Resume/ })).toBeVisible()
  await page.getByRole('button', { name: /Resume/ }).click()
  await expect(page.getByRole('button', { name: /Pause/ })).toBeVisible()
  await page.getByRole('button', { name: /^Mute$/ }).click()
  await expect(
    page.getByRole('button', { name: /Turn sound on/ }),
  ).toBeVisible()
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  )
  expect(fits).toBe(true)
  expect(await page.evaluate(() => 'tontieReplay' in window)).toBe(false)
  expect(errors).toEqual([])
})

test('classic starts and pauses with touch controls', async ({ page }) => {
  const errors = watchRuntime(page)
  await page.goto('./')
  await page.getByRole('button', { name: 'Classic mode', exact: true }).click()
  await page.getByRole('button', { name: /Start level 1/ }).click()
  await expect(page.getByRole('button', { name: /Pause/ })).toBeVisible()
  await page.getByRole('button', { name: /Pause/ }).click()
  await expect(page.getByRole('button', { name: /Resume/ })).toBeVisible()
  expect(errors).toEqual([])
})

test('reference loads the verified SWF with its local runtime', async ({
  page,
}) => {
  const errors = watchRuntime(page)
  const swf = page.waitForResponse((response) =>
    response.url().endsWith('/game/tontie.swf'),
  )
  await page.goto('./?ruffle=1')
  expect((await swf).ok()).toBe(true)
  await expect(page.locator('ruffle-player')).toBeVisible()
  await expect(page.locator('ruffle-player canvas')).toBeVisible({
    timeout: 30000,
  })
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('reference rejects an altered SWF and displays an error', async ({
  page,
}) => {
  await page.route('**/game/tontie.swf', (route) =>
    route.fulfill({ body: 'invalid SWF' }),
  )
  await page.goto('./?ruffle=1')
  await expect(page.getByRole('alert')).toContainText('mismatch')
  await expect(page.locator('ruffle-player')).toHaveCount(0)
})
