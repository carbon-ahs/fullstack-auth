import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserService } from '../user/user.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config.js';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import refreshConfig from './config/refresh.config.js';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
