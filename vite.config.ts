/// <reference types="vitest/config" />
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const srcRoot = path.resolve(dirname, 'src')
const rufflePkg = path.resolve(dirname, 'node_modules/@ruffle-rs/ruffle')
const ruffleOut = path.resolve(dirname, 'public/ruffle')

function copyRuffleAssets(): void {
  if (!fs.existsSync(rufflePkg)) {
    return
  }
  fs.mkdirSync(ruffleOut, { recursive: true })
  for (const name of fs.readdirSync(rufflePkg)) {
    if (name.endsWith('.js') || name.endsWith('.wasm')) {
      fs.copyFileSync(path.join(rufflePkg, name), path.join(ruffleOut, name))
    }
  }
}

function ruffleAssetsPlugin(): Plugin {
  return {
    name: 'ruffle-self-host',
    buildStart() {
      copyRuffleAssets()
    },
    configureServer() {
      copyRuffleAssets()
    },
  }
}

export default defineConfig({
  plugins: [ruffleAssetsPlugin(), react()],
  resolve: {
    alias: {
      '@': srcRoot,
      '@components': path.resolve(srcRoot, 'components'),
      '@constants': path.resolve(srcRoot, 'constants'),
      '@hooks': path.resolve(srcRoot, 'hooks'),
      '@pages': path.resolve(srcRoot, 'pages'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
