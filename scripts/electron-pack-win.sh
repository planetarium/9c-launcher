#!/usr/bin/env bash
hash="$(git rev-parse HEAD)"
yarn electron-packager ./dist --out ./pack --overwrite --icon=./app.ico --app-version="$npm_package_version"-"${hash:0:8}" --platform=win32
