// src/auth/must-change-password.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // Si mustChangePassword = true → interdit l'accès
    if (user.mustChangePassword) {
      throw new ForbiddenException('Vous devez changer votre mot de passe temporaire.');
    }

    return true;
  }
}
