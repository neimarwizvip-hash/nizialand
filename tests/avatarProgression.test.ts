import { describe, it, expect } from 'vitest';
import { AVATAR_CATALOG, BASE_14_AVATARS } from '../src/components/ui/PlayerAvatar';
import { calculatePlayerLevel } from '../src/types';

describe('NISIALAND Avatar Cumulative Progression System', () => {
  it('should have exactly 14 base models in the base catalog', () => {
    expect(BASE_14_AVATARS.length).toBe(14);
  });

  it('should strictly have 4 initial heroes at Level 0 with skin tone disabled to preserve canon', () => {
    const level0Base = BASE_14_AVATARS.filter(a => a.unlockLevel === 0);
    expect(level0Base.length).toBe(4);
    level0Base.forEach(hero => {
      expect(hero.allowsSkinTone).toBe(false);
      expect(hero.category).toBe('hero');
    });
  });

  it('should provide cumulative progression across Levels 0 to 5', () => {
    // Level 0: 4 models
    const lvl0 = BASE_14_AVATARS.filter(a => a.unlockLevel <= 0);
    expect(lvl0.length).toBe(4);

    // Level 1: 4 + 2 = 6 models
    const lvl1 = BASE_14_AVATARS.filter(a => a.unlockLevel <= 1);
    expect(lvl1.length).toBe(6);

    // Level 2: 6 + 2 = 8 models
    const lvl2 = BASE_14_AVATARS.filter(a => a.unlockLevel <= 2);
    expect(lvl2.length).toBe(8);

    // Level 3: 8 + 2 = 10 models
    const lvl3 = BASE_14_AVATARS.filter(a => a.unlockLevel <= 3);
    expect(lvl3.length).toBe(10);

    // Level 4: 10 + 2 = 12 models
    const lvl4 = BASE_14_AVATARS.filter(a => a.unlockLevel <= 4);
    expect(lvl4.length).toBe(12);

    // Level 5: 12 + 2 = 14 models
    const lvl5 = BASE_14_AVATARS.filter(a => a.unlockLevel <= 5);
    expect(lvl5.length).toBe(14);
  });

  it('should allow skin tone customization for models Level 1 and higher', () => {
    const customizableModels = BASE_14_AVATARS.filter(a => a.unlockLevel >= 1);
    expect(customizableModels.length).toBe(10);
    customizableModels.forEach(model => {
      expect(model.allowsSkinTone).toBe(true);
    });
  });

  it('should calculate player level accurately from score without penalizing students', () => {
    expect(calculatePlayerLevel(0)).toBe(0);
    expect(calculatePlayerLevel(50)).toBe(0);
    expect(calculatePlayerLevel(100)).toBe(1);
    expect(calculatePlayerLevel(350)).toBe(1);
    expect(calculatePlayerLevel(400)).toBe(2);
    expect(calculatePlayerLevel(750)).toBe(2);
    expect(calculatePlayerLevel(800)).toBe(3);
    expect(calculatePlayerLevel(1100)).toBe(3);
    expect(calculatePlayerLevel(1200)).toBe(4);
    expect(calculatePlayerLevel(1500)).toBe(4);
    expect(calculatePlayerLevel(1600)).toBe(5);
    expect(calculatePlayerLevel(2500)).toBe(5);
  });
});
