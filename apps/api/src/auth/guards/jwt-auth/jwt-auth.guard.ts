import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../auth.service.js';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../config/decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super(reflector);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // checks in specific route like '/signin', high priority as its in 1st position
      context.getClass(), // checks in whole controller like 'authController'
    ]);

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
