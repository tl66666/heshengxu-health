import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { HealthGoal } from './health-profile.repository.js';

export const HEALTH_GOALS: HealthGoal[] = [
  'weight_management',
  'weight_maintenance',
  'muscle_gain',
  'sleep',
  'energy',
  'mood',
];

export class UpdateHealthProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  displayName?: string;

  @IsOptional()
  @IsEnum(['female', 'male', 'unspecified'])
  sex?: 'female' | 'male' | 'unspecified';

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(80)
  @Max(240)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  weightKg?: number;

  @IsOptional()
  @IsEnum(HEALTH_GOALS)
  primaryGoal?: HealthGoal;
}
