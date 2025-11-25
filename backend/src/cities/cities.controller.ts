import { Controller, Get, Param } from '@nestjs/common';
import { CitiesService } from './cities.service';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get('states')
  async getStates() {
    return this.citiesService.getStates();
  }

  @Get('state/:uf')
  async getCities(@Param('uf') uf: string) {
    return this.citiesService.getCitiesByState(uf);
  }
}