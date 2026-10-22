import 'dotenv/config';

import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs('jwt', (): JwtModuleOptions => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  return {
    secret,
    signOptions: {
      expiresIn: (process.env['JWT_EXPIRES_IN'] || '15m') as any,
    },
  };
});
