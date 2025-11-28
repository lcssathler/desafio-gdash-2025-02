import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather-log.schema';
import Groq from 'groq-sdk'; 

@Injectable()
export class WeatherService {
  private groq: Groq;

  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLog>,
    private configService: ConfigService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

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

  async generateGrokInsights(cityId: string): Promise<string> {
    // 1. Busca os últimos 7+ logs da cidade + forecast
    const logs: WeatherLog[] = await this.weatherLogModel
      .find({ cityId: Number(cityId) })
      .sort({ createdAt: -1 })
      .limit(7)
      .exec();

    if (logs.length === 0) {
      return "Nenhum dado climático disponível para análise da IA.";
    }

    const latestLog = logs[0];
    const cityName = latestLog.cityName;

    // Histórico recente (últimos 7 dias)
    const historico7dias = logs.map(log => ({
      data: new Date(log.time).toLocaleDateString('pt-BR'),
      temp: log.temperature,
      precipitation: log.precipitation || 0
    }));

    // Previsão 7 dias
    const previsao7dias = latestLog.forecast7d || [];

    // Prompt mantido exatamente como o original
    const prompt = `
Você é um meteorologista experiente do Brasil, especialista em análise climática para energia solar.

Analise os dados reais da cidade **${cityName}** e gere um insight humano, conversacional e em inglês. Foque em tendências, riscos e recomendações para geração de energia fotovoltaica.
Exemplo: "De acordo com os dados recentes, a temperatura tem mostrado uma tendência de elevação gradual, o que é favorável para a eficiência dos painéis solares. No entanto, há um aumento na probabilidade de precipitação nos próximos dias, o que pode impactar a geração de energia. Recomendo monitorar as condições climáticas e considerar sistemas de armazenamento de energia para maximizar o uso durante períodos nublados."
Retorne o insight em inglês fluente, aprofundado e útil. Tudo em uma única mensagem. Ignore qualquer outro formato, sem tabelas, listas, marcações, etc.

**Dados atuais (hoje):**
- Temperatura: ${latestLog.temperature}°C
- Sensação térmica: ${latestLog.apparentTemperature}°C
- Precipitação: ${latestLog.precipitation}mm
- Cobertura de nuvens: ${latestLog.cloudCover}%
- Vento: ${latestLog.windSpeed} km/h
- Código climático: ${latestLog.weatherCode}

**Histórico dos últimos 7 dias:**
${historico7dias.map(d => `- ${d.data}: Temp ${d.temp}°C, precipitação ${d.precipitation}mm`).join('\n')}

**Previsão para os próximos 7 dias:**
${previsao7dias.map((d, i) => `- ${d.date}: Média ${d.tempMean}°C (máx ${d.tempMax}°C, mín ${d.tempMin}°C), Média de Probabilidade de Chuva: ${d.precipitationProbMean}`).join('\n')}

Gere 2-3 frases naturais e úteis:
- Descreva a tendência (elevação, estabilidade, oscilação)?
- Há risco de calor extremo, chuva forte ou algo fora do normal?
- Recomendação para energia solar (boa para painéis? Risco de interrupção?).

Fale como se estivesse conversando com um amigo engenheiro solar, em inglês fluente e natural.
`;

    try {
      // Utilizando o SDK oficial do Groq
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "Você é um meteorologista inglês experiente, amigável e especialista em energia solar. Responda sempre em inglês natural e útil." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        // Certifique-se que o modelo no .env é compatível com Groq (ex: llama3-8b-8192 ou mixtral-8x7b-32768)
        model: this.configService.get<string>('GROQ_MODEL') || 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 300,
      });

      // Retorna o conteúdo da primeira escolha ou uma string vazia se falhar
      return chatCompletion.choices[0]?.message?.content?.trim() || "No content generated.";

    } catch (error: any) {
      console.error('Error getting AI data via Groq SDK:', error);
      return "Unable to generate AI insights.";
    }
  }
}