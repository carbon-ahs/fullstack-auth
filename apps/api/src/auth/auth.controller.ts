import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard.js';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signupUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.signupUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  loginUser(@Request() request: any) {
    return this.authService.login(request.user.id, request.user.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getAll(@Request() request: any) {
    return { message: `Protected api. user id : ${request.user.id}` };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Request() request: any) {
    return this.authService.refreshToken(request.user.id, request.user.name);
  }
  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signOutUser(@Req() request: any) {
    return this.authService.signOutUser(request.user.id);
  }
}
