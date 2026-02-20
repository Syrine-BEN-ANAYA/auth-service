// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS pour React
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3005',
    credentials: true,
  });

  // ✅ Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const usersService = app.get(UsersService);

  // Vérifie si le SUPER_ADMIN existe déjà
  const existingSuperAdmin = await usersService.findByRole(UserRole.SUPER_ADMIN);

  if (!existingSuperAdmin) {
    // Génération d'un mot de passe temporaire
    const tempPassword = process.env.SUPERADMIN_PASSWORD || Math.random().toString(36).slice(-10);

    await usersService.create(
      {
        username: process.env.SUPERADMIN_USERNAME || 'superadmin',
        email: process.env.SUPERADMIN_EMAIL || 'superadmin@cristal.com',
        password: tempPassword,
        role: UserRole.SUPER_ADMIN,
        mustChangePassword: true, // forcera un changement au premier login
      },
      { role: UserRole.SUPER_ADMIN } as any, // requester mocké
    );

    console.log('SUPER_ADMIN créé avec succès !');
    console.log(`Email: ${process.env.SUPERADMIN_EMAIL || 'superadmin@cristal.com'}`);
    console.log(`Mot de passe temporaire défini (non affiché pour sécurité)`);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
