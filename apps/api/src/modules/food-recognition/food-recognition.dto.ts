import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFoodRecognitionDto {
  @IsString()
  uploadId!: string;
}

export class CreateFoodRecognitionUploadDto {
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType!: 'image/jpeg' | 'image/png' | 'image/webp';

  @IsNumber()
  @Min(1)
  @Max(10 * 1024 * 1024)
  sizeBytes!: number;
}

export class ConfirmFoodRecognitionDto {
  @IsString()
  candidateId!: string;

  @IsString()
  mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @IsNumber()
  @Min(1)
  @Max(5000)
  grams!: number;

  @IsDateString()
  recordedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;

  @IsOptional()
  @IsBoolean()
  saveToLibrary?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  estimatedEnergyKcal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  estimatedProteinG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  estimatedFatG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2000)
  estimatedCarbohydrateG?: number;
}

export class AnalyzeFoodImageDto {
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType!: 'image/jpeg' | 'image/png' | 'image/webp';

  @IsString()
  imageBase64!: string;
}
