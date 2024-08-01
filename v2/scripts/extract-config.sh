#!/bin/bash
set -e
archive="$1"

if [[ "$archive" = "" ]]; then
  {
    echo "usage: $0 PATH"
    echo
    echo "examples:"
    echo "  $0 path/to/Windows.zip > config.json"
    echo "  $0 path/to/macOS.tar.gz > config.json"
  } > /dev/stderr
elif [[ ! -f "$archive" ]]; then
  echo "error: no such archive file: $archive" > /dev/stderr
fi

if command -v jq > /dev/null; then
  function prettify-json {
    jq .
  }
elif command -v python3 > /dev/null; then
  function prettify-json {
    python3 -m json.tool
  }
elif command -v python > /dev/null; then
  function prettify-json {
    python -m json.tool
  }
else
  function prettify-json {
    cat /dev/stdin
  }
fi

if [[ "$archive" = *.zip ]]; then
  if command -v 7z > /dev/null; then
    7z e -so "$archive" resources/app/config.json | prettify-json
  elif command -v unzip > /dev/null; then
    unzip -p "$archive" resources/app/config.json | prettify-json
  else
    echo "error: at least one of 7z or unzip is required" > /dev/stderr
    exit 1
  fi
elif [[ "$archive" = *.tar.gz || "$archive" = *.tgz || "$archive" = *.tar.bz2 \
     || "$archive" = *.tbz || "$archive" = *.tar.xz || "$archive" = *.txz ]]
then
  if command -v tar > /dev/null; then
    tar xfO "$archive" Nine\ Chronicles.app/Contents/Resources/app/config.json \
      | prettify-json
  else
    echo "error: tar the software is required" > /dev/stderr
    exit 1
  fi
fi
