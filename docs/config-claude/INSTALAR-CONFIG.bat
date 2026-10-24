@echo off
title Instalar configuracao de economia de tokens
set P=D:\NISIALAND\nisialand-nova-versao\nisialand
set C=%P%\docs\config-claude
mkdir "%P%\.claude\agents" 2>nul
mkdir "%P%\.claude\commands" 2>nul
mkdir "%P%\.vscode" 2>nul
mkdir "D:\NISIALAND\.claude" 2>nul
copy /Y "%C%\projeto-claude-settings.json" "%P%\.claude\settings.json"
copy /Y "%C%\buscador.md" "%P%\.claude\agents\buscador.md"
copy /Y "%C%\fechar-sessao.md" "%P%\.claude\commands\fechar-sessao.md"
copy /Y "%C%\projeto-vscode-settings.json" "%P%\.vscode\settings.json"
copy /Y "%C%\raiz-claude-settings.json" "D:\NISIALAND\.claude\settings.json"
echo.
echo Pronto. Configuracao instalada.
pause
