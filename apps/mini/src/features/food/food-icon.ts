const FOOD_CATEGORY_ICONS: Record<string, string> = {
  grain: '/static/icons/svg/food-grain.svg',
  grains: '/static/icons/svg/food-grain.svg',
  cereal: '/static/icons/svg/food-grain.svg',
  egg: '/static/icons/svg/food-egg.svg',
  eggs: '/static/icons/svg/food-egg.svg',
  meat: '/static/icons/svg/food-meat.svg',
  meats: '/static/icons/svg/food-meat.svg',
  poultry: '/static/icons/svg/food-meat.svg',
  'meat-egg': '/static/icons/svg/food-meat.svg',
  protein: '/static/icons/svg/food-meat.svg',
  vegetable: '/static/icons/svg/food-vegetable.svg',
  vegetables: '/static/icons/svg/food-vegetable.svg',
  fruit: '/static/icons/svg/food-fruit.svg',
  fruits: '/static/icons/svg/food-fruit.svg',
  dairy: '/static/icons/svg/food-dairy.svg',
  milk: '/static/icons/svg/food-dairy.svg',
  staple: '/static/icons/svg/food-staple.svg',
  staples: '/static/icons/svg/food-staple.svg',
  soy: '/static/icons/svg/food-soy.svg',
  bean: '/static/icons/svg/food-soy.svg',
  beans: '/static/icons/svg/food-soy.svg',
  nut: '/static/icons/svg/food-soy.svg',
  beverage: '/static/icons/svg/food-dairy.svg',
  snack: '/static/icons/svg/food-grain.svg',
  restaurant: '/static/icons/svg/food-staple.svg',
  oil: '/static/icons/svg/food-soy.svg',
  seasoning: '/static/icons/svg/food-vegetable.svg',
};

export function getFoodCategoryIcon(categorySlug?: string | null, foodName?: string | null) {
  if (foodName === '鸡蛋' || foodName === '水煮蛋') return '/static/icons/breakfast.png';
  if (foodName === '米饭' || foodName === '白米饭') return '/static/icons/lunch.png';
  return (categorySlug && FOOD_CATEGORY_ICONS[categorySlug]) || '/static/icons/svg/meal.svg';
}
