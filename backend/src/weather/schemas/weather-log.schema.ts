import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WeatherLog extends Document {
  @Prop({ required: true })
  cityId: number;

  @Prop({ required: true })
  cityName: string;

  @Prop({ required: true })
  state: string;

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
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

WeatherLogSchema.index({ cityId: 1, createdAt: -1 });