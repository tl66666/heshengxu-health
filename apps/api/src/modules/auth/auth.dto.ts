import { IsString, Length } from 'class-validator';

export class WechatLoginDto {
  @IsString()
  @Length(1, 256)
  code!: string;
}

export class RefreshTokenDto {
  @IsString()
  @Length(20, 4096)
  refreshToken!: string;
}
