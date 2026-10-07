@echo off
cd /d "%~dp0"
git add -A
git commit -m "atualizacao do site"
git push
echo.
echo Enviado! A Vercel publica em ~1 minuto.
pause
