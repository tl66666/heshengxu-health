import { describe, expect, it } from 'vitest';
import { homeHeroArtPool, pickHomeHeroArt } from './home-hero-art.js';

describe('home hero daily art rotation', () => {
  it('contains only complete-display artworks with their own copy side', () => {
    expect(homeHeroArtPool).toEqual([
      {
        image: '/static/illustrations/home-hero-morning.png',
        copySide: 'right',
        alt: '清晨窗边的序序',
      },
      {
        image: '/static/illustrations/home-companion-banner.png',
        copySide: 'left',
        alt: '和序序聊聊今天的状态',
      },
    ]);
  });

  it('rotates by calendar day and stays stable within the same day', () => {
    const first = pickHomeHeroArt('2026-08-27');
    const second = pickHomeHeroArt('2026-08-28');
    expect(first.image).not.toBe(second.image);
    expect(pickHomeHeroArt('2026-08-27')).toBe(first);
    expect(pickHomeHeroArt('2026-08-28')).toBe(second);
  });

  it('covers every pool artwork across consecutive days without leaving the pool', () => {
    const seen = new Set<string>();
    for (let offset = 0; offset < 30; offset += 1) {
      const day = `2026-09-${String((offset % 30) + 1).padStart(2, '0')}`;
      seen.add(pickHomeHeroArt(day).image);
    }
    expect([...seen].sort()).toEqual(homeHeroArtPool.map((item) => item.image).sort());
  });
});
