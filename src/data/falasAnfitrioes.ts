// PROVISÓRIO – roteiro final do Oliveira.
// Falas dos anfitriões por nível e por momento. Trocar os textos aqui sem mexer nos componentes.
// Cada fala tem a frase em português (falada em pt-BR) e a frase curta em inglês (falada em en-US em seguida).
// `{nome}` vira o nome do aluno; `{missao}` vira o título da missão; `{proxima}` vira a próxima atividade/estação.

import type { NomeAnfitriao } from '../components/kit/Anfitriao';

export interface Fala { pt: string; en: string }
export type Momento = 'semSerie' | 'apresenta' | 'meio' | 'concluido' | 'certo' | 'errado' | 'volta';

export interface RoteiroNivel {
  anfitriao: NomeAnfitriao;
  falas: Record<Momento, Fala[]>;
}

// Voz de cada personagem (Web Speech): tom e velocidade.
export const VOZ: Record<NomeAnfitriao, { pitch: number; rate: number }> = {
  marcio: { pitch: 0.85, rate: 1.0 },
  leia: { pitch: 1.1, rate: 0.98 },
  vania: { pitch: 1.05, rate: 1.05 },
  rosana: { pitch: 1.15, rate: 1.0 },
  mane: { pitch: 1.35, rate: 1.15 },
  ze: { pitch: 1.4, rate: 1.1 },
};

