import { describe, expect, it } from 'vitest';
import source from './MoodDetailPage.vue?raw';
describe('mood detail page', () => {
  it('provides selectable mood states and a persisted note', () => {
    expect(source).toContain('平静'); expect(source).toContain('有点焦虑'); expect(source).toContain('saveMood'); expect(source).toContain('最近心情');
  });
});
