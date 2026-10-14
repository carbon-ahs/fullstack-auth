import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signupUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) new ConflictException('User with this email already exists');
    return this.userService.create(createUserDto);
  }
}
