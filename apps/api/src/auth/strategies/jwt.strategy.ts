import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service.js';
import * as config from '@nestjs/config';
import jwtConfig from '../config/jwt.config.js';
import { AuthJwtPayload } from '../types/auth-jwtPayload.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: config.ConfigType<typeof jwtConfig>,
  ) {
    const secret = jwtConfiguration.secret;

    if (typeof secret !== 'string' || !secret) {
      throw new Error('JWT secret must be a non-empty string');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AuthJwtPayload) {
    const userId = payload.sub;
    return this.authService.validateJwtUser(userId);
  }
}
