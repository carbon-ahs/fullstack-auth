import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { CreateUserDto } from '../user/dto/create-user.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  // this giving a internal server error if i put same mail for 2 users
  async signupUserV0(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) new ConflictException('User with this email already exists');
    return this.userService.create(createUserDto);
  }

  async signupUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    return this.userService.create(createUserDto);
  }
}
