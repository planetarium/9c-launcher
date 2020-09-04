$passphrase = Get-Random
$keyId = (
  "$(npx planet key import --passphrase="$passphrase" $env:APV_SIGN_KEY.Trim())"
).Split(" ")[0]
Write-Output "PASSWORD=$passphrase" | Out-File -FilePath .env
Write-Host "$passphrase"
