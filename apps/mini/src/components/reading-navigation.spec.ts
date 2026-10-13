import { describe, expect, it } from 'vitest';
import { readingScrollTop } from './reading-navigation.js';
describe('reading anchor navigation', () => {
  it('keeps a selected heading below a 44px browser header', () => {
    expect(readingScrollTop(300, 100, 44)).toBe(344);
  });
  it('includes a tall phone status bar and capsule when finding the target', () => {
    expect(readingScrollTop(300, 100, 103)).toBe(285);
  });
  it('never asks the page to scroll above its beginning', () => {
    expect(readingScrollTop(20, 0, 44)).toBe(0);
  });
  it('refuses incomplete selector measurements', () => {
    expect(readingScrollTop(NaN, 100, 44)).toBeNull();
  });
});
