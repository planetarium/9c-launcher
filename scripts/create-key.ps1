$passphrase = Get-Random
$privateKey = "$(npx planet key generate -A)"
npx planet key import --passphrase="$passphrase" "$privateKey"
Write-Output "PASSWORD=$passphrase" | Out-File -FilePath .env -Encoding UTF8
