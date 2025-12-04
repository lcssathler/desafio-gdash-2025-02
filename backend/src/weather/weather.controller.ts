import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ConfigService } from '@nestjs/config';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService, private configService: ConfigService) {}

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
    console.log('Retrieved logs: ', logs);
    return { total: logs.length, data: logs };
  }

  @Get('logs/city/:cityId')
  async getLogsByCity(@Param('cityId') cityId: string) {
    const logs = await this.weatherService.getLogsByCity(Number(cityId));
    return { cityId, total: logs.length, data: logs };
  }

  @Get('selected-cities')
  getSelectedCities() {
    return { citiesId: global.selectedCityIds || [] }
  }

  @Post('selected-cities')
  async setSelectedCities(@Body() body: { citiesId: number[] }) {
    global.selectedCityIds = body.citiesId || []

    try {
      await fetch(`${this.configService.get<string>('COLLECTOR_URL')}/trigger`, { method: 'POST' })
    } catch (err) {
      console.log('Error trigger:', err)
    }

    return { message: 'Cities updated and collector started', count: body.citiesId.length }
  }

  @Get('insights/grok/:cityId')
  async getGrokInsights(@Param('cityId') cityId: string) {
    const insight = await this.weatherService.generateGrokInsights(cityId);
    return { insight };
  }
}