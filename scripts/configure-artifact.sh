#!/usr/bin/env bash
if [ -z "$1" ]; then
  echo "No argument supplied, must have one of (windows, macos, linux)"
elif [ $1 == "windows" ]; then
  echo "OS_ALIAS=win32" >> $GITHUB_ENV
  echo "ARTIFACT=Windows.zip" >> $GITHUB_ENV
  echo "EXECUTABLE=." >> $GITHUB_ENV
  echo "ZIP_CMD=7z a -r" >> $GITHUB_ENV
elif [ $1 == "macos" ]; then
  echo "OS_ALIAS=darwin" >> $GITHUB_ENV
  echo "ARTIFACT=macOS.tar.gz" >> $GITHUB_ENV
  echo "EXECUTABLE='Nine Chronicles.app/Contents/Resources/app/9c.app/Contents/MacOS/9c'" >> $GITHUB_ENV
  echo "ZIP_CMD=tar cvfz" >> $GITHUB_ENV
elif [ $1 == "linux" ]; then
  echo "OS_ALIAS=linux" >> $GITHUB_ENV
  echo "ARTIFACT=Linux.tar.gz" >> $GITHUB_ENV
  echo "EXECUTABLE=resources/app/9c" >> $GITHUB_ENV
  echo "ZIP_CMD=tar cvfz" >> $GITHUB_ENV
else
  echo "Unsupported platform error: argument should be one of (windows, macos, linux)"
  exit 1;
fi
