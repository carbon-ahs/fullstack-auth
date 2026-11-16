import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard.js';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard.js';
import { Public } from './config/decorators/public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  signupUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.signupUser(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  loginUser(@Request() request: any) {
    return this.authService.login(request.user.id, request.user.name);
  }

  @Get('protected')
  getAll(@Request() request: any) {
    return { message: `Protected api. user id : ${request.user.id}` };
  }

  @SetMetadata('IS_PUBLIC', true)
  @Get('publicV0')
  getPublicV0(@Request() request: any) {
    return {
      message: `Public api. publicV0 with @SetMetadata('IS_PUBLIC', true) decorator`,
    };
  }

  @Public()
  @Get('publicV1')
  getPublicV1(@Request() request: any) {
    return { message: `Public api. publicV1 with @Public decorator` };
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
