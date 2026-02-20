import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // src/users/users.service.ts
async create(createUserDto: CreateUserDto, requester: UserDocument) {
  // Vérifie SUPER_ADMIN
  if (
    createUserDto.role === UserRole.SUPER_ADMIN &&
    requester.role !== UserRole.SUPER_ADMIN
  ) {
    throw new ForbiddenException('Vous ne pouvez pas créer un SUPER_ADMIN');
  }

  const existing = await this.userModel.findOne({ email: createUserDto.email });
  if (existing) {
    throw new BadRequestException('Nom d’utilisateur déjà utilisé');
  }

  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  // mustChangePassword forcé pour USER/MANAGER si non défini
  const mustChangePassword =
    createUserDto.mustChangePassword ??
    [UserRole.USER, UserRole.MANAGER].includes(createUserDto.role);

  const createdUser = new this.userModel({
    ...createUserDto,
    password: hashedPassword,
    mustChangePassword,
  });

  return await createdUser.save();
}


  async findAll() {
    return this.userModel.find().exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, requester: UserDocument) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (user.role === UserRole.SUPER_ADMIN && requester.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas modifier un SUPER_ADMIN');
    }

    delete (updateUserDto as any).password;
    delete (updateUserDto as any).mustChangePassword;

    Object.assign(user, updateUserDto);
    return user.save();
  }

  findByRole(role: UserRole) {
    return this.userModel.findOne({ role });
  }

  async remove(id: string, requester: UserDocument) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (user.role === UserRole.SUPER_ADMIN && requester.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer un SUPER_ADMIN');
    }

    await this.userModel.findByIdAndDelete(id).exec();
    return { message: 'Utilisateur supprimé avec succès' };
  }

  async changePassword(id: string, dto: ChangePasswordDto, requester: UserDocument) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if ([UserRole.USER, UserRole.MANAGER].includes(requester.role)) {
      if (requester._id.toString() !== id) {
        throw new ForbiddenException('Vous ne pouvez changer que votre propre mot de passe');
      }
      if (!user.mustChangePassword) {
        throw new ForbiddenException('Mot de passe déjà définitif');
      }
    }

    user.password = await bcrypt.hash(dto.password, 10);
    user.mustChangePassword = false;
    await user.save();

    return { message: 'Mot de passe modifié avec succès' };
  }
}
