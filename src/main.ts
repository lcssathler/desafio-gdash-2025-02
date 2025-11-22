import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);

  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });

  try {
    await usersService.create(
      'admin@example.com',
      '123456',
      'Admin',
    );
    console.log('Admin user created');
  } catch (error) {
    if (error.code === 11000) {
      console.log('Admin user already exists');
    }
  }

  await app.listen(3000);
  console.log('API running on http://localhost:3000');
}
bootstrap();