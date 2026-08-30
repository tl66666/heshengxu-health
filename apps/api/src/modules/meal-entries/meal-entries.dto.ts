import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class MealEntriesQueryDto {
  @IsDateString()
  date!: string;
}

export class CreateMealEntryDto {
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
  mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @IsOptional()
  @IsString()
  foodId?: string;

  @IsOptional()
  @IsString()
  userFoodId?: string;

  @IsNumber()
  @Min(1)
  grams!: number;

  @IsDateString()
  recordedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;

  @IsOptional()
  @IsEnum(['manual', 'photo_confirmed'])
  source?: 'manual' | 'photo_confirmed';
}

export class ReplaceMealEntryDto {
  @IsOptional()
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @IsOptional()
  @IsString()
  foodId?: string;

  @IsOptional()
  @IsString()
  userFoodId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  grams?: number;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;
}
