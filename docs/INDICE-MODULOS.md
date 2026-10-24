# Índice de módulos (atualize ao criar/renomear arquivos)
Linhas aproximadas entre parênteses. Arquivos grandes: leia por trechos.

## Rotas (src/App.tsx)
/ StartScreen · /level0 ArcadeLevel0Screen · /historia Level0Screen · /orientation · /register ·
/missions MissionBriefingScreen · /quiz QuizScreen · /quiz/results · /flashcards · /results/final ·
/leaderboard · /admin AdminPanel

## Telas (src/features)
- start/StartScreen (190) abertura
- level0/ArcadeLevel0Screen (716) Nível 0 arcade, Missões 1-2, Zé Cartinha
- level0/Level0Screen (759) história do nível 0
- orientation/OrientationScreen (508) · auth/RegistrationScreen (660) cadastro e avatar
- missions/MissionBriefingScreen (294) · quiz/QuizScreen (573) · quiz/QuizResultsScreen (160)
- flashcards/FlashcardScreen (519) · results/FinalResultsScreen (260)
- leaderboard/LeaderboardScreen (626) · admin/AdminPanel (656) · admin/QuestionBankManager (199)

## Componentes (src/components)
- layout: GameHeader, RequirePlayer, ScreenTransitionLoader
- ui: PlayerAvatar (AVATAR_CATALOG, skinToneFilter), AvatarFigure, AvatarSelector (304), Button,
  GameControls (LevelBadge), FullscreenButton, NisialandLogo, ConfettiEffect
- video/PhaseStoryGate (história antes da fase) · ze/ZeCartinha (antagonista)

## Lógica e dados
- core/types.ts (Mission, Level, ActivityResult) · core/events.ts (gameEvents)
- engines/progression/progress.ts (getLevelProgress, getNextMission)
- engines/pedagogy/adapters.ts (pontuação quiz/flashcard)
- content/level0.ts (definição das missões do nível 0)
- data/level0Content.ts (conteúdo por série 6º-9º) · data/questionBank.ts (332, banco de questões)
- data/quizQuestions.ts (281) · data/flashcardData.ts · data/mockData.ts (turmas, ranking inicial)
- context/GameContext.tsx (useGame, estado do jogador)
- services: audio.ts (534, trilhas e efeitos), storage.ts (522, localStorage/Supabase), fullscreen.ts,
  grade.ts (série do jogador), speech.ts (voz), nameModeration.ts, supabase.ts
- types/index.ts (PlayerProfile, QuizQuestion, XP)

## Outros
- tests/*.test.ts (Vitest) · supabase/schema.sql · public/assets (imagens, mp4, audio/)
- ASSET_MANIFEST.md: lista de mídia; consultar com Grep, não ler inteiro.
