import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);

  const allowedOrigins = [
    configService.get('FRONTEND_URL'),
    "http://localhost:5174",
    "http://localhost:5173",
    "https://weather-forecast-nu-pink.vercel.app",
    "https://weather-forecast-nu-pink.vercel.app/",
    "https://weather-forecast-mbjbvdtqa-lcssathlers-projects.vercel.app",
  ];

  app.enableCors({
    origin: (origin: any, callback: (arg0: Error | null, arg1: boolean | undefined) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`), false);
      }
    },
    credentials: true,
  });;

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

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

bootstrap();