import { IsDateString, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateFoodRecognitionDto {
  @IsString()
  @MaxLength(300)
  imageKey!: string;
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
