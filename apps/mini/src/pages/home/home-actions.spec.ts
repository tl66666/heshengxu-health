import { describe, expect, it } from 'vitest';
import { homeQuickActions } from './home-actions.js';

describe('home quick actions', () => {
  it('exposes the primary health workflows with registered routes', () => {
    expect(homeQuickActions.map((item) => item.route)).toEqual([
      '/pages/food-search/FoodSearchPage',
      '/pages/food-recognition/FoodRecognitionPage',
      '/pages/plan/PlanPage',
      '/pages/profile/ProfilePage',
    ]);
  });
});
