import { IsDateString, IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SaveCurrentPlanDto {
  @IsEnum(['weight', 'sleep'])
  kind!: 'weight' | 'sleep';

  @IsOptional()
  @IsEnum(['lose', 'maintain', 'gain'])
  direction?: 'lose' | 'maintain' | 'gain';

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  targetWeightKg?: number;

  @IsDateString()
  startDate!: string;
}

export class UpdatePlanTaskDto {
  @IsEnum(['completed', 'skipped'])
  status!: 'completed' | 'skipped';
}
