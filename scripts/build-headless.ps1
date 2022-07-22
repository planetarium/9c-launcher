#!/usr/bin/env pwsh
dotnet publish NineChronicles.Headless/NineChronicles.Headless.Executable/NineChronicles.Headless.Executable.csproj `
  -c Release `
  -r win-x64 `
  -o dist/publish `
  -p:PublishSingleFile=true `
  -p:EnableTrimAnalyzer=false `
  --self-contained `
  --version-suffix "$(git -C NineChronicles.Headless rev-parse HEAD)"
