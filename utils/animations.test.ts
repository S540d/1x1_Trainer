import { ANIMATION_DURATIONS } from './animations';

describe('animations.ts - Animation Constants', () => {
  it('should export ANIMATION_DURATIONS with expected keys', () => {
    expect(ANIMATION_DURATIONS).toEqual({
      FAST: 150,
      NORMAL: 250,
      SLOW: 400,
      SKELETON: 1200,
    });
  });

  it('should have FAST < NORMAL < SLOW < SKELETON', () => {
    expect(ANIMATION_DURATIONS.FAST).toBeLessThan(ANIMATION_DURATIONS.NORMAL);
    expect(ANIMATION_DURATIONS.NORMAL).toBeLessThan(ANIMATION_DURATIONS.SLOW);
    expect(ANIMATION_DURATIONS.SLOW).toBeLessThan(ANIMATION_DURATIONS.SKELETON);
  });
});
