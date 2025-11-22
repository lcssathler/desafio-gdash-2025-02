import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CitiesService {
  private statesCache: any[] | null = null;
  private citiesCache: Map<string, any[]> = new Map();

  async getStates() {
    if (this.statesCache) {
      return this.statesCache;
    }

    console.log('Test finding states');
    const response = await axios.get(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
    );
    
    const states = response.data
      .map(state => ({
        id: state.id,
        sigla: state.sigla,
        nome: state.nome,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    this.statesCache = states;
    return states;
  }

  async getCitiesByState(uf: string) {
    uf = uf.toUpperCase();
    
    if (this.citiesCache.has(uf)) {
      return this.citiesCache.get(uf);
    }

    console.log(`Test searching cities from ${uf}`);
    const response = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
    );

    const cities = response.data.map(city => ({
      id: city.id,
      nome: city.nome,
      latitude: city.microrregiao.mesorregiao.centroide.latitude,
      longitude: city.microrregiao.mesorregiao.centroide.longitude,
    }));

    this.citiesCache.set(uf, cities);
    return cities;
  }
}