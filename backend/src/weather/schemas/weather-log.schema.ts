import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class ForecastItem {
  @Prop({ required: true })
  date: string; 

  @Prop({ required: true })
  tempMean: number;

  @Prop({ required: true })
  tempMax: number;

  @Prop({ required: true })
  tempMin: number;

  @Prop({required: true})
  precipitationProbMean: number;
}

@Schema({ timestamps: true })
export class WeatherLog extends Document {
  @Prop({ required: true })
  cityId: number;

  @Prop({ required: true })
  cityName: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  temperature: number;

  @Prop()
  apparentTemperature?: number;

  @Prop()
  precipitation?: number;

  @Prop()
  weatherCode?: number;

  @Prop()
  windSpeed?: number;

  @Prop()
  cloudCover?: number;

  @Prop()
  isDay?: boolean;

  @Prop({ default: 'open-meteo' })
  source: string;

  @Prop({ type: [ForecastItem], required: true })
  forecast7d: ForecastItem[];;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

WeatherLogSchema.index({ cityId: 1, createdAt: -1 });