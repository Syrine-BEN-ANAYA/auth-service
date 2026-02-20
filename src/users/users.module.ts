import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  exports: [
    UsersService,
    MongooseModule, // ← Important ! Permet aux autres modules (AuthModule) d'utiliser @InjectModel(User.name)
  ],
    controllers: [UsersController], // ✅ doit être présent

})
export class UsersModule {}
