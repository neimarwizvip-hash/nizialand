@echo off
title NISIALAND - servidor local
cd /d D:\Nisialand\nisialand-nova-versao\nisialand
echo Iniciando NISIALAND em http://localhost:5173 ...
echo (Feche esta janela para parar o servidor)
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:5173"
npm run dev -- --port 5173
pause
