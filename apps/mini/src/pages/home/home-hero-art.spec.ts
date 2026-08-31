import { describe, expect, it } from 'vitest';
import { homeHeroArtPool, pickHomeHeroArt } from './home-hero-art.js';
import homePageSource from './HomePage.vue?raw';

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

  it('uses the companion artwork for the camera banner without the old generated camera icon', () => {
    expect(homePageSource).toContain('/static/illustrations/home-companion-banner.png');
    expect(homePageSource).toContain('class="camera-banner"');
    expect(homePageSource).not.toContain('/static/icons/camera.jpg');
  });

  it('shows live intake, remaining, activity burn, and a stable progress track', () => {
    expect(homePageSource).toContain('intakeCalories');
    expect(homePageSource).toContain('remainingCalories');
    expect(homePageSource).toContain('activityCalories');
    expect(homePageSource).toContain('class="calorie-progress-track"');
  });

  it('keeps one activity entry below the meal card and names it 运动', () => {
    expect(homePageSource).toContain('class="grid-item card activity-card"');
    expect(homePageSource).toContain('<text class="grid-title">运动</text>');
    expect(homePageSource).toContain(
      '@tap="openRecordAction(\'/pages/records/RecordsPage?type=activity\')"',
    );
    expect(homePageSource).not.toContain('<text class="meal-name">运动</text>');
    expect(homePageSource).not.toMatch(/[🍳🍱🍲🍎🥚🍜]/u);
  });
});
