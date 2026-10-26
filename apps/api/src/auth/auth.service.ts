import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { hash, verify } from 'argon2';
import { AuthJwtPayload } from './types/auth-jwtPayload.js';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from './config/refresh.config.js';
import * as config from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: config.ConfigType<typeof refreshConfig>,
  ) {}

  async signupUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    return this.userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User with this email not exists');
    }

    const isPasswordMatched = await verify(user.password, password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return { id: user.id, name: user.name };
  }

  async login(userId: number, name: string) {
    const { accessToken, refreshToken } = await this.generateToken(userId);
    const hashedRefreshToken = await hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      id: userId,
      name: name,
      accessToken,
      refreshToken,
    };
  }

  async generateToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return { accessToken, refreshToken };
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user.');
    }

    const currentUser = { id: user.id };

    return currentUser;
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user :(');
    }
    if (!user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid hashedRefreshToken :(');
    }

    const isRefreshTokenMatched = await verify(
        user.hashedRefreshToken,
        refreshToken,
      );
      if (!isRefreshTokenMatched) {
        throw new UnauthorizedException('Invalid refresh token');
      }

    const currentUser = { id: user.id };

    return currentUser;
  }

  async refreshToken(userId: number, name: string) {
    const { accessToken, refreshToken } = await this.generateToken(userId);
    const hashedRefreshToken = await hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      id: userId,
      name: name,
      accessToken,
      refreshToken,
    };
  }

  async signOutUser(userId: number) {
    return await this.userService.updateHashedRefreshToken(userId, null);
  }
}
