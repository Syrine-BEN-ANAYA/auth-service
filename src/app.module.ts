import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({ isGlobal: true }),

    // Connexion à MongoDB avec ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // obligatoire pour que ConfigService soit injecté
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        // options supplémentaires si besoin
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),

    // Modules de l'application
    AuthModule,
    UsersModule,
    AuditModule,
  ],
})
export class AppModule {}
