# NISIALAND (jogo de inglês, E. M. Nísia Vilela Fernandes)
React 18 + TS + Vite + Tailwind. Testes: Vitest. Supabase opcional. Deploy: Cloudflare Pages.
Dono: Oliveira (responder em português).

## Economia de contexto (obrigatório)
- Antes de abrir arquivos, consulte `docs/INDICE-MODULOS.md` e localize com Grep/Glob.
- Leia só o trecho necessário (offset/limit). Nunca leia arquivos inteiros acima de 300 linhas sem necessidade.
- Para ver o que mudou use `git status --short` e `git diff -- <arquivo>`; não releia o que não mudou.
- Não abra: `node_modules/`, `dist/`, `package-lock.json`, mídia (`*.mp4 *.mp3 *.ogg *.zip`), legado (`app.js`, `style.css`, `index.legacy.html`), `../../backups/`.
- Não crie subagentes para tarefas simples. Buscas amplas: use o agente `buscador` (modelo econômico).
- Respostas curtas; não repita código já mostrado, mostre só o diff.
- Decisões de arquitetura ficam em `docs/DECISOES.md` (atualize ao decidir algo novo).

## Comandos
- Dev: `npm run dev -- --port 5173` (ou INICIAR-NISIALAND.bat)
- Testes: `npx vitest run tests/<arquivo>` (rode só o teste afetado; suíte toda no fim)
- Tipos: `npx tsc --noEmit`

## Regras do projeto
- Roteiros das histórias são do Oliveira: usar o texto literal, nunca encurtar.
- Tela cheia sempre; sem zooms nem personagens voando/deslizando.
- Sem música sob narração.
- Navegador de teste (Playwright/headless): SEMPRE fechar ao terminar (o áudio continua tocando).
