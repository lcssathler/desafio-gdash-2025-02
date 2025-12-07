# Weather Forecast

Monitoramento climático de todas as cidades do Brasil, com insights gerados por IA.

## 🧠 Funcionalidades
- Cadastro e login de usuário via autenticação JWT
- Seleção e gerenciamento de cidades brasileiras
- Dashboard com temperatura, precipitação, vento e cobertura de nuvens
- Gráficos comparativos e histórico completo
- Insights automáticos em linguagem natural via Grok (Llama 3.1)
- Exportação de dados em CSV
- Exclusão de cidades
- Atualização automática a cada 30 segundos
- Deploy Railway + Vercel

# 🔗 Links
- Backend + Collector + RabbitMQ + Worker: [Railway dashboard](https://railway.com/invite/N75xMOgHkkw) ou [Railway project link](https://railway.com/project/0e21c556-75ef-4056-91bd-95baccc9060a?environmentId=5623a887-c069-4b0d-b269-6baa8b2d9404)  
- Frontend: [Domínio do deploy](https://weather-forecast-nu-pink.vercel.app/) 
- Youtube: https://youtu.be/BIiGdcNFQMk

## 🛠 Tecnologias
**Frontend**
- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- React Router v6
- Recharts
- Axios + interceptors

**Backend**
- NestJS 10 + TypeScript
- MongoDB + Mongoose
- Groq SDK (IA)

**Infra**
- Docker + Docker Compose

**APIs de Paginação**
- [API de localidade do IBGE](https://servicodados.ibge.gov.br/api/docs/localidades)
- [API de malha geográfica do IBGE](https://servicodados.ibge.gov.br/api/docs/localidades)
- [API da Open Meteo](https://open-meteo.com/en/docs)

## 🌐 Portas
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Collector: `http://localhost:8000`
- MongoDB: `27017`

## 👾 Como Executar (via Docker)
```bash
git clone <seu-repositorio>
cd weather-forecast

cp .env.example .env
cp backend/.env.example backend/.env

docker compose up --build
```

## 🔒 Variáveis de Ambiente
Frontend (frontend/.env)
```
VITE_API_URL=http://localhost:3000
```
Backend (backend/.env)
```
MONGODB_URI=mongodb://mongo:27017/weather
GROQ_API_KEY=sua-chave-groq-aqui
COLLECTOR_URL=http://collector:8000
```
Collector (collector/.env)
```
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
BACKEND_URL=http://backend:3000
```
Worker (worker/.env)
```
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
BACKEND_URL=http://backend:3000
```

## 💻 Coleta de Dados
Um collector externo através de um trigger envia logs via POST a cada 5 minutos. Sendo o responsável por fazer as requisições para as APIs de clima e geografia, há duas threads em execução dentro do collector: 
1. Um endpoint /trigger que escuta o fluxo frontend -> backend para coletar as informações da cidade, as condições climáticas e a previsão de tempo para os próximos 7 dias.
2. Um loop que fica buscando logs atualizados das cidades já selecionadas.

## 👩‍💻 Worker
O worker é responsável por se inscrever em uma fila do RabbitMQ e escutar todas as mensagens que são enviadas pelo collector. Após obter as mensagens armazenadas dentro da fila do RabbitMQ, ele faz uma chamada direta ao backend para persistir os dados no MongoDB.

## ⚙ Groq API
Com os dados consolidados e salvos no banco de dados, o backend envia todas as informações geográficas e climáticas para um modelo de predição para analisar as as previsões futuras com as condições climáticas atuais e gerar um resumo sobre todo o contexto metererológico.

## 

## 🗂 Estrutura do Projeto

```plaintext
weather-forecast/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── frontend/
│   ├── .env                      # VITE_API_URL=http://localhost:3000
│   ├── .env.example
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── lib/
│       │   └── api.ts            # Instância Axios + interceptor
│       ├── interfaces/
│       │   └── CityWeather.ts
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── CityChart.tsx
│       │   ├── ExportCsvButton.tsx
│       │   └── ui/               # shadcn/ui (card, button, skeleton, alert-dialog, etc.)
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── CitySelection.tsx
│       │   └── CityDetail.tsx
│       └── assets/
│
└── backend/
    ├── .env
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── nest-cli.json
    └── src/
        ├── main.ts
        ├── app.module.ts
        └── weather/
            ├── weather.module.ts
            ├── weather.controller.ts   # Todas as rotas REST
            ├── weather.service.ts      # Lógica + Groq SDK
            └── schemas/
                └── weather-log.schema.ts
```

## 🌐 Endpoints da API (Backend)

Base URL: `http://localhost:3000`

| Método  | Rota                                  | Descrição                                           | Parâmetros / Body                              |
|---------|---------------------------------------|-----------------------------------------------------|------------------------------------------------|
| GET     | `/weather/logs`                       | Retorna todos os logs meteorológicos                | Query: `?limit=100` (opcional)                 |
| GET     | `/weather/logs/city/:cityId`          | Logs de uma cidade específica (cityId numérico)     | `:cityId` na URL                               |
| DELETE  | `/weather/logs/city/:id`              | Remove permanentemente uma cidade e todos os seus logs | `:id` = ObjectId do MongoDB (`_id` do log)     |
| POST    | `/weather/log`                        | Recebe novo log do collector                        | JSON com campos: `cityId`, `cityName`, `temperature`, etc. |
| GET     | `/weather/insights/grok/:cityId`      | Insight em inglês gerado por IA          | `:cityId` numérico                             |
| GET     | `/weather/selected-cities`            | Lista as cidades atualmente selecionadas            | Sem parâmetros                                 |
| POST    | `/weather/selected-cities`            | Atualiza cidades selecionadas e dispara collector  | Body: `{ "citiesId": [1, 2, 3] }`              |


## 📸Screenshots
<img width="2400" height="1260" alt="image" src="https://github.com/user-attachments/assets/017efb09-1547-4e46-a8f5-f0d08417e9ca" />
<img width="1086" height="730" alt="image" src="https://github.com/user-attachments/assets/349b83af-4f52-495b-89da-82f9c9d0d39f" />
<img width="985" height="844" alt="image" src="https://github.com/user-attachments/assets/bcf7e822-cd89-4ccd-9991-52567006d56f" />
<img width="1551" height="896" alt="image" src="https://github.com/user-attachments/assets/675e8eb4-aceb-449d-8da7-481eac236626" />
<img width="1540" height="913" alt="image" src="https://github.com/user-attachments/assets/41a26554-43a5-4e50-9939-2ad24f01cdb7" />



