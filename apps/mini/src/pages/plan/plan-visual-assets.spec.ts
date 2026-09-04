import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import mePageSource from '../me/MePage.vue?raw';
import planHeroSource from '../../components/plans/PlanHero.vue?raw';

const visualSystemSource = readFileSync(
  new URL('../../styles/visual-system.css', import.meta.url),
  'utf8',
);

describe('shared illustration direction', () => {
  it('uses the user-provided default avatar only for the user profile surface', () => {
    expect(mePageSource).toContain('/static/illustrations/default-user-avatar.png');
  });

  it('keeps the planning hero image in a dedicated, non-overlapping visual region', () => {
    expect(planHeroSource).toContain('/static/illustrations/plan-hero-banner.png');
    expect(planHeroSource).toContain('mode="widthFix"');
    expect(planHeroSource).toContain('height: auto');
    expect(planHeroSource).toContain('display: none');
  });

  it('keeps global materials compatible with WeChat WXSS', () => {
    expect(visualSystemSource).not.toMatch(/(^|[,{]\s*)\*(?=\s|,|:|\{)/m);
    expect(visualSystemSource).toContain('background: rgba(255, 255, 255, 0.82)');
    expect(visualSystemSource).toContain('backdrop-filter: blur(18px)');
  });
});
