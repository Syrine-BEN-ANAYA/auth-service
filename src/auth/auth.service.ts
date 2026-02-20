import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    if (!email || !password)
      throw new UnauthorizedException('Email et mot de passe requis');

const user = await this.userModel.findOne({ email }).select('+password');
    if (!user || !user.password)
      throw new UnauthorizedException('Email ou mot de passe invalide');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      throw new UnauthorizedException('Email ou mot de passe invalide');

    const { password: _, ...result } = user.toObject();
    return result;
  }

  // src/auth/auth.service.ts

async login(email: string, password: string) {
  const user = await this.userModel.findOne({ email }).select('+password');
  if (!user) throw new UnauthorizedException('Invalid credentials');

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

  return {
    access_token: this.jwtService.sign({ sub: user._id, role: user.role }),
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword, // important
    },
  };
}

  async createUser(email: string, password: string, role: string) {
    if (!email || !password || !role)
      throw new BadRequestException('Email, mot de passe et rôle requis');

    const existing = await this.userModel.findOne({ email });
    if (existing)
      throw new BadRequestException('Cet email est déjà utilisé');

    const hashedPassword = await bcrypt.hash(password, 10);

    // username par défaut si manquant
    const username = email.split('@')[0];

    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      role,
      mustChangePassword: false,
    });

    const user = await newUser.save();
    const { password: _, ...result } = user.toObject();

    await this.auditService.log({
      userId: user._id.toString(),
      action: 'CREATE_USER',
      entity: 'USER',
    });

    return result;
  }

  async changePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword, mustChangePassword: false },
      { new: true },
    );

    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    await this.auditService.log({
      userId: user._id.toString(),
      action: 'CHANGE_PASSWORD',
      entity: 'USER',
    });

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async changeEmail(userId: string, newEmail: string) {
    const existing = await this.userModel.findOne({ email: newEmail });
    if (existing && existing._id.toString() !== userId)
      throw new BadRequestException('Cet email est déjà utilisé');

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { email: newEmail },
      { new: true },
    );

    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    await this.auditService.log({
      userId: user._id.toString(),
      action: 'CHANGE_EMAIL',
      entity: 'USER',
    });

    const { password: _, ...result } = user.toObject();
    return result;
  }
}
