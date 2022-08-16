#!/usr/bin/env bash
hash="$(git rev-parse HEAD)"
npx electron-packager ./dist --out ./pack --platform darwin --overwrite --icon=./app.ico --app-version="$npm_package_version"-"${hash:0:8}"
