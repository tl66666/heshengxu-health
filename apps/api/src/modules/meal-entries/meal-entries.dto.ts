import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMealEntryDto {
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
  mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @IsString()
  foodId!: string;

  @IsNumber()
  @Min(1)
  grams!: number;

  @IsDateString()
  recordedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;
}
