@echo off
setlocal enabledelayedexpansion

set "ESIGNER_CREDENTIAL_ID=%~1"
set "ESIGNER_USERNAME=%~2"
set "ESIGNER_PASSWORD=%~3"
set "ESIGNER_TOTP_SECRET=%~4"
set "ROOT_DIR_PATH=%~5"
set "INPUT_FILE_PATH=%~6"
set "OUTPUT_DIR_PATH=%~7"

if not exist "%ROOT_DIR_PATH%\tmp\beforeSign" mkdir "%ROOT_DIR_PATH%\tmp\beforeSign"

REM electron-builder가 병렬로 sign 훅을 호출할 때의 path 충돌을 피하기 위해
REM invocation마다 고유 디렉토리를 만든다 (%RANDOM% 두 번 + %TIME%)
set "BEFORE_SIGN_DIR=%ROOT_DIR_PATH%\tmp\beforeSign\sign-%RANDOM%-%RANDOM%-%TIME::=%"
set "BEFORE_SIGN_DIR=%BEFORE_SIGN_DIR: =0%"
mkdir "%BEFORE_SIGN_DIR%" || exit /b 1

for %%F in ("%INPUT_FILE_PATH%") do set "INPUT_FILE_NAME=%%~nxF"
set "BEFORE_SIGN_FILE_PATH=%BEFORE_SIGN_DIR%\%INPUT_FILE_NAME%"

move "%INPUT_FILE_PATH%" "%BEFORE_SIGN_FILE_PATH%" || exit /b 1

echo Moved to temp: %BEFORE_SIGN_FILE_PATH%
echo.

cd /d "%ROOT_DIR_PATH%\tmp\codesign"
call CodeSignTool.bat sign -credential_id="%ESIGNER_CREDENTIAL_ID%" -username="%ESIGNER_USERNAME%" -password="%ESIGNER_PASSWORD%" -totp_secret="%ESIGNER_TOTP_SECRET%" -output_dir_path="%OUTPUT_DIR_PATH%" -input_file_path="%BEFORE_SIGN_FILE_PATH%"
if errorlevel 1 exit /b 1

REM CodeSignTool은 OUTPUT_DIR_PATH/<basename(input)>로 출력 → 원본 위치 그대로 복원됨
echo Signed: %OUTPUT_DIR_PATH%\%INPUT_FILE_NAME%

rmdir /s /q "%BEFORE_SIGN_DIR%"
