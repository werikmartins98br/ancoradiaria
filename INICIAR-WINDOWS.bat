@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 ou mais recente nao foi encontrado.
  echo Instale o Node.js e execute este arquivo novamente.
  pause
  exit /b 1
)
node scripts\serve-local.mjs
pause
