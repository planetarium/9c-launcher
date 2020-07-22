#!/bin/bash
set -e

if [[ "$APV" != "" ]]; then
  echo "APV is given; use \"$APV\" instead of generating new one..." \
    > /dev/stderr
  npm run --silent configure-apv "$APV"
  exit $?
elif [[ "$SKIP_APV_SIGN" != "" ]]; then
  echo "Skip APV signing..."
  exit 0
fi

# shellcheck disable=SC1090
. "$(dirname "$0")/make-apv.sh"

# shellcheck disable=SC2154
npm run --silent configure-apv "$apv"
