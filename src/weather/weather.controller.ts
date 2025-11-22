import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('log')
  async receiveWeatherLog(@Body() body: any) {
    if (!body.cityId || !body.cityName || body.temperature === undefined) {
      return { success: false, message: 'Invalid data' };
    }

    await this.weatherService.saveLog(body);
    return { success: true, message: 'Log saved successfully' };
  }

  @Get('logs')
  async getAllLogs(@Query('limit') limit = 50) {
    const logs = await this.weatherService.getAllLogs(Number(limit));
    return { total: logs.length, data: logs };
  }

  @Get('logs/city/:cityId')
  async getLogsByCity(@Param('cityId') cityId: string) {
    const logs = await this.weatherService.getLogsByCity(Number(cityId));
    return { cityId, total: logs.length, data: logs };
  }
}