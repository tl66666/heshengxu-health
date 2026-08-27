import { describe, expect, it } from 'vitest';
import { homeQuickActions } from './home-actions.js';

describe('home quick actions', () => {
  it('keeps only food recording actions on the home shortcut area', () => {
    expect(homeQuickActions.map((item) => item.route)).toEqual([
      '/pages/food-search/FoodSearchPage',
      '/pages/food-recognition/FoodRecognitionPage',
    ]);
  });
});
