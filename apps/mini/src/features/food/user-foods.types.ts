export type UserFoodSource = 'catalog' | 'photo' | 'manual';

export type UserFood = {
  id: string;
  userId: string;
  name: string;
  imageUrl: string | null;
  source: UserFoodSource;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbohydrateG: number;
  defaultServingLabel: string;
  defaultServingGrams: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserFoodInput = Omit<UserFood, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
