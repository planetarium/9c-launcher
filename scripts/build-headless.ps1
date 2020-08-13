#!/usr/bin/env pwsh
dotnet publish NineChronicles.Standalone/NineChronicles.Standalone.Executable/NineChronicles.Standalone.Executable.csproj `
  -c Release `
  -r win-x64 `
  -o dist/publish `
  --self-contained `
  --version-suffix "$(git -C NineChronicles.Standalone rev-parse HEAD)"
