import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service.js';
import * as config from '@nestjs/config';
import { AuthJwtPayload } from '../types/auth-jwtPayload.js';
import refreshConfig from '../config/refresh.config.js';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    private readonly authService: AuthService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: config.ConfigType<typeof refreshConfig>,
  ) {
    const secret = refreshTokenConfig.secret;

    if (typeof secret !== 'string' || !secret) {
      throw new Error('JWT secret must be a non-empty string');
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AuthJwtPayload) {
    const userId = payload.sub;
    return this.authService.validateRefreshToken(userId);
  }
}
