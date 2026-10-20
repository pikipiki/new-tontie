#!/usr/bin/env node
/**
 * Free tunnel via localtunnel (not Cloudflare). See docs/DEPLOY-FREE.md
 */
import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.env.TONTIE_DEV_PORT ?? 5173)
const startVite = !process.argv.includes('--no-dev')

function waitForPort(port) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 90_000
    const attempt = () => {
      if (Date.now() > deadline) {
        reject(new Error(`Port ${String(port)} not ready`))
        return
      }
      const socket = net.connect(port, '127.0.0.1', () => {
        socket.end()
        resolve()
      })
      socket.on('error', () => {
        setTimeout(attempt, 250)
      })
    }
    attempt()
  })
}

const children = []
const shutdown = () => {
  for (const child of children) {
    child.kill('SIGTERM')
  }
}
process.on('SIGINT', () => {
  shutdown()
  process.exit(0)
})

if (startVite) {
  const vite = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  })
  children.push(vite)
  await waitForPort(PORT)
} else {
  await waitForPort(PORT)
}

const lt = spawn(
  'npx',
  ['localtunnel', '--port', String(PORT), '--local-host', '127.0.0.1'],
  { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], shell: false },
)
children.push(lt)

for (const stream of [lt.stdout, lt.stderr]) {
  stream.on('data', (chunk) => {
    const text = chunk.toString()
    process.stdout.write(text)
    const match = text.match(/https:\/\/[a-z0-9-]+\.loca\.lt\/?/)
    if (match) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('  Lien localtunnel :')
      console.log(`  ${match[0]}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    }
  })
}

lt.on('exit', (code) => {
  shutdown()
  process.exit(code ?? 0)
})