export const ROTEIRO: Record<number, RoteiroNivel> = {
  0: {
    anfitriao: 'marcio',
    falas: {
      semSerie: [{ pt: 'Olá, {nome}! Eu sou o Diretor Márcio. Antes de começar, me diga: em que série você está?', en: 'Hello! What grade are you in?' }],
      apresenta: [
        { pt: 'Bem-vindo à NISIALAND, {nome}! Sua primeira missão é desviar das distrações do Zé Cartinha. Mostre que você consegue se concentrar.', en: 'Welcome to NISIALAND! Stay focused!' },
        { pt: 'Lembre-se, {nome}: o Zé vai tentar atrapalhar. Respire fundo, leia com calma e responda.', en: 'Take a deep breath and answer.' },
      ],
      meio: [{ pt: 'Metade feita, {nome}! Agora vem: {proxima}. Vamos terminar bem.', en: 'Halfway there! Keep going.' }],
      concluido: [{ pt: 'Missão zero completa, {nome}! Você passou pelo Zé Cartinha. A escola inteira está orgulhosa.', en: 'Mission complete! Well done!' }],
      certo: [{ pt: 'Isso! Resposta certa.', en: 'Correct!' }, { pt: 'Muito bem, {nome}.', en: 'Very good!' }],
      errado: [{ pt: 'Calma. Leia de novo e tente outra vez.', en: 'Read it again and try once more.' }],
      volta: [{ pt: 'Que bom ver você de volta, {nome}. Vamos continuar de onde parou.', en: 'Good to see you again!' }],
    },
  },
  1: {
    anfitriao: 'leia',
    falas: {
      semSerie: [{ pt: 'Oi, {nome}! Eu sou a Leia, da orientação. Me conte em que série você está para eu preparar as atividades.', en: 'Hi! What grade are you in?' }],
      apresenta: [
        { pt: 'Na nossa escola, as regras existem para todo mundo conviver bem. Vamos aprender a ouvir, montar, conversar e explorar. Leia! Know the rules, learn and go further!', en: 'Know the rules, learn and go further!' },
        { pt: 'Cada atividade libera a próxima, {nome}. Comece ouvindo o meu recado com atenção.', en: 'Listen carefully to my message.' },
      ],
      meio: [{ pt: 'Você está indo bem, {nome}. A próxima é {proxima}.', en: 'You are doing well!' }],
      concluido: [{ pt: 'As regras agora são suas também, {nome}. Missão um completa! Pode seguir para o pátio.', en: 'Mission one complete! Go to the playground.' }],
      certo: [{ pt: 'Perfeito, você entendeu o recado.', en: 'Perfect!' }],
      errado: [{ pt: 'Quase. Ouça mais uma vez e pense na regra.', en: 'Almost. Listen once more.' }],
      volta: [{ pt: 'Voltou, {nome}? Ótimo. As regras continuam esperando por você.', en: 'Welcome back!' }],
    },
  },
  2: {
    anfitriao: 'vania',
    falas: {
      semSerie: [{ pt: 'Olá, {nome}! Sou a coordenadora Vânia. Em que série você está?', en: 'Hello! What grade are you in?' }],
      apresenta: [
        { pt: 'No pátio a gente aprende a pedir com educação e a respeitar quem cuida da escola. Vá até cada estação; eu organizo tudo por aqui.', en: 'Go to each station. Ask politely!' },
        { pt: 'Sua próxima estação é {proxima}, {nome}. Ande até ela e toque na placa.', en: 'Go to the next station.' },
      ],
      meio: [{ pt: 'Boa, {nome}! Agora {proxima}. O pátio está quase todo visitado.', en: 'Great! Next station.' }],
      concluido: [{ pt: 'Pátio completo, {nome}! Você pediu, ouviu e respeitou. Missão dois concluída.', en: 'All stations done! Mission two complete.' }],
      certo: [{ pt: 'Isso mesmo, com educação a gente chega longe.', en: 'That is right!' }],
      errado: [{ pt: 'Hum, não foi dessa vez. Olhe a resposta certa e siga.', en: 'Not this time. Check the answer.' }],
      volta: [{ pt: 'De volta ao pátio, {nome}? A próxima estação é {proxima}.', en: 'Welcome back to the playground!' }],
    },
  },
  3: {
    anfitriao: 'rosana',
    falas: {
      semSerie: [{ pt: 'Oi, {nome}! Sou a professora Rosana. Qual é a sua série?', en: 'Hi! What grade are you in?' }],
      apresenta: [{ pt: 'Hoje é dia de conviver bem em sala. Entre em cada sala do corredor, arrume, responda e revise. O Mané vai junto, mas a resposta é sua.', en: 'Enter each classroom. The answer is yours!' }],
      meio: [{ pt: 'Mais uma sala, {nome}: {proxima}.', en: 'One more classroom!' }],
      concluido: [{ pt: 'Todas as salas arrumadas, {nome}! Conviver bem também é inglês. Missão três completa.', en: 'All classrooms done! Mission three complete.' }],
      certo: [{ pt: 'Muito bem! Pode seguir.', en: 'Well done!' }],
      errado: [{ pt: 'Vamos pensar juntos: leia a frase inteira.', en: 'Read the whole sentence.' }],
      volta: [{ pt: 'Bem-vindo de volta ao corredor, {nome}.', en: 'Welcome back!' }],
    },
  },
  4: {
    anfitriao: 'mane',
    falas: {
      semSerie: [{ pt: 'E aí, {nome}! Mané na área. Qual é a sua série, parceiro?', en: 'Hey! What grade are you in?' }],
      apresenta: [{ pt: 'Trabalho em equipe, hein? Eu ajudo a procurar as pistas, mas quem responde é você. Bora pela escola toda!', en: 'Teamwork! Let us go around the school!' }],
      meio: [{ pt: 'Tamo junto, {nome}! Próxima parada: {proxima}.', en: 'Next stop!' }],
      concluido: [{ pt: 'Equipe completa, {nome}! Até eu, que só atrapalho, aprendi alguma coisa. Missão quatro feita!', en: 'Mission four complete! Great team!' }],
      certo: [{ pt: 'Aê! Essa foi na mosca.', en: 'Yes! Nailed it.' }],
      errado: [{ pt: 'Ih, errou. Relaxa, olha a certa e vem comigo.', en: 'Oops. Check the right one.' }],
      volta: [{ pt: 'Voltou, {nome}? Eu guardei o seu lugar na equipe.', en: 'Welcome back, teammate!' }],
    },
  },
  5: {
    anfitriao: 'leia',
    falas: {
      semSerie: [{ pt: 'Oi de novo, {nome}! Em que série você está?', en: 'Hi again! What grade are you in?' }],
      apresenta: [{ pt: 'Agora a missão é sobre as suas escolhas. Não existe resposta por impulso aqui: pense, decida e explique o porquê.', en: 'Think, decide and explain why.' }],
      meio: [{ pt: 'Boa decisão, {nome}. Agora {proxima}.', en: 'Good choice. Next one.' }],
      concluido: [{ pt: 'Você refletiu e decidiu, {nome}. Missão cinco completa.', en: 'Mission five complete!' }],
      certo: [{ pt: 'Escolha certa, e bem explicada.', en: 'Right choice!' }],
      errado: [{ pt: 'Vamos ver juntos qual seria a melhor escolha.', en: 'Let us see the best choice.' }],
      volta: [{ pt: 'Voltou para decidir mais, {nome}? Ótimo.', en: 'Welcome back!' }],
    },
  },
  6: {
    anfitriao: 'marcio',
    falas: {
      semSerie: [{ pt: 'Olá, {nome}. Diretor Márcio de novo. Em que série você está?', en: 'Hello again! What grade are you in?' }],
      apresenta: [{ pt: 'Toda escolha tem consequência, para você e para os colegas. Nesta missão vamos ver o que acontece depois de cada decisão.', en: 'Every choice has a consequence.' }],
      meio: [{ pt: 'Continue, {nome}. Próxima: {proxima}.', en: 'Keep going.' }],
      concluido: [{ pt: 'Missão seis completa, {nome}. Você já enxerga o efeito das suas escolhas.', en: 'Mission six complete!' }],
      certo: [{ pt: 'Exato. Causa e efeito.', en: 'Exactly. Cause and effect.' }],
      errado: [{ pt: 'Pense no que aconteceria depois. Veja a resposta.', en: 'Think about what happens next.' }],
      volta: [{ pt: 'Bem-vindo de volta, {nome}.', en: 'Welcome back!' }],
    },
  },
  7: {
    anfitriao: 'vania',
    falas: {
      semSerie: [{ pt: 'Oi, {nome}! Vânia aqui. Em que série você está?', en: 'Hi! What grade are you in?' }],
      apresenta: [{ pt: 'Chegou a hora de se organizar: material, rotina, aula, grupo e estudo. Quem se organiza chega mais longe, e em inglês também.', en: 'Time to get organized!' }],
      meio: [{ pt: 'Organizado, {nome}! Agora {proxima}.', en: 'Well organized! Next.' }],
      concluido: [{ pt: 'Missão sete completa, {nome}! Você aprendeu a se organizar. Agora o Nível oito: organizado na prática.', en: 'Mission seven complete! Level eight is open.' }],
      certo: [{ pt: 'Perfeito, tudo no lugar.', en: 'Perfect!' }],
      errado: [{ pt: 'Quase. Veja a ordem certa.', en: 'Almost. Check the right order.' }],
      volta: [{ pt: 'De volta, {nome}? Sua agenda está esperando.', en: 'Welcome back!' }],
    },
  },
  8: {
    anfitriao: 'rosana',
    falas: {
      semSerie: [{ pt: 'Oi, {nome}! Rosana aqui. Em que série você está?', en: 'Hi! What grade are you in?' }],
      apresenta: [{ pt: 'Agora o plano vira prática, {nome}: semana organizada, entrega, simulado e apresentação. O resultado da sua organização vira pontos.', en: 'Now the plan becomes practice!' }],
      meio: [{ pt: 'Mandou bem, {nome}! Próxima: {proxima}.', en: 'Well done! Next.' }],
      concluido: [{ pt: 'Missão oito completa, {nome}! Você colocou a organização em prática. A gincana vem aí.', en: 'Mission eight complete!' }],
      certo: [{ pt: 'Isso! Melhor impossível.', en: 'Better than ever!' }],
      errado: [{ pt: 'Quase. Compare as opções e veja a certa.', en: 'Almost. Compare the options.' }],
      volta: [{ pt: 'De volta ao projeto, {nome}?', en: 'Welcome back to the project!' }],
    },
  },
};

