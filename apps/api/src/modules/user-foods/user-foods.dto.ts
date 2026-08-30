import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';

export enum UserFoodSource {
  catalog = 'catalog',
  photo = 'photo',
  manual = 'manual',
}

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
  @IsEnum(UserFoodSource)
  @IsNotEmpty()
  @MaxLength(40)
  source!: UserFoodSource;

  @IsNumber()
  @Min(0)
  energyKcal!: number;

  @IsNumber()
  @Min(0)
  proteinG!: number;

  @IsNumber()
  @Min(0)
  fatG!: number;

  @IsNumber()
  @Min(0)
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
