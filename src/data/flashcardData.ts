import { FlashcardStudent, FlashcardChallenge } from '../types';

export const FLASHCARD_STUDENTS: FlashcardStudent[] = [
  { id: "juliana", name: "Juliana", age: 12, img: "/assets/card_juliana.jpg" },
  { id: "mateus",  name: "Mateus",  age: 14, img: "/assets/card_mateus.jpg" },
  { id: "carlos",  name: "Carlos",  age: 13, img: "/assets/card_carlos.jpg" },
  { id: "gabriel", name: "Gabriel", age: 11, img: "/assets/card_gabriel.jpg" },
  { id: "rafael",  name: "Rafael",  age: 12, img: "/assets/card_rafael.jpg" },
  { id: "beatriz", name: "Beatriz", age: 14, img: "/assets/card_beatriz.jpg" },
  { id: "larissa", name: "Larissa", age: 13, img: "/assets/card_larissa.jpg" },
  { id: "sofia",   name: "Sofia",   age: 12, img: "/assets/card_sofia.jpg" }
];

export const FLASHCARD_CHALLENGES: FlashcardChallenge[] = [
  {
    id: 1,
    targetName: "Mateus",
    targetAge: 14,
    compType: "younger",
    compText: "younger than",
    questionEn: "Mateus is 14 years old. Who is younger than Mateus?",
    questionPt: "Mateus tem 14 anos. Quem é mais novo(a) que Mateus?",
    ruleExplanation: "Any student with less than 14 years old is younger than Mateus (Carlos, Juliana, Sofia, Rafael, Gabriel, Larissa).",
    validateCard: (card) => card.age < 14
  },
  {
    id: 2,
    targetName: "Gabriel",
    targetAge: 11,
    compType: "older",
    compText: "older than",
    questionEn: "Gabriel is 11 years old. Who is older than Gabriel?",
    questionPt: "Gabriel tem 11 anos. Quem é mais velho(a) que Gabriel?",
    ruleExplanation: "Any student with more than 11 years old is older than Gabriel (Juliana, Sofia, Rafael, Carlos, Larissa, Mateus, Beatriz).",
    validateCard: (card) => card.age > 11
  },
  {
    id: 3,
    targetName: "Sofia",
    targetAge: 12,
    compType: "same",
    compText: "as old as",
    questionEn: "Sofia is 12 years old. Who is as old as Sofia?",
    questionPt: "Sofia tem 12 anos. Quem tem a mesma idade que Sofia?",
    ruleExplanation: "Juliana and Rafael are also 12 years old, so they are as old as Sofia.",
    validateCard: (card) => card.age === 12 && card.id !== "sofia"
  },
  {
    id: 4,
    targetName: "Larissa",
    targetAge: 13,
    compType: "older",
    compText: "older than",
    questionEn: "Larissa is 13 years old. Who is older than Larissa?",
    questionPt: "Larissa tem 13 anos. Quem é mais velho(a) que Larissa?",
    ruleExplanation: "Mateus (14) and Beatriz (14) are older than Larissa (13).",
    validateCard: (card) => card.age > 13
  },
  {
    id: 5,
    targetName: "Rafael",
    targetAge: 12,
    compType: "same",
    compText: "as old as",
    questionEn: "Rafael is 12 years old. Who is as old as Rafael?",
    questionPt: "Rafael tem 12 anos. Quem tem a mesma idade que Rafael?",
    ruleExplanation: "Juliana (12) and Sofia (12) are the same age as Rafael (equality: as old as).",
    validateCard: (card) => card.age === 12 && card.id !== "rafael"
  }
];
