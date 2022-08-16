#!/usr/bin/env pwsh
$hash = git rev-parse HEAD
npx electron-packager ./dist --out ./pack --platform win32 --overwrite --icon=./app.ico --app-version=$env:npm_package_version-$($hash.Substring(0,8))