// Escolhe uma fala do momento (varia a cada chamada) e preenche os campos.
export function fala(nivel: number, momento: Momento, campos: { nome?: string; missao?: string; proxima?: string } = {}): Fala {
  const roteiro = ROTEIRO[nivel] ?? ROTEIRO[0];
  const lista = roteiro.falas[momento] ?? roteiro.falas.apresenta;
  const base = lista[Math.floor(Math.random() * lista.length)] ?? lista[0];
  const troca = (t: string) => t
    .replace(/\{nome\}/g, campos.nome?.trim() || 'estudante')
    .replace(/\{missao\}/g, campos.missao ?? '')
    .replace(/\{proxima\}/g, campos.proxima ?? 'a próxima atividade');
  return { pt: troca(base.pt), en: troca(base.en) };
}

export const anfitriaoDoNivel = (nivel: number): NomeAnfitriao => (ROTEIRO[nivel] ?? ROTEIRO[0]).anfitriao;

// Falas das telas fora dos níveis (PROVISÓRIO): quem fala e o que diz no cadastro, no código, na visita, na orientação e no ranking.
export type TelaComFala = 'cadastro' | 'codigo' | 'visitante' | 'orientacao' | 'orientacaoQuiz' | 'orientacaoTermo' | 'ranking' | 'rankingVazio';
export const FALAS_TELAS: Record<TelaComFala, { anfitriao: NomeAnfitriao; falas: Fala[] }> = {
  cadastro: { anfitriao: 'leia', falas: [
    { pt: 'Agora é oficial! Escolha seu nome, sua turma, sua equipe e o seu avatar. Depois eu te entrego o seu código de jogador.', en: 'Choose your name, class, team and avatar!' },
    { pt: 'Capriche no nome: ele vai aparecer no ranking da escola inteira.', en: 'Pick a good name: the whole school will see it!' },
  ] },
  codigo: { anfitriao: 'leia', falas: [
    { pt: 'Já tem código? Digite aqui que eu busco seus pontos e suas missões.', en: 'Type your code and I will find your points.' },
  ] },
  visitante: { anfitriao: 'mane', falas: [
    { pt: 'Quer só dar uma olhada? Entra como visitante! Mas visitante não aparece no ranking, hein.', en: 'Try it as a guest! Guests are not in the ranking.' },
  ] },
  orientacao: { anfitriao: 'leia', falas: [
    { pt: 'Bem-vindo à reunião no auditório! Antes de jogar, vamos combinar as regras da nossa escola. Leia! Know the rules, learn and go further!', en: 'Know the rules, learn and go further!' },
  ] },
  orientacaoQuiz: { anfitriao: 'leia', falas: [
    { pt: 'Duas perguntinhas rápidas para ver se o recado ficou claro.', en: 'Two quick questions!' },
  ] },
  orientacaoTermo: { anfitriao: 'leia', falas: [
    { pt: 'Para terminar, o termo de compromisso. Leia com atenção e marque se concorda.', en: 'Read the agreement and tick if you agree.' },
  ] },
  ranking: { anfitriao: 'marcio', falas: [
    { pt: 'Aqui está o quadro de honra da escola: jogadores, turmas e a disputa entre a Equipe Azul e a Equipe Roxa.', en: 'The school honor board: players, classes and teams.' },
  ] },
  rankingVazio: { anfitriao: 'marcio', falas: [
    { pt: 'O quadro ainda está vazio. Jogue o Nível 0 e seja o primeiro nome aqui!', en: 'Play Level 0 and be the first name here!' },
  ] },
};

export function falaDaTela(tela: TelaComFala, campos: { nome?: string } = {}): Fala {
  const lista = FALAS_TELAS[tela].falas;
  const base = lista[Math.floor(Math.random() * lista.length)] ?? lista[0];
  const troca = (t: string) => t.replace(/\{nome\}/g, campos.nome?.trim() || 'estudante');
  return { pt: troca(base.pt), en: troca(base.en) };
}
