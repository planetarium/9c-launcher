#!/usr/bin/env bash
set -euo pipefail

[[ -d dist/publish && -d NineChronicles.Headless ]] || yarn build-headless
[[ -d 9c_Data && -d NineChronicles ]] || yarn bundle-player
