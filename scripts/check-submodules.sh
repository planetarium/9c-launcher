#!/usr/bin/env bash
set -eou pipefail

function escape {
  v="$1"
  v="${v//%/%25}"
  v="${v//$'\n'/%0A}"
  v="${v//$'\r'/%0D}"
  echo -n "$v"
}

function log {
  msg_type="$1"
  title="$2"
  if [[ -t 0 ]]; then
    case "$msg_type" in
    "error")
      echo -ne '\033[0;31m'
      ;;
    "warning")
      echo -ne '\033[0;33m'
      ;;
    "notice")
      echo -ne '\033[0;32m'
      ;;
    esac >&2
  fi
  echo "$title:" >&2
  for line in "${@:3}"; do
    echo "  $line" >&2
  done
  if [[ -t 0 ]]; then
    case "$msg_type" in
    "error" | "warning" | "notice")
      echo -ne '\033[0m'
      ;;
    esac >&2
  fi
  if declare -p CI &> /dev/null && \
     [[ "$CI" = "true" && "$GITHUB_ACTION" != "" ]]; then
    echo -n "::$msg_type title="
    escape "$title"
    echo -n ::
    for line in "${@:3}"; do
      escape "$line"
      echo -n %0A
    done
    echo
  fi
}

function notice {
  log notice "$@"
}

function warning {
  log warning "$@"
}

function error {
  log error "$@"
}

function get-tree-hash {
  git -C "$1" rev-parse HEAD:
}

function get-commit-hash {
  git -C "$1" rev-parse HEAD
}

function compare-trees {
  commit_hash_1="$(get-commit-hash "$1")"
  commit_hash_2="$(get-commit-hash "$2")"
  if [[ "$commit_hash_1" = "$commit_hash_2" ]]; then
    notice "The following two submodules refer to the SAME commit" \
      "$commit_hash_1: $1" \
      "$commit_hash_2: $2"
    return 0
  else
    warning "The following submodules refer to DIFFERENT commits" \
      "$commit_hash_1: $1" \
      "$commit_hash_2: $2"
  fi

  tree_hash_1="$(get-tree-hash "$1")"
  tree_hash_2="$(get-tree-hash "$2")"
  if [[ "$tree_hash_1" = "$tree_hash_2" ]]; then
    notice "Their trees are still EQUIVALENT though" \
      "$tree_hash_1: $1" \
      "$tree_hash_2: $2"
    return 0
  else
    error "And their trees also are DIFFERENT" \
      "$tree_hash_1: $1" \
      "$tree_hash_2: $2"
    return 1
  fi
}

fail=0
compare-trees \
  NineChronicles/nekoyume/Assets/_Scripts/Lib9c/lib9c \
  NineChronicles.Headless/Lib9c \
  || fail=1

compare-trees \
  NineChronicles/nekoyume/Assets/_Scripts/NineChronicles.RPC.Shared \
  NineChronicles.Headless/NineChronicles.RPC.Shared \
  || fail=1

exit $fail
