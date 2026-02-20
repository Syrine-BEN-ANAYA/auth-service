import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { Roles } from 'src/auth/roles.decorator';

@Controller('auth')
export class AuditController {
  constructor(private auditService: AuditService) {}

  // 🔹 Récupère les audits de l'utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Get('audits')
  async getMyAudits(@Req() req: any) {
    console.log('req.user:', req.user); // debug
    const userId = req.user.sub || req.user._id;
    console.log('Requête audits pour userId =', userId);

    const audits = await this.auditService.findByUser(userId);
    console.log('Audits trouvés =', audits.length);

    return audits;
  }

  // 🔹 Admin : récupérer tous les audits
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('audits/all')
  async getAllAudits() {
    const audits = await this.auditService.findAll();
    console.log('Tous les audits trouvés =', audits.length);
    return audits;
  }
}

