import { describe, expect, it } from 'vitest';
import { foodRecordActions, mealRecordIcons, homeQuickActions } from './home-actions.js';

describe('home quick actions', () => {
  it('keeps food recording first and adds weight review shortcuts with distinct icons', () => {
    expect(
      homeQuickActions.map(({ label, route, icon, tone }) => ({ label, route, icon, tone })),
    ).toEqual([
      {
        label: '记一餐',
        route: '/pages/food-search/FoodSearchPage',
        icon: '/static/icons/meal.svg',
        tone: 'mint',
      },
      {
        label: '拍照识别',
        route: '/pages/food-recognition/FoodRecognitionPage',
        icon: '/static/icons/camera.svg',
        tone: 'sky',
      },
      {
        label: '记体重',
        route: '/pages/records/RecordsPage?type=weight',
        icon: '/static/icons/scale.svg',
        tone: 'amber',
      },
      {
        label: '周回顾',
        route: '/pages/weekly-review/WeeklyReviewPage',
        icon: '/static/icons/review.svg',
        tone: 'blush',
      },
    ]);
  });

  it('uses each existing icon only once so tiles stay scannable', () => {
    const icons = homeQuickActions.map((item) => item.icon);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it('keeps four meal entries and one activity entry with explicit meal context', () => {
    expect(foodRecordActions).toEqual([
      { label: '早餐', route: '/pages/food-search/FoodSearchPage?mealType=breakfast' },
      { label: '午餐', route: '/pages/food-search/FoodSearchPage?mealType=lunch' },
      { label: '晚餐', route: '/pages/food-search/FoodSearchPage?mealType=dinner' },
      { label: '加餐', route: '/pages/food-search/FoodSearchPage?mealType=snack' },
    ]);
    expect(mealRecordIcons).toEqual({
      早餐: '/static/icons/svg/meal-breakfast.svg',
      午餐: '/static/icons/svg/meal-lunch.svg',
      晚餐: '/static/icons/svg/meal-dinner.svg',
      加餐: '/static/icons/svg/meal-snack.svg',
    });
  });
});
