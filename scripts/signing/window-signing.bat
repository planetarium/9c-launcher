@echo off

set "ESIGNER_CREDENTIAL_ID=%1"
set "ESIGNER_USERNAME=%2"
set "ESIGNER_PASSWORD=%3"
set "ESIGNER_TOTP_SECRET=%4"
set "ROOT_DIR_PATH=%5"
set "INPUT_FILE_PATH=%6"
set "OUTPUT_DIR_PATH=%7"

if not exist "%ROOT_DIR_PATH%\tmp\beforeSign" mkdir "%ROOT_DIR_PATH%\tmp\beforeSign"

for %%F in ("%INPUT_FILE_PATH%") do set "INPUT_FILE_NAME=%%~nxF"
set "BEFORE_SIGN_FILE_NAME=forsigning.%INPUT_FILE_NAME%"
set "BEFORE_SIGN_FILE_PATH=%ROOT_DIR_PATH%\tmp\beforeSign%BEFORE_SIGN_FILE_NAME%"

move "%INPUT_FILE_PATH%" "%BEFORE_SIGN_FILE_PATH%"

echo Copy to before folder: %BEFORE_SIGN_FILE_PATH%
echo.

cd "%ROOT_DIR_PATH%\tmp\codesign"
CodeSignTool.bat sign -credential_id="%ESIGNER_CREDENTIAL_ID%" -username="%ESIGNER_USERNAME%" -password="%ESIGNER_PASSWORD%" -totp_secret="%ESIGNER_TOTP_SECRET%" -output_dir_path="%OUTPUT_DIR_PATH%" -input_file_path="%BEFORE_SIGN_FILE_PATH%"

echo Finish signing: %OUTPUT_DIR_PATH%%BEFORE_SIGN_FILE_NAME%
echo.

set "AFTER_SIGN_FILE_PATH=%OUTPUT_DIR_PATH%%BEFORE_SIGN_FILE_NAME%"
move "%AFTER_SIGN_FILE_PATH%" "%INPUT_FILE_PATH%"

echo Rename to final file: %AFTER_SIGN_FILE_PATH% -> %INPUT_FILE_PATH%
echo.
