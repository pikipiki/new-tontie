#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="${PATH:-}:/opt/homebrew/opt/openjdk@21/bin"
JAR="$ROOT/reference/tools/ffdec-cli.jar"
SWF="$ROOT/reference/tontie.swf"
mkdir -p "$ROOT/public/game/sounds"
java -jar "$JAR" -export sound "$ROOT/public/game/sounds" "$SWF"
echo "Sounds exported to public/game/sounds (sprites optional: -export sprite …)"
