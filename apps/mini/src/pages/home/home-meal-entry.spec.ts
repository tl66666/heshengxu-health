import { describe, expect, it } from 'vitest';
import homePageSource from './HomePage.vue?raw';

describe('home meal entry', () => {
  it('opens the real food catalog flow instead of the legacy add page', () => {
    expect(homePageSource).toContain("url: '/pages/food-search/FoodSearchPage?mealType=lunch'");
    expect(homePageSource).not.toContain("url: '/pages/meal-add/MealAddPage?mealType=lunch'");
  });
});
