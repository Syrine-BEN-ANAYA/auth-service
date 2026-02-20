import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './schemas/user.schema';
import { MustChangePasswordGuard } from 'src/auth/must-change-password.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // ❌ ne plus mettre MustChangePasswordGuard ici
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* =========================
     CREATE USER
     ✅ doit être protégé par MustChangePasswordGuard
  ========================= */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(MustChangePasswordGuard)
  create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.usersService.create(createUserDto, req.user);
  }

  /* =========================
     GET ALL USERS
     ✅ protégé par MustChangePasswordGuard
  ========================= */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(MustChangePasswordGuard)
  findAll() {
    return this.usersService.findAll();
  }

  /* =========================
     GET ONE USER
     ✅ protégé par MustChangePasswordGuard
  ========================= */
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(MustChangePasswordGuard)
  findOne(@Param('id') id: string) {
    this.validateObjectId(id);
    return this.usersService.findOne(id);
  }

  /* =========================
     UPDATE USER
     ✅ protégé par MustChangePasswordGuard
  ========================= */
  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(MustChangePasswordGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    this.validateObjectId(id);
    return this.usersService.update(id, dto, req.user);
  }

  /* =========================
     DELETE USER
     ✅ protégé par MustChangePasswordGuard
  ========================= */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(MustChangePasswordGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    this.validateObjectId(id);
    return this.usersService.remove(id, req.user);
  }

  /* =========================
     CHANGE PASSWORD
     🔓 accessible même si mustChangePassword = true
  ========================= */
  @Put('change-password/:id')
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.USER,
)
@UseGuards(JwtAuthGuard, RolesGuard)
changePassword(
  @Param('id') id: string,
  @Body() dto: ChangePasswordDto,
  @Req() req: any,
) {
  this.validateObjectId(id);
  return this.usersService.changePassword(id, dto, req.user);
}


  /* =========================
     PRIVATE VALIDATOR
  ========================= */
  private validateObjectId(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID invalide');
    }
  }
}
