#!/bin/bash
set -euo pipefail

ESIGNER_CREDENTIAL_ID=$1
ESIGNER_USERNAME=$2
ESIGNER_PASSWORD=$3
ESIGNER_TOTP_SECRET=$4
ROOT_DIR_PATH=$5
INPUT_FILE_PATH=$6
# 7번째 인자(OUTPUT_DIR_PATH)는 sign.js가 dirname(input)으로 넘기지만,
# 병렬 호출 시 동일 디렉토리에 출력 충돌이 발생할 수 있어 직접 사용하지 않는다.

mkdir -p "$ROOT_DIR_PATH/tmp/beforeSign"
# invocation별 고유 디렉토리: electron-builder가 같은 파일을 여러 번 부르거나
# x64/arm64를 병렬로 sign할 때의 tmp/beforeSign 충돌을 차단
BEFORE_SIGN_DIR=$(mktemp -d "$ROOT_DIR_PATH/tmp/beforeSign/sign.XXXXXX")
SIGNED_DIR="$BEFORE_SIGN_DIR/signed"
mkdir -p "$SIGNED_DIR"
trap 'rm -rf "$BEFORE_SIGN_DIR"' EXIT

INPUT_FILE_NAME=$(basename "$INPUT_FILE_PATH")
INPUT_FILE_EXT="${INPUT_FILE_NAME##*.}"
# 공백 없는 안전한 임시 이름 — CodeSignTool 인자 파싱이 공백에서 split되는 문제 회피
SAFE_NAME="forsigning.${INPUT_FILE_EXT}"
BEFORE_SIGN_FILE_PATH="$BEFORE_SIGN_DIR/$SAFE_NAME"
SIGNED_FILE_PATH="$SIGNED_DIR/$SAFE_NAME"

mv "$INPUT_FILE_PATH" "$BEFORE_SIGN_FILE_PATH"
echo "Moved to temp: $BEFORE_SIGN_FILE_PATH"

cd "$ROOT_DIR_PATH/tmp/codesign"
./CodeSignTool.sh sign \
  "-credential_id=$ESIGNER_CREDENTIAL_ID" \
  "-username=$ESIGNER_USERNAME" \
  "-password=$ESIGNER_PASSWORD" \
  "-totp_secret=$ESIGNER_TOTP_SECRET" \
  "-output_dir_path=$SIGNED_DIR" \
  "-input_file_path=$BEFORE_SIGN_FILE_PATH"

# CodeSignTool.sh wrapper가 내부 에러에도 exit 0으로 종료할 수 있어
# 출력 파일 존재로 명시적 검증 — 실패하면 set -e가 잡아냄
test -f "$SIGNED_FILE_PATH"

mv "$SIGNED_FILE_PATH" "$INPUT_FILE_PATH"
echo "Signed: $INPUT_FILE_PATH"
