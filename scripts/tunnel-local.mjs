#!/usr/bin/env node
/**
 * Private quick tunnel: your local Vite dev server → HTTPS URL (share link only).
 * Uses Cloudflare Quick Tunnels (no account). See docs/TUNNEL.md
 */
import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cloudflaredBin = path.join(root, 'node_modules', 'cloudflared', 'bin', 'cloudflared')
const PORT = Number(process.env.TONTIE_DEV_PORT ?? 5173)
const LOCAL = `http://127.0.0.1:${String(PORT)}`

const startVite = !process.argv.includes('--no-dev')

function waitForPort(port, host = '127.0.0.1', timeoutMs = 90_000) {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Port ${String(port)} not ready after ${String(timeoutMs)}ms`))
        return
      }
      const socket = net.connect(port, host, () => {
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

function printPublicUrl(line) {
  const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com\/?/)
  if (match) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Lien privé (partage uniquement) :')
    console.log(`  ${match[0]}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }
}

const children = []

function shutdown() {
  for (const child of children) {
    child.kill('SIGTERM')
  }
}

process.on('SIGINT', () => {
  shutdown()
  process.exit(0)
})
process.on('SIGTERM', shutdown)

if (startVite) {
  console.log(`Starting Vite on ${LOCAL}…`)
  const vite = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  })
  children.push(vite)
  await waitForPort(PORT)
} else {
  console.log(`Tunnel only — expecting dev server at ${LOCAL}`)
  await waitForPort(PORT)
}

console.log('Opening Cloudflare quick tunnel (HTTPS)…')

const cloudflared = spawn(
  cloudflaredBin,
  ['tunnel', '--url', LOCAL, '--no-autoupdate'],
  { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], shell: false },
)

children.push(cloudflared)

for (const stream of [cloudflared.stdout, cloudflared.stderr]) {
  stream.on('data', (chunk) => {
    const text = chunk.toString()
    process.stdout.write(text)
    for (const line of text.split('\n')) {
      printPublicUrl(line)
    }
  })
}

cloudflared.on('exit', (code) => {
  shutdown()
  process.exit(code ?? 0)
})
