import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CitiesService {
  private citiesCache: Map<string, any[]> = new Map();
  private statesCache: any[] | null = null;

  async getStates() {
    if (this.statesCache) {
      return this.statesCache;
    }

    console.log('Buscando estados do IBGE...');
    const response = await axios.get(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
    );

    const states = response.data
      .map((state: any) => ({
        id: state.id,
        sigla: state.sigla,
        nome: state.nome,
      }))
      .sort((a: any, b: any) => a.nome.localeCompare(b.nome));

    this.statesCache = states;
    return states;
  }

  async getCitiesByState(uf: string) {
    uf = uf.toUpperCase();

    if (this.citiesCache.has(uf)) {
      return this.citiesCache.get(uf);
    }

    console.log(`Searching cities from: ${uf}`);
    const response = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
    );

    const cities = response.data.map((city: any) => {
      const centroide = city?.microrregiao?.mesorregiao?.centroide;
      const latitude = centroide?.latitude ?? 0;
      const longitude = centroide?.longitude ?? 0;

      return {
        id: city.id,
        nome: city.nome,
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    });

    this.citiesCache.set(uf, cities);
    console.log(`${cities.length} cities from ${uf}`);
    return cities;
  }
}