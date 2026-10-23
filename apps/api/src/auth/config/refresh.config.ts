import 'dotenv/config';

import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export default registerAs('refresh-jwt', (): JwtSignOptions => {
  const secret = process.env.REFRESH_JWT_SECRET;
  const expiresIn = (process.env['REFRESH_JWT_EXPIRES'] || '7d') as any;

  if (!secret || !expiresIn) {
    throw new Error('REFRESH_JWT_SECRET, REFRESH_JWT_EXPIRES is required');
  }

  return {
    secret,
    expiresIn,
  };
});
