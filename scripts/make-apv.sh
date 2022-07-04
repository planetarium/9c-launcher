#!/bin/bash
set -e

if [[ "$APV_SIGN_KEY" = "" ]]; then
  echo "APV_SIGN_KEY is not configured." > /dev/stderr
  exit 1
elif command -v npx > /dev/null && \
     npx --no-install -q planet --version > /dev/null; then
  function planet {
    npx --no-install -q planet "$@"
  }
elif ! command -v planet > /dev/null; then
  {
    echo "The planet command does not exist."
    echo "Please install Libplanet.Tools first:"
    echo "  dotnet tool install --global Libplanet.Tools"
  } > /dev/stderr
  exit 1
fi

if [[ "$APV_NO" = "" ]]; then
  echo "APV_NO is not configured; query S3 about the latest APV_NO..." \
    > /dev/stderr
  latest_apv_no="$(npm run --silent latest-apv-no)"
  APV_NO="$((latest_apv_no + 1))"
  {
    echo "The last published APV number: $latest_apv_no; APV_NO will be:"
    echo "  APV_NO=$APV_NO"
  } > /dev/stderr
fi

default_url_base=https://download.nine-chronicles.com/v
macos_url="${APV_MACOS_URL:-$default_url_base$APV_NO/macOS.tar.gz}"
linux_url="${APV_LINUX_URL:-$default_url_base$APV_NO/Linux.tar.gz}"
windows_url="${APV_WINDOWS_URL:-$default_url_base$APV_NO/Windows.zip}"

passphrase="$(tr -dc 'a-zA-Z0-9' < /dev/urandom | fold -w 32 | head -n 1)"
key_id="$(planet key import --passphrase="$passphrase" "${APV_SIGN_KEY%%*( )}" \
          | awk '{print $1}')"
apv="$( \
  planet apv sign \
    --passphrase="$passphrase" \
    --extra macOSBinaryUrl="$macos_url" \
    --extra LinuxBinaryUrl="$linux_url" \
    --extra WindowsBinaryUrl="$windows_url" \
    --extra timestamp="$(date --iso-8601=sec)" \
    "$key_id" \
    "$APV_NO"
)"
echo "$apv"
planet key remove --passphrase="$passphrase" "$key_id"
