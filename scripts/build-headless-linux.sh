#!/usr/bin/env bash
dotnet publish NineChronicles.Headless/NineChronicles.Headless.Executable/NineChronicles.Headless.Executable.csproj \
  -c Release \
  -r linux-x64 \
  -o dist/publish \
  -p:PublishSingleFile=true \
  --self-contained \
  --version-suffix "$(git -C NineChronicles.Headless rev-parse HEAD)"
