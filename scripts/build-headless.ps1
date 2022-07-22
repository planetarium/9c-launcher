#!/usr/bin/env pwsh
dotnet publish NineChronicles.Headless/NineChronicles.Headless.Executable/NineChronicles.Headless.Executable.csproj `
  -c Release `
  -r win-x64 `
  -o dist/publish `
  --self-contained `
  --version-suffix "$(git -C NineChronicles.Headless rev-parse HEAD)"
