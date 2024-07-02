#!/bin/bash
set -e
archive="$1"

if [[ "$archive" = "" ]]; then
  {
    echo "usage: $0 PATH"
    echo
    echo "examples:"
    echo "  $0 path/to/Windows.zip < config.json"
    echo "  $0 path/to/macOS.tar.gz < config.json"
  } > /dev/stderr
elif [[ ! -f "$archive" ]]; then
  echo "error: no such archive file: $archive" > /dev/stderr
fi

if [[ "$archive" = *.zip ]]; then
  archive="$(realpath "$archive")"
  tmpdir="$(mktemp -d)"
  pushd "$tmpdir"
  mkdir -p resources/app/
  cat /dev/stdin > resources/app/config.json
  if command -v 7z > /dev/null; then
    7z d "$archive" resources/app/config.json
    7z a "$archive" resources/app/config.json
  elif command -v zip > /dev/null; then
    zip -d "$archive" resources/app/config.json
    zip -u "$archive" resources/app/config.json
  else
    echo "error: at least one of 7z or zip is required" > /dev/stderr
    exit 1
  fi
  popd
  rm -rf "$tmpdir"
elif [[ "$archive" = *.tar.gz || "$archive" = *.tgz || "$archive" = *.tar.bz2 \
     || "$archive" = *.tbz || "$archive" = *.tar.xz || "$archive" = *.txz ]]
then
  if ! command -v tar > /dev/null; then
    echo "error: tar the software is required" > /dev/stderr
    exit 1
  fi
  if [[ "$archive" = *.tar.bz2 || "$archive" = *.tbz ]]; then
    comp=bzip2
  elif [[ "$archive" = *.tar.xz || "$archive" = *.txz ]]; then
    comp=xz
  else
    comp=gzip
  fi
  if command -v "$comp" > /dev/null; then
    tmpdir="$(mktemp -d)"
    tmptar="$tmpdir/macOS.tar"
    "$comp" -cd "$archive" > "$tmptar"
    pushd "$tmpdir"
    mkdir -p Nine\ Chronicles.app/Contents/Resources/app/
    cat /dev/stdin > Nine\ Chronicles.app/Contents/Resources/app/config.json
    tar rf "$tmptar" Nine\ Chronicles.app/Contents/Resources/app/config.json
    popd
    "$comp" < "$tmptar" > "$archive"
    rm -rf "$tmpdir"
  else
    echo "error: $comp the software is required" > /dev/stderr
    exit 1
  fi
fi
