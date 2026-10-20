#!/usr/bin/env node
/**
 * Upload dist/ to Yandex Object Storage (S3 API). No AWS CLI required.
 * See docs/DEPLOY-RU.md
 */
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { spawnSync } from 'node:child_process'
import {
  createReadStream,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadDotEnv(envPath) {
  if (!existsSync(envPath)) {
    return
  }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const eq = trimmed.indexOf('=')
    if (eq === -1) {
      continue
    }
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing ${name}. Set it in .env — see docs/DEPLOY-RU.md`)
    process.exit(1)
  }
  return value
}

function walkDist(dir, base = dir) {
  const files = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      files.push(...walkDist(full, base))
    } else {
      files.push({
        abs: full,
        key: path.relative(base, full).split(path.sep).join('/'),
      })
    }
  }
  return files
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.swf': 'application/x-shockwave-flash',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
}

function contentTypeFor(key) {
  const ext = path.extname(key).toLowerCase()
  return MIME[ext] ?? 'application/octet-stream'
}

function cacheControlFor(key) {
  return key === 'index.html'
    ? 'public,max-age=0,must-revalidate'
    : 'public,max-age=31536000,immutable'
}

loadDotEnv(path.join(root, '.env'))

const accessKeyId = requireEnv('YC_S3_ACCESS_KEY_ID')
const secretAccessKey = requireEnv('YC_S3_SECRET_ACCESS_KEY')
const bucket = requireEnv('YC_S3_BUCKET')
const endpoint = process.env.YC_S3_ENDPOINT ?? 'https://storage.yandexcloud.net'
const region = process.env.YC_S3_REGION ?? 'ru-central1'
const skipBuild = process.argv.includes('--skip-build')

if (!skipBuild) {
  console.log('Building…')
  const build = spawnSync('npm', ['run', 'build'], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  })
  if (build.status !== 0) {
    process.exit(build.status ?? 1)
  }
}

const distDir = path.join(root, 'dist')
if (!existsSync(distDir)) {
  console.error('dist/ missing after build')
  process.exit(1)
}

const client = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
})

const localFiles = walkDist(distDir)
const localKeys = new Set(localFiles.map((file) => file.key))

console.log(`Uploading ${String(localFiles.length)} files → s3://${bucket}/`)

for (const file of localFiles) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: file.key,
      Body: createReadStream(file.abs),
      ContentType: contentTypeFor(file.key),
      CacheControl: cacheControlFor(file.key),
    }),
  )
  process.stdout.write(`  ↑ ${file.key}\n`)
}

let continuationToken
const remoteKeys = []
do {
  const list = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
    }),
  )
  for (const object of list.Contents ?? []) {
    if (object.Key) {
      remoteKeys.push(object.Key)
    }
  }
  continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined
} while (continuationToken)

const toDelete = remoteKeys.filter((key) => !localKeys.has(key))
if (toDelete.length > 0) {
  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: toDelete.map((key) => ({ Key: key })) },
    }),
  )
  for (const key of toDelete) {
    process.stdout.write(`  ✕ ${key}\n`)
  }
}

console.log('Done. Open the CDN URL in Yandex Cloud → Cloud CDN.')
