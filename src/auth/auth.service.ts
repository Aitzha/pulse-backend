import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.username, hashedPassword);

    return this.buildTokenResponse(user.id, user.username);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildTokenResponse(user.id, user.username);
  }

  private buildTokenResponse(userId: string, username: string) {
    const payload = { sub: userId, username };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
