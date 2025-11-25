import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather-log.schema';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLog>,
  ) {}

  async saveLog(data: any): Promise<WeatherLog> {
    console.log('Trying to save weather from city', data.cityName, data.temperature + '°C');
    const log = new this.weatherLogModel(data);
    return log.save();
  }

  async getAllLogs(limit = 50) {
    return this.weatherLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getLogsByCity(cityId: number, limit = 100) {
    return this.weatherLogModel
      .find({ cityId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}