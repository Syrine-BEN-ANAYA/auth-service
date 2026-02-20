import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

/**
 * Rôles disponibles pour les utilisateurs
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  /**
   * Définit si l'utilisateur doit changer son mot de passe
   * true => mot de passe temporaire à changer au premier login
   */
  @Prop({ default: false })
  mustChangePassword: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
