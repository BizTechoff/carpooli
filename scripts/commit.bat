@echo off
chcp 65001 > nul
setlocal

cd /d "%~dp0\.."

if not exist ".git" (
  echo === git init ===
  git init
  git branch -M main
  echo.
)

echo === git status ===
git status
echo.

echo === git add . ===
git add .
echo.

echo === git commit ===
git commit -F scripts/commit-message.txt

echo.
echo === done ===
pause
