#!/usr/bin/env bash
echo $1
if [ -z "$1" ]; then
  echo "No argument supplied, must have one of (windows, macos, linux)"
elif [ $1 == "windows" ]; then
  echo "export OS_ALIAS=win32" >> $BASH_ENV
  echo "export ARTIFACT=Windows.zip" >> $BASH_ENV
  echo "export EXECUTABLE=." >> $BASH_ENV
  echo "export ZIP_CMD='7zr a -r'" >> $BASH_ENV
elif [ $1 == "macos" ]; then
  echo "export OS_ALIAS=darwin" >> $BASH_ENV
  echo "export ARTIFACT=MacOS.tar.gz" >> $BASH_ENV
  echo "export EXECUTABLE='Nine Chronicles.app/Contents/Resources/app/9c.app/Contents/MacOS/9c'" >> $BASH_ENV
  echo "export ZIP_CMD='tar cvfz'" >> $BASH_ENV
elif [ $1 == "linux" ]; then
  echo "export OS_ALIAS=linux" >> $BASH_ENV
  echo "export ARTIFACT=Linux.tar.gz" >> $BASH_ENV
  echo "export EXECUTABLE=resources/app/9c" >> $BASH_ENV
  echo "export ZIP_CMD='tar cvfz'" >> $BASH_ENV
else
  echo "Unsupported platform error: argument should be one of (windows, macos, linux)"
  exit 1;
fi
