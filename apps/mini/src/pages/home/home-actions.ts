export const homeQuickActions = [
  {
    label: '记一餐',
    detail: '食物目录',
    route: '/pages/food-search/FoodSearchPage',
    icon: '/static/icons/journal.svg',
  },
  {
    label: '拍照识别',
    detail: '先看候选',
    route: '/pages/food-recognition/FoodRecognitionPage',
    icon: '/static/icons/journal.svg',
  },
  {
    label: '我的计划',
    detail: '今天做什么',
    route: '/pages/plan/PlanPage',
    icon: '/static/icons/plan.svg',
  },
  {
    label: '健康档案',
    detail: '看看自己的变化',
    route: '/pages/profile/ProfilePage',
    icon: '/static/icons/profile.svg',
  },
] as const;
