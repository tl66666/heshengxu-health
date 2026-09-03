import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
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
}

export class AnalyzeFoodImageDto {
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType!: 'image/jpeg' | 'image/png' | 'image/webp';

  @IsString()
  imageBase64!: string;
}
