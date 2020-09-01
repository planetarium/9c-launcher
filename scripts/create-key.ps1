$passphrase = [Guid]::NewGuid().ToString()
$keyId = (
  "$(npx planet key import --passphrase="$passphrase" $env:APV_SIGN_KEY.Trim())"
).Split(" ")[0]
$env:PASSWORD = $passphrase
Write-Output "PASSWORD=$passphrase" | Out-File -FilePath .env
