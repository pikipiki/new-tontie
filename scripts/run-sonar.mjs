import { spawnSync } from 'node:child_process'

const npmCli = process.env.npm_execpath
if (!npmCli) throw new Error('Run this command through npm run sonar')
// Node parses .env as data. Tokens remain in the environment, never command arguments.
for (const args of [
  ['run', 'test:coverage'],
  ['exec', '--yes=false', '--', 'sonar-scanner'],
]) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    stdio: 'inherit',
    shell: false,
  })
  if (result.status !== 0) {
    if (result.error) console.error(result.error.message)
    process.exit(result.status ?? 1)
  }
}
