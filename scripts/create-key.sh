if command -v node > /dev/null; then
  passphrase="$(node -e 'console.log(Math.random())')"
else
  passphrase="$(tr -dc 'a-zA-Z0-9' < /dev/random | fold -w 32 | head -n 1)"
fi
key_id="$(npx planet key import --passphrase="$passphrase" "${APV_SIGN_KEY%%*( )}" \
          | awk '{print $1}')"
echo "PASSWORD=$passphrase" > .env
