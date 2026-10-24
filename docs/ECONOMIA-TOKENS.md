# Economia de tokens no NISIALAND (Claude Code e Antigravity)

## Diagnóstico (23/10/2026)
O código do jogo é pequeno (cerca de 11 mil linhas em src/ e tests/). O consumo alto vem do ambiente ao redor:
1. **Pasta D:\NISIALAND tem ~1 GB de lixo para a IA**: dois node_modules (340 MB cada), backups (247 MB), nisialand.zip (70 MB), dist (71 MB), mídia em public (45 MB) e uma cópia antiga do app na raiz. Abrir a IA na raiz convida a varrer tudo isso.
2. **Arquivos legados grandes dentro do projeto novo**: app.js (69 KB), style.css (52 KB), index.legacy.html (39 KB), package-lock.json (194 KB), ASSET_MANIFEST.md (16 KB). Uma leitura de cada já custa dezenas de milhares de tokens.
3. **Não havia CLAUDE.md nem índice**: cada sessão nova redescobria a estrutura lendo arquivos.
4. **Telas com 500-760 linhas** (Level0Screen, ArcadeLevel0Screen, RegistrationScreen, AdminPanel...): relidas inteiras a cada ajuste.
5. **Testes com navegador e capturas de tela**: cada screenshot é uma imagem no contexto; loops de "testa, olha, ajusta" multiplicam isso.
6. **Sessões longas**: o histórico inteiro é reenviado a cada mensagem. Esse é normalmente o maior fator.

## O que foi instalado
No projeto (D:\NISIALAND\nisialand-nova-versao\nisialand):
- `CLAUDE.md` curto (regras de contexto + regras do jogo). É carregado em toda sessão e fica no cache de prompt.
- `docs/INDICE-MODULOS.md`: mapa de rotas, telas, serviços e dados com tamanho em linhas.
- `docs/DECISOES.md`: decisões de design/arquitetura que valem entre sessões.
- `.agent/rules/nisialand.md`: as mesmas regras para o Antigravity.
- Na raiz D:\NISIALAND: `CLAUDE.md` avisando que o projeto ativo é a subpasta.
- `docs/config-claude/INSTALAR-CONFIG.bat` (rodar uma vez, com dois cliques). Instala:
  - `.claude/settings.json`: bloqueia leitura de node_modules, dist, lock, mídia e legado; libera git diff/status e testes sem pedir permissão.
  - `.claude/agents/buscador.md`: subagente só de busca no modelo Haiku, que devolve só `arquivo:linha`.
  - `.claude/commands/fechar-sessao.md`: comando `/fechar-sessao` que registra decisões, atualiza o índice e fecha o navegador de teste.
  - `.vscode/settings.json`: tira node_modules, dist, mídia e legado da busca do Antigravity.
  - `D:\NISIALAND\.claude\settings.json`: mesmos bloqueios para quem abrir na raiz.

## Hábitos que mais economizam (por ordem de impacto)
1. **Abra sempre na pasta do projeto** (`nisialand-nova-versao\nisialand`), nunca em D:\NISIALAND.
2. **Uma tarefa por sessão.** Terminou? `/fechar-sessao` e depois `/clear`. Histórico longo é o maior custo.
3. **`/compact`** quando a sessão passar de ~50% do contexto e você precisar continuar.
4. **Modelo certo**: `/model sonnet` para o dia a dia; Opus só para arquitetura ou bug difícil; Haiku para buscas e textos simples. No Antigravity, o mesmo princípio no seletor de modelo.
5. **Peça com endereço**: "em ArcadeLevel0Screen, função X" em vez de "arruma o nível 0".
6. **Testes com navegador só no fim** de um bloco de mudanças, com poucas capturas, e sempre fechando o navegador.
7. **`/cost`** (ou `/usage`) de vez em quando para ver onde está o gasto.
8. **Não cole arquivos ou logs inteiros** no chat; cole só o erro.

## Recomendações para depois (mexem no código, combinar com a outra frente)
- Mover app.js, style.css e index.legacy.html para uma pasta `legado/` fora do projeto.
- Dividir telas com mais de 500 linhas em componentes menores (lê-se só a parte que muda).
- Tirar nisialand.zip, backups e o app antigo da raiz de D:\NISIALAND para outra pasta.
