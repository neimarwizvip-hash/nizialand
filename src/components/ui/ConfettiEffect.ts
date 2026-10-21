import confetti from 'canvas-confetti';

export function triggerConfetti(count: number = 70) {
  try {
    confetti({
      particleCount: count,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#7c3aed', '#f59e0b', '#10b981', '#ec4899', '#38bdf8']
    });
  } catch {
    // Canvas fallback
  }
}

export const fireConfetti = triggerConfetti;
