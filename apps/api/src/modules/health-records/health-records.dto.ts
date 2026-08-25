import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

class RecordTimingDto {
  @IsDateString()
  recordedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;
}

export class CreateWeightRecordDto extends RecordTimingDto {
  @IsNumber()
  @Min(20)
  @Max(300)
  valueKg!: number;
}

export class CreateMealStructureRecordDto extends RecordTimingDto {
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
  mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @IsBoolean()
  hasStaple!: boolean;

  @IsBoolean()
  hasProtein!: boolean;

  @IsBoolean()
  hasVegetable!: boolean;
}

export class CreateActivityRecordDto extends RecordTimingDto {
  @IsString()
  @MaxLength(50)
  activityType!: string;

  @IsNumber()
  @Min(1)
  @Max(1440)
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  intensity?: string;
}

export class CreateSleepRecordDto extends RecordTimingDto {
  @IsNumber()
  @Min(30)
  @Max(1440)
  durationMinutes!: number;

  @IsEnum(['poor', 'fair', 'good'])
  quality!: 'poor' | 'fair' | 'good';

  @IsOptional()
  @IsDateString()
  sleepAt?: string;

  @IsOptional()
  @IsDateString()
  wakeAt?: string;
}

export class ReplaceHealthRecordDto {
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  valueKg?: number;

  @IsOptional()
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @IsOptional()
  @IsBoolean()
  hasStaple?: boolean;

  @IsOptional()
  @IsBoolean()
  hasProtein?: boolean;

  @IsOptional()
  @IsBoolean()
  hasVegetable?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  activityType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  intensity?: string;

  @IsOptional()
  @IsEnum(['poor', 'fair', 'good'])
  quality?: 'poor' | 'fair' | 'good';

  @IsOptional()
  @IsDateString()
  sleepAt?: string;

  @IsOptional()
  @IsDateString()
  wakeAt?: string;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;
}

export class TodayRecordsQueryDto {
  @IsDateString()
  date!: string;
}
