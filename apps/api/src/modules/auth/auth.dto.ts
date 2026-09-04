import { IsEmail, IsString, Length } from 'class-validator';

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

export class AppRegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 128)
  password!: string;
}

export class AppLoginDto extends AppRegisterDto {}
