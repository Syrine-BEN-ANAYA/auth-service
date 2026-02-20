import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService, // si nécessaire pour register
  ) {}

  /* =========================
     LOGIN
  ========================= */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    // Passe email et password séparément
    return this.authService.login(dto.email, dto.password);
  }

  /* =========================
     REGISTER
     Accessible seulement pour SUPER_ADMIN / ADMIN
  ========================= */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    // Optionnel : assigner rôle si non fourni
    const role = dto.role || UserRole.USER;

    // Crée l’utilisateur via AuthService ou UsersService
    return this.usersService.create(
      {
        username: dto.username,
        email: dto.email,
        password: dto.password,
        role,
        mustChangePassword: true, // obligé de changer au premier login
      },
      { role: UserRole.SUPER_ADMIN } as any, // le user qui fait la création (superadmin)
    );
  }
}
