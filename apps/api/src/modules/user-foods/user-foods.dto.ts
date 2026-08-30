import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, Matches } from 'class-validator';

export class CreateUserFoodDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/u)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsString()
  @IsIn(['catalog', 'photo', 'manual'])
  @IsNotEmpty()
  @MaxLength(40)
  source!: string;

  @IsNumber()
  @Min(0.0001)
  energyKcal!: number;

  @IsNumber()
  @Min(0.0001)
  proteinG!: number;

  @IsNumber()
  @Min(0.0001)
  fatG!: number;

  @IsNumber()
  @Min(0.0001)
  carbohydrateG!: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/u)
  @MaxLength(60)
  defaultServingLabel!: string;

  @IsNumber()
  @Min(0.01)
  defaultServingGrams!: number;
}

export class UserFoodsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  q?: string;
}
