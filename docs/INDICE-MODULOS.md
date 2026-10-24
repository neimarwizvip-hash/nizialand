# Índice de módulos (atualize ao criar/renomear arquivos)
Linhas aproximadas entre parênteses. Arquivos grandes: leia por trechos.

## Rotas (src/App.tsx)
/ StartScreen · /level0 ArcadeLevel0Screen · /historia Level0Screen · /orientation · /register ·
/missions MissionBriefingScreen · /quiz QuizScreen · /quiz/results · /flashcards · /results/final ·
/leaderboard · /admin AdminPanel ·
/nivel1 MissionBriefingScreen level=1 (RequireLevel1) · /nivel1/ouvir · /nivel1/montar · /nivel1/dialogo · /nivel1/explorar

## Telas (src/features)
- start/StartScreen (190) abertura
- level0/ArcadeLevel0Screen (716) Nível 0 arcade, Missões 1-2, Zé Cartinha
- level0/Level0Screen (759) história do nível 0
- orientation/OrientationScreen (508) · auth/RegistrationScreen (660) cadastro e avatar
- missions/MissionBriefingScreen (294) · quiz/QuizScreen · quiz/zeRules.ts (tempo 20 s + regras do Zé) · quiz/QuizResultsScreen (160)
- level1/ (Nível 1): ListenScreen, OrderScreen, DialogueScreen, ExploreScreen, ActivityShell (moldura + useZePop/useZeInterrupt),
  useActivityRun (cronômetro/pontos), level1Rules.ts (20 s/item, 100/50/0, ≤1000, armadilhas)
- flashcards/FlashcardScreen (519) · results/FinalResultsScreen (260)
- leaderboard/LeaderboardScreen (626) · admin/AdminPanel (656) · admin/QuestionBankManager (199)

## Componentes (src/components)
- layout: GameHeader, RequirePlayer, ScreenTransitionLoader
- ui: PlayerAvatar (AVATAR_CATALOG, skinToneFilter), AvatarFigure, AvatarSelector (304), Button,
  GameControls (LevelBadge), FullscreenButton, NisialandLogo, ConfettiEffect
- video/PhaseStoryGate (história antes da fase) · video/HqReuniaoGate (HQ "Reunião urgente" ao abrir /nivel1) · ze/ZeCartinha (antagonista)

## Lógica e dados
- core/types.ts (Mission, Level, ActivityResult) · core/events.ts (gameEvents)
- engines/progression/progress.ts (getLevelProgress, getNextMission)
- engines/pedagogy/adapters.ts (pontuação quiz/flashcard)
- content/level0.ts (definição das missões do nível 0) · content/level1.ts (atividades do nível 1)
- data/level0Content.ts (conteúdo por série 6º-9º) · data/level1Content.ts (nível 1 por série) · data/level2Content.ts (nível 2, fonte única) · data/questionBank.ts (332, banco de questões)
- data/quizQuestions.ts (281) · data/flashcardData.ts · data/mockData.ts (turmas, ranking inicial)
- context/GameContext.tsx (useGame, estado do jogador)
- services: audio.ts (534, trilhas e efeitos), storage.ts (522, localStorage/Supabase), fullscreen.ts,
  grade.ts (série do jogador), speech.ts (voz), nameModeration.ts, supabase.ts
- types/index.ts (PlayerProfile, QuizQuestion, XP)

## Outros
- features/level2: level2Rules.ts (regras puras: pontos, grade 8x8, duelo, ?atividade=) · useLevel2Run.ts (cronômetro 20 s, avanço 1,5 s, corrida 60 s) · Level2Shell.tsx (moldura, tempo, feedback, vitória+confete) · Level2Activities.tsx (6 telas, LEVEL2_ACTIVITY_VIEWS) · PatioScreen.tsx (/nivel2/patio, ?atividade=, trilhas)
- tests/*.test.ts (Vitest; tests/level1.test.ts = regras do nível 1); tests/level2.test.ts e tests/level2Fixes.test.tsx = nível 2 · supabase/schema.sql · public/assets (imagens, mp4, audio/)
- ASSET_MANIFEST.md: lista de mídia; consultar com Grep, não ler inteiro.
- docs/PLANO-NIVEIS-0-A-10.md: plano dos Níveis 0 a 10 (proposta, 24/10/2026).
