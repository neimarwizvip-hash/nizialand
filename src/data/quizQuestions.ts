import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // --- ATIVIDADE 1: Estudantes e Idades (Comparative of Superiority & Equality) ---
  {
    id: 1,
    activity: 1,
    activityTitle: "Activity 1 – Question 1",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Mateus is _______ Carlos.",
    spokenText: "Mateus is blank Carlos.",
    contextHint: "Mateus (14 years old) vs Carlos (13 years old)",
    hint: "Mateus is 14 and Carlos is 13. For superiority with short adjectives, use: adjective + -er + than -> older than.",
    targetStudent1: "mateus",
    targetStudent2: "carlos",
    optionsSheet: [
      { text: "older than", isCorrect: true },
      { text: "younger than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "older than", isCorrect: true },
      { letter: "B", text: "younger than", isCorrect: false },
      { letter: "C", text: "as old as", isCorrect: false },
      { letter: "D", text: "the oldest", isCorrect: false }
    ],
    explanation: "Mateus is 14 years old and Carlos is 13. Since 14 > 13, Mateus is older than Carlos."
  },
  {
    id: 2,
    activity: 1,
    activityTitle: "Activity 1 – Question 2",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Juliana is _______ Sofia.",
    spokenText: "Juliana is blank Sofia.",
    contextHint: "Juliana (12 years old) vs Sofia (12 years old)",
    hint: "Juliana and Sofia are the same age (12). Comparative of equality uses: as + adjective + as -> as old as.",
    targetStudent1: "juliana",
    targetStudent2: "sofia",
    optionsSheet: [
      { text: "as old as", isCorrect: true },
      { text: "older than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "as old as", isCorrect: true },
      { letter: "B", text: "older than", isCorrect: false },
      { letter: "C", text: "younger than", isCorrect: false },
      { letter: "D", text: "the same as", isCorrect: false }
    ],
    explanation: "Juliana (12) and Sofia (12) are exactly the same age. We use equality: 'as old as' (as + adjective + as)."
  },
  {
    id: 3,
    activity: 1,
    activityTitle: "Activity 1 – Question 3",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Gabriel is _______ Rafael.",
    spokenText: "Gabriel is blank Rafael.",
    contextHint: "Gabriel (11 years old) vs Rafael (12 years old)",
    hint: "Gabriel is 11 and Rafael is 12. 11 is less than 12. Use young + -er + than -> younger than.",
    targetStudent1: "gabriel",
    targetStudent2: "rafael",
    optionsSheet: [
      { text: "younger than", isCorrect: true },
      { text: "as old as", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "younger than", isCorrect: true },
      { letter: "B", text: "as old as", isCorrect: false },
      { letter: "C", text: "older than", isCorrect: false },
      { letter: "D", text: "as young as", isCorrect: false }
    ],
    explanation: "Gabriel is 11 years old and Rafael is 12. Since 11 < 12, Gabriel is younger than Rafael."
  },
  {
    id: 4,
    activity: 1,
    activityTitle: "Activity 1 – Question 4",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Beatriz is _______ Larissa.",
    spokenText: "Beatriz is blank Larissa.",
    contextHint: "Beatriz (14 years old) vs Larissa (13 years old)",
    hint: "Beatriz is 14 and Larissa is 13. 14 is greater than 13 -> older than.",
    targetStudent1: "beatriz",
    targetStudent2: "larissa",
    optionsSheet: [
      { text: "older than", isCorrect: true },
      { text: "younger than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "older than", isCorrect: true },
      { letter: "B", text: "younger than", isCorrect: false },
      { letter: "C", text: "as old as", isCorrect: false },
      { letter: "D", text: "more old than", isCorrect: false }
    ],
    explanation: "Beatriz is 14 years old and Larissa is 13. 14 > 13, so Beatriz is older than Larissa."
  },
  {
    id: 5,
    activity: 1,
    activityTitle: "Activity 1 – Question 5",
    instruction: "Observe the students and choose the correct answer:",
    sentence: "Rafael is _______ Juliana.",
    spokenText: "Rafael is blank Juliana.",
    contextHint: "Rafael (12 years old) vs Juliana (12 years old)",
    hint: "Both Rafael and Juliana are 12 years old. They are the same age -> as old as.",
    targetStudent1: "rafael",
    targetStudent2: "juliana",
    optionsSheet: [
      { text: "as old as", isCorrect: true },
      { text: "older than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "as old as", isCorrect: true },
      { letter: "B", text: "older than", isCorrect: false },
      { letter: "C", text: "younger than", isCorrect: false },
      { letter: "D", text: "as older than", isCorrect: false }
    ],
    explanation: "Rafael (12) and Juliana (12) are the same age. In English, equality is expressed by: 'as old as'."
  },

  // --- ATIVIDADE 2: Leitura do Texto e Glossário (Alice & Bruno) ---
  {
    id: 6,
    activity: 2,
    activityTitle: "Activity 2 – Question 1",
    instruction: "Read the text and answer:",
    sentence: "Who is older, Alice or Bruno?",
    spokenText: "Who is older, Alice or Bruno?",
    contextHint: "Reading Text: Alice is 13 years old • Bruno is 14 years old",
    hint: "In the text, Alice says: 'I am 13 years old and Bruno is 14 years old.' Compare 13 and 14.",
    optionsSheet: [
      { text: "Bruno", isCorrect: true },
      { text: "Alice", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "Bruno is older (14 years old)", isCorrect: true },
      { letter: "B", text: "Alice is older (13 years old)", isCorrect: false },
      { letter: "C", text: "They are the same age", isCorrect: false },
      { letter: "D", text: "Paula is the oldest student", isCorrect: false }
    ],
    explanation: "In the passage, Alice clearly states: 'I am 13 years old and Bruno is 14 years old.' So Bruno is older."
  },
  {
    id: 7,
    activity: 2,
    activityTitle: "Activity 2 – Question 2",
    instruction: "Read the text and answer:",
    sentence: "Who is younger, Paula or Marcos?",
    spokenText: "Who is younger, Paula or Marcos?",
    contextHint: "Reading Text: Paula (mother, 40) • Marcos (father, 38)",
    hint: "Paula is 40 and Marcos is 38. 'Younger' means who has the smaller age number.",
    optionsSheet: [
      { text: "Marcos", isCorrect: true },
      { text: "Paula", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "Marcos (38 years old)", isCorrect: true },
      { letter: "B", text: "Paula (40 years old)", isCorrect: false },
      { letter: "C", text: "Alice (13 years old)", isCorrect: false },
      { letter: "D", text: "Both are the same age", isCorrect: false }
    ],
    explanation: "Paula is 40 years old and Marcos is 38. Therefore, Marcos (38) is younger than Paula (40)."
  },
  {
    id: 8,
    activity: 2,
    activityTitle: "Activity 2 – Question 3",
    instruction: "Read the text and choose the correct comparative:",
    sentence: "Alice is _______ Bruno.",
    spokenText: "Alice is blank Bruno.",
    contextHint: "Alice (13 years old) vs Bruno (14 years old)",
    hint: "Alice is 13 and Bruno is 14. Alice has fewer years than Bruno -> younger than.",
    optionsSheet: [
      { text: "younger than", isCorrect: true },
      { text: "older than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "younger than", isCorrect: true },
      { letter: "B", text: "older than", isCorrect: false },
      { letter: "C", text: "as old as", isCorrect: false },
      { letter: "D", text: "more young than", isCorrect: false }
    ],
    explanation: "Alice is 13 years old and Bruno is 14 years old. Alice is younger than Bruno."
  },
  {
    id: 9,
    activity: 2,
    activityTitle: "Activity 2 – Question 4",
    instruction: "Read the text and choose the correct comparative:",
    sentence: "Paula is _______ Marcos.",
    spokenText: "Paula is blank Marcos.",
    contextHint: "Paula (40 years old) vs Marcos (38 years old)",
    hint: "Paula (40) has more years than Marcos (38) -> older than.",
    optionsSheet: [
      { text: "older than", isCorrect: true },
      { text: "younger than", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "older than", isCorrect: true },
      { letter: "B", text: "younger than", isCorrect: false },
      { letter: "C", text: "as old as", isCorrect: false },
      { letter: "D", text: "the older", isCorrect: false }
    ],
    explanation: "Paula is 40 years old and Marcos is 38 years old. Paula is older than Marcos."
  },
  {
    id: 10,
    activity: 2,
    activityTitle: "Activity 2 – Question 5",
    instruction: "Read the text and complete the sentence:",
    sentence: "Alice and Bruno are _______.",
    spokenText: "Alice and Bruno are blank.",
    contextHint: "Reading: 'We study at the same school and we have been friends since kindergarten.'",
    hint: "Look at the sentence in the text: 'we have been friends since kindergarten'!",
    optionsSheet: [
      { text: "friends since kindergarten", isCorrect: true },
      { text: "students from different schools", isCorrect: false }
    ],
    optionsQuad: [
      { letter: "A", text: "friends since kindergarten", isCorrect: true },
      { letter: "B", text: "students from different schools", isCorrect: false },
      { letter: "C", text: "brother and sister", isCorrect: false },
      { letter: "D", text: "cousins from another city", isCorrect: false }
    ],
    explanation: "As stated in Alice's speech: 'We study at the same school and we have been friends since kindergarten.'"
  }
];

export const READING_TEXT = {
  title: "Alice and Bruno's Story",
  passage: `"Hello! I'm Alice and this is my friend Bruno. We study at the same school and we have been friends since kindergarten. I am 13 years old and Bruno is 14 years old. My mother is Paula. She is 40 years old. My father is Marcos. He is 38 years old."`,
  glossary: [
    { en: "friend", pt: "amigo(a)" },
    { en: "same school", pt: "mesma escola" },
    { en: "since kindergarten", pt: "desde o jardim de infância" },
    { en: "years old", pt: "anos de idade" },
    { en: "mother", pt: "mãe" },
    { en: "father", pt: "pai" },
    { en: "older", pt: "mais velho(a)" },
    { en: "younger", pt: "mais novo(a)" }
  ]
};

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Returns a randomized quiz session where:
 * 1. Questions order within each activity is shuffled.
 * 2. Options (A, B, C, D) for each question are shuffled so option A is never predictable.
 * 3. Correct answer mapping (isCorrect: true) is strictly maintained.
 */
export function getRandomizedQuizSession(): QuizQuestion[] {
  const letters = ['A', 'B', 'C', 'D'];

  const act1 = QUIZ_QUESTIONS.filter(q => q.activity === 1);
  const act2 = QUIZ_QUESTIONS.filter(q => q.activity === 2);

  const shuffledAct1 = shuffleArray(act1);
  const shuffledAct2 = shuffleArray(act2);

  return [...shuffledAct1, ...shuffledAct2].map(q => {
    const shuffledQuad = shuffleArray(q.optionsQuad).map((opt, idx) => ({
      ...opt,
      letter: letters[idx] || opt.letter
    }));

    return {
      ...q,
      optionsQuad: shuffledQuad
    };
  });
}

