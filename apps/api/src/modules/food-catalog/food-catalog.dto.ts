import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchFoodsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  q?: string;
}
