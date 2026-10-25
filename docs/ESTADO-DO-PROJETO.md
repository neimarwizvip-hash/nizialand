# Estado do projeto — 25/10/2026 (análise só de leitura, sobrescrita a cada reinício)

## Git
- Branch `main` = `origin/main` (e42be84). Nada à frente: o 7543d5f já está no GitHub.
- Últimos commits (autor neimarwizvip-hash): e42be84 histórias provisórias + rotas do Nível 4 (25/10 05:01) · dad1203 Níveis 3 e 4 jogáveis (25/10) · 7543d5f vistoria fora do build (24/10) · 75b7f2e · 76456d0 mapa + níveis 2–7 · 10d2c37 deploy Cloudflare · c57a7db Nível 2 pátio 2D · 0f3c8bd · 0d2bc05 · 054c51f.
- Sem reset ou rebase no reflog. Existe um worktree antigo: `claude/affectionate-diffie-280a90` (Node 20 / Cloudflare).
- Arquivos não commitados:
  - **Nível 2:** `App.tsx`, `Level2WorldScreen.tsx`. A rota /nivel2/patio volta a ser o pátio 2D; /nivel2/atividades redireciona para ela; o 3D ficou só em /nivel2/mundo3d.
  - **Vistoria:** `VistoriaScreen.tsx`, `PhaseMissionScreen.tsx`, `ChoicesMissionScreen.tsx`. Acrescentam os Níveis 3–7 e liberam todas as atividades no modo vistoria.
  - **Protótipo:** `public/prototipos/primeiro-pavimento-3d.html` e `tests/firstFloorWorld.test.ts`. A restauração aguarda o OK do Oliveira.
  - **Docs:** `INDICE-MODULOS.md`.
  - **Novo:** `src/data/level3Mane.ts` (falas provisórias do Mané).
- `package.json`: nenhuma alteração pendente (a mudança do three já está commitada).

## Última tarefa: Mané Zoeira no Nível 3 — CONCLUÍDA (não commitada)
- Corredor (sprite + balão), salas (canto: início + 1 dica), cabeçalho do Modo simples; falas provisórias em `src/data/level3Mane.ts`.
- Conferido no navegador mudo em 1920x1080 e 812x375: balões não cobrem respostas nem botões.

## Níveis 0–10
| Nível | Rota | Estado |
|---|---|---|
| 0 | /level0 | pronto (desvio das distrações do Zé) |
| 1 | /nivel1 (ouvir, montar, diálogo, explorar) | pronto |
| 2 | /nivel2/patio | pátio 2D com 6 atividades, cronômetro, Zé; protótipo 3D opcional em /nivel2/mundo3d |
| 3 | /nivel3/salas | corredor 3D + 6 salas jogáveis + Mané Zoeira |
| 4 | /nivel4/equipe | jogável (rotas/wayfinding, perguntas) |
| 5 | /nivel5/escolhas | parcial (1 pergunta por atividade) |
| 6 | /nivel6/consequencias | parcial (1 pergunta por atividade) |
| 7 | /nivel7/organizacao | parcial; ao concluir, mostra "Nível 8 em breve" |
| 8–10 | — | planejados (docs/PLANO-NIVEIS-0-A-10.md) |

- **Vistoria**, já com as alterações não commitadas: início, história, Nível 0, orientação, missões, Nível 1, Nível 2 (pátio e 3D), Níveis 3–7 (tela da missão e cada atividade), quiz, flashcards e mapa.

## Mudanças de outros agentes
- O e42be84 (05:01) mexeu em `Corridor3D.tsx`, `ClassroomScreen.tsx` e `TeamMissionScreen.tsx` e adicionou `ProvisionalStoryGate`. Não desfaz trabalho anterior.
- Regras conferidas:
  - Nível 2 é o pátio 2D: correto no código não commitado; no commit atual, /nivel2/patio ainda abre o 3D.
  - A tela de início tem Mané (`mane_zoeira`) e Rosana (`rosana.png`).

## Verificações
- 5173 rodando (PID 33392). 5181 parado.
- `tsc` OK · vitest **20 arquivos / 135 testes passando** · `npm run build` OK.

## Pendências
1. ~~Restaurar `primeiro-pavimento-3d.html`~~: feito (OK do Oliveira, 25/10).
2. Secrets do GitHub para o deploy no Cloudflare (`CLOUDFLARE_API_TOKEN` / `ACCOUNT_ID`): o Oliveira cadastra.
3. ~~Commitar Nível 2 em 2D, vistoria 3–7 e Mané~~: feito (OK do Oliveira, 25/10).
