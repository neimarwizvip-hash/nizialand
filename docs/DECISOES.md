# Decisões de arquitetura e design (curto; uma linha por decisão)
- 2026-10-23 Cada nível abre com história narrada curta, depois a missão. Nível 0 é geral e tem Missões 1 e 2, com atividades por série (6º-9º).
- 2026-10-23 Zé Cartinha é o antagonista (embaralha cartas, jogo do "bafo"). Outros personagens em níveis futuros.
- 2026-10-23 Som: abertura com tema próprio; cada história com progressão própria; Nível 0 com tema linear de fundo; cada desafio com trilha própria; sem música sob narração.
- 2026-10-23 Tela cheia em todo o jogo; sem zoom nem personagens voando/deslizando.
- Pendente (D8): dono do Supabase e autorização da escola.
- 2026-10-23 Backend = Google Planilha via Apps Script (src/config/backend.ts, services/planilha.ts) no lugar do Supabase; arquivos do Supabase ficam, sem uso. Local primeiro: tudo salva neste computador e vai para a fila `nisialand_planilha_fila`, enviada em ordem quando há conexão (melhor resultado por atividade). Visitantes nunca são enviados.
- 2026-10-23 Entrar pelo código tenta a planilha e cai no local; ranking vem da planilha (cache 30 s) ou do local, com aviso discreto. Códigos novos: NSL-<turma>-XXXX (4 aleatórios); antigos seguem valendo.
- 2026-10-23 Painel do professor: sem senha no código; profEntrar devolve token guardado só no sessionStorage; lista/apagar/zerar pelas ações prof*; sem conexão mostra "Sem conexão com a planilha".
