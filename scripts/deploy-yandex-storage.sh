#!/usr/bin/env bash
# Sync dist/ to Yandex Object Storage (S3-compatible). See docs/DEPLOY-RU.md.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${YC_S3_ACCESS_KEY_ID:?Set YC_S3_ACCESS_KEY_ID in .env}"
: "${YC_S3_SECRET_ACCESS_KEY:?Set YC_S3_SECRET_ACCESS_KEY in .env}"
: "${YC_S3_BUCKET:?Set YC_S3_BUCKET in .env}"

YC_S3_ENDPOINT="${YC_S3_ENDPOINT:-https://storage.yandexcloud.net}"
YC_S3_REGION="${YC_S3_REGION:-ru-central1}"

export AWS_ACCESS_KEY_ID="$YC_S3_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$YC_S3_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$YC_S3_REGION"

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI not found. Install v2: https://aws.amazon.com/cli/" >&2
  exit 1
fi

echo "Building…"
npm run build

DEST="s3://${YC_S3_BUCKET}/"

echo "Syncing dist/ → ${DEST}"
aws --endpoint-url="$YC_S3_ENDPOINT" s3 sync dist/ "$DEST" \
  --delete \
  --exclude "index.html" \
  --cache-control "public,max-age=31536000,immutable"

aws --endpoint-url="$YC_S3_ENDPOINT" s3 cp dist/index.html "${DEST}index.html" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html; charset=utf-8"

echo "Done. Open the CDN URL from the Yandex console (Cloud CDN → your resource)."
