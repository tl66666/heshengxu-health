import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TokenService } from './tokens/token.service.js';

@Global()
@Module({ controllers: [AuthController], providers: [PrismaService, TokenService, AuthService], exports: [TokenService] })
export class AuthModule {}
