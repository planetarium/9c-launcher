#!/bin/bash
set -euo pipefail

ESIGNER_CREDENTIAL_ID=$1
ESIGNER_USERNAME=$2
ESIGNER_PASSWORD=$3
ESIGNER_TOTP_SECRET=$4
ROOT_DIR_PATH=$5
INPUT_FILE_PATH=$6
OUTPUT_DIR_PATH=$7

mkdir -p "$ROOT_DIR_PATH/tmp/beforeSign"
# electron-builder가 x64/arm64를 병렬로 sign할 때 tmp/beforeSign의
# 공유 경로 충돌로 원본 파일이 사라지는 race를 막기 위해 invocation마다 고유 디렉토리
BEFORE_SIGN_DIR=$(mktemp -d "$ROOT_DIR_PATH/tmp/beforeSign/sign.XXXXXX")
trap 'rm -rf "$BEFORE_SIGN_DIR"' EXIT

INPUT_FILE_NAME=$(basename "$INPUT_FILE_PATH")
BEFORE_SIGN_FILE_PATH="$BEFORE_SIGN_DIR/$INPUT_FILE_NAME"
mv "$INPUT_FILE_PATH" "$BEFORE_SIGN_FILE_PATH"

echo "Moved to temp: $BEFORE_SIGN_FILE_PATH"

cd "$ROOT_DIR_PATH/tmp/codesign"
./CodeSignTool.sh sign \
  -credential_id="$ESIGNER_CREDENTIAL_ID" \
  -username="$ESIGNER_USERNAME" \
  -password="$ESIGNER_PASSWORD" \
  -totp_secret="$ESIGNER_TOTP_SECRET" \
  -output_dir_path="$OUTPUT_DIR_PATH" \
  -input_file_path="$BEFORE_SIGN_FILE_PATH"

# CodeSignTool은 OUTPUT_DIR_PATH/<basename(input)>로 출력 → 원본 위치 그대로 복원됨
echo "Signed: $OUTPUT_DIR_PATH/$INPUT_FILE_NAME"
