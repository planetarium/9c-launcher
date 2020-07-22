#!/usr/bin/env pwsh
if ("$env:APV_SIGN_KEY" -eq "") {
  Write-Error "APV_SIGN_KEY is not configured." -ErrorAction Stop
} elseif ((Get-Command npx -ErrorAction SilentlyContinue) -and `
          ((& npx --no-install -q planet --version > $null) -or $?)) {
  function planet {
    & npx --no-install -q @args
  }
} elseif (-not (Get-Command planet -ErrorAction SilentlyContinue)) {
  Write-Error "`
The planet command does not exist.
Please install Libplanet.Tools first:
  dotnet tool install --global Libplanet.Tools" `
    -ErrorAction Stop
}

$DefaultUrlBase = "https://download.nine-chronicles.com/v"

if ("$env:APV_MACOS_URL" -eq "") {
  $macOSBinaryUrl = "$DefaultUrlBase$env:APV_NO/macOS.tar.gz"
} else {
  $macOSBinaryUrl = $env:APV_MACOS_URL;
}

if ("$env:APV_WINDOWS_URL" -eq "") {
  $windowsBinaryUrl = "$DefaultUrlBase$env:APV_NO/Windows.zip"
} else {
  $windowsBinaryUrl = $env:APV_WINDOWS_URL;
}

if ("$env:APV_NO" -eq "") {
  Write-Warning "APV_NO is not configured; query S3 about the latest APV_NO..."
  $latestApvNo = [int] $(npm run --silent latest-apv-no)
  $env:APV_NO = $latestApvNo + 1
  Write-Debug "The last published APV number: $latestApvNo; APV_NO will be:"
  Write-Information "  APV_NO = $env:APV_NO"
}

$passphrase = [Guid]::NewGuid().ToString()
$keyId = (
  "$(planet key import --passphrase="$passphrase" "$env:APV_SIGN_KEY")"
).Split(" ")[0]
$apv = "$(`
  planet apv sign `
    --passphrase="$passphrase" `
    --extra macOSBinaryUrl="$macOSBinaryUrl" `
    --extra WindowsBinaryUrl="$windowsBinaryUrl" `
    --extra timestamp="$([DateTimeOffset]::UtcNow.ToString("o"))" `
    "$keyId" `
    "$env:APV_NO" `
)"
Write-Host "$apv"
planet key remove --passphrase="$passphrase" "$keyId"
