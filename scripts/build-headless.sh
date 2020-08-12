#!/usr/bin/env bash
dotnet publish NineChronicles.Standalone/NineChronicles.Standalone.Executable/NineChronicles.Standalone.Executable.csproj \
  -c Release \
  -r osx-x64 \
  -o dist/publish \
  --self-contained \
  --version-suffix "$(git rev-parse HEAD)"
