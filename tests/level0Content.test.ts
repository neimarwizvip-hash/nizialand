import { describe, it, expect } from 'vitest';
import { SCHOOL_GRADES, getQuizSession, getFlashcardSet, cardFact } from '../src/data/level0Content';
import { gradeFromClassName } from '../src/services/grade';

describe('Level 0 content per grade', () => {
  for (const grade of SCHOOL_GRADES) {
    describe(`${grade}º ano`, () => {
      it('quiz session has 10 questions with exactly one correct option each', () => {
        const session = getQuizSession(grade);
        expect(session).toHaveLength(10);
        for (const q of session) {
          expect(q.sentence.length).toBeGreaterThan(0);
          expect(q.optionsQuad.length).toBeGreaterThanOrEqual(2);
          expect(q.optionsQuad.filter((o) => o.isCorrect)).toHaveLength(1);
        }
      });

      it('flashcard set has 8 students and 5 solvable challenges', () => {
        const set = getFlashcardSet(grade);
        expect(set.students).toHaveLength(8);
        expect(new Set(set.students.map((s) => s.id)).size).toBe(8);
        expect(set.challenges).toHaveLength(5);
        expect(set.memorizeTitle.length).toBeGreaterThan(0);
        for (const c of set.challenges) {
          expect(set.students.some((s) => c.validateCard(s))).toBe(true);
        }
        for (const s of set.students) {
          expect(cardFact(s).length).toBeGreaterThan(0);
        }
      });

      if (grade !== '8') {
        it('every card carries a grade fact', () => {
          for (const s of getFlashcardSet(grade).students) {
            expect(s.info).toBeTruthy();
          }
        });
      }
    });
  }

  it('8º ano keeps the age cards', () => {
    for (const s of getFlashcardSet('8').students) {
      expect(cardFact(s)).toBe(`${s.age} years old`);
    }
  });
});

describe('gradeFromClassName', () => {
  it('maps class codes to grades', () => {
    expect(gradeFromClassName('801')).toBe('8');
    expect(gradeFromClassName('804')).toBe('8');
    expect(gradeFromClassName('601')).toBe('6');
    expect(gradeFromClassName('702')).toBe('7');
    expect(gradeFromClassName('903')).toBe('9');
  });

  it('returns null for unknown classes', () => {
    expect(gradeFromClassName('')).toBeNull();
    expect(gradeFromClassName(undefined)).toBeNull();
    expect(gradeFromClassName('501')).toBeNull();
    expect(gradeFromClassName('Turma A')).toBeNull();
  });
});
