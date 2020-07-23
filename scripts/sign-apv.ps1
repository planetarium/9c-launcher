#!/usr/bin/env pwsh
if ("$env:APV" -ne "") {
  Write-Warning `
    "APV is given; use `"$env:APV`" instead of generating new one..."
  npm run --silent configure-apv "$env:APV"
  exit $LastExitCode
} elseif ("$env:SKIP_APV_SIGN" -ne "") {
  Write-Error "Skip APV signing..."
  exit 0
}

$makeApvPath = $MyInvocation.MyCommand.Definition `
  | Split-Path -Parent `
  | Join-Path -ChildPath "make-apv.ps1"
. "$makeApvPath"

npm run --silent configure-apv "$apv"
