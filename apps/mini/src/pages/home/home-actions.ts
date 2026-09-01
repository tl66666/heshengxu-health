export const homeQuickActions = [
  {
    label: '记一餐',
    detail: '食物目录',
    route: '/pages/food-search/FoodSearchPage',
    icon: '/static/icons/meal.svg',
    tone: 'mint',
  },
  {
    label: '拍照识别',
    detail: '先看候选',
    route: '/pages/food-recognition/FoodRecognitionPage',
    icon: '/static/icons/camera.svg',
    tone: 'sky',
  },
  {
    label: '记体重',
    detail: '十秒记录',
    route: '/pages/records/RecordsPage?type=weight',
    icon: '/static/icons/scale.svg',
    tone: 'amber',
  },
  {
    label: '周回顾',
    detail: '一周节律',
    route: '/pages/weekly-review/WeeklyReviewPage',
    icon: '/static/icons/review.svg',
    tone: 'blush',
  },
] as const;

export const foodRecordActions = [
  { label: '早餐', route: '/pages/food-search/FoodSearchPage?mealType=breakfast' },
  { label: '午餐', route: '/pages/food-search/FoodSearchPage?mealType=lunch' },
  { label: '晚餐', route: '/pages/food-search/FoodSearchPage?mealType=dinner' },
  { label: '加餐', route: '/pages/food-search/FoodSearchPage?mealType=snack' },
] as const;

export const mealRecordIcons = {
  早餐: '/static/icons/breakfast.png',
  午餐: '/static/icons/lunch.png',
  晚餐: '/static/icons/dinner.png',
  加餐: '/static/icons/snack.png',
} as const;
