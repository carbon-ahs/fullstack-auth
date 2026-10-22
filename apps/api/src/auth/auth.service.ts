import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { verify } from 'argon2';
import { AuthJwtPayload } from './types/auth-jwtPayload.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
    const { accessToken } = await this.generateToken(userId);
    return {
      id: userId,
      name: name,
      accessToken,
    };
  }

  async generateToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(payload),
    ]);
    return { accessToken };
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user.');
    }

    const currentUser = { id: user.id };

    return currentUser;
  }
}
