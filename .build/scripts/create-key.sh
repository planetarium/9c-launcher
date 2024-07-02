passphrase="$(tr -dc 'a-zA-Z0-9' < /dev/random | fold -w 32 | head -n 1)"
private_key="$(npx planet key generate -A)"
npx planet key import --passphrase="$passphrase" "$private_key" &>/dev/null
echo "PASSWORD=$passphrase" > .env
