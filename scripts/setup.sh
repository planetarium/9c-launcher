#!/usr/bin/env bash
set -euo pipefail

if [ -z "$CI" ]; then
  exit 0
fi

[[ -d dist/publish && -d NineChronicles.Headless ]] || yarn build-headless
[[ -d 9c_Data && -d NineChronicles ]] || yarn bundle-player
[[ -d src/generated ]] || yarn codegen
