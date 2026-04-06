#!/usr/bin/env sh
set -e

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  echo ".env already exists — leaving it unchanged."
  exit 0
fi

if [ ! -f .env.example ]; then
  echo "Missing .env.example"
  exit 1
fi

cp .env.example .env
echo "Created .env from .env.example — edit .env as needed."
