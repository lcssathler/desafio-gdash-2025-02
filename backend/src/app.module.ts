import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CitiesModule } from './cities/cities.module';
import { WeatherModule } from './weather/weather.module';
import { WeatherController } from './weather/weather.controller';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { CitiesController } from './cities/cities.controller';


@Module({
  controllers: [WeatherController, AuthController, UsersController, CitiesController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
    }), 
    MongooseModule.forRootAsync({ 
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL') || 'mongodb://mongo:27017/gdash',
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CitiesModule,
    WeatherModule,
  ],
})
export class AppModule {}