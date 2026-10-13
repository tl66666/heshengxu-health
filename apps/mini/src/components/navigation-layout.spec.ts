import { describe, expect, it } from 'vitest';
import { navigationLayout } from './navigation-layout.js';
describe('navigation safe layout', () => {
  it('keeps native capsule clear of the title and matches its vertical center', () => {
    expect(
      navigationLayout(
        { statusBarHeight: 59, windowWidth: 375 },
        { left: 278, right: 365, top: 65, bottom: 97 },
      ),
    ).toEqual({ statusBarHeight: 59, barHeight: 44, rightInset: 109 });
  });
  it('uses a taller bar when the capsule sits lower on Android', () => {
    expect(
      navigationLayout(
        { statusBarHeight: 24, windowWidth: 360 },
        { left: 260, right: 350, top: 34, bottom: 66 },
      ),
    ).toEqual({ statusBarHeight: 24, barHeight: 52, rightInset: 112 });
  });
  it('keeps App and browser navigation usable without a capsule API', () => {
    expect(navigationLayout({ statusBarHeight: 0, windowWidth: 375 })).toEqual({
      statusBarHeight: 0,
      barHeight: 44,
      rightInset: 12,
    });
  });
  it('ignores malformed or off-screen capsule values', () => {
    expect(
      navigationLayout(
        { statusBarHeight: 24, windowWidth: 360 },
        { left: 900, right: 990, top: 24, bottom: 56 },
      ).rightInset,
    ).toBe(12);
    expect(
      navigationLayout({ statusBarHeight: 24 }, { left: NaN, right: 360, top: 28, bottom: 60 })
        .barHeight,
    ).toBe(44);
  });
  it('does not turn invalid device values into CSS NaN or giant spacers', () => {
    expect(navigationLayout({ statusBarHeight: NaN, windowWidth: Infinity })).toEqual({
      statusBarHeight: 0,
      barHeight: 44,
      rightInset: 12,
    });
    expect(navigationLayout({ statusBarHeight: -9 }).statusBarHeight).toBe(0);
  });
});
