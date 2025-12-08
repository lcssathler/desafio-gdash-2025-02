<<<<<<< HEAD
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



=======
# Desafio para o processo seletivo GDASH 2025/02

Repositório destinado aos interessados em participar do processo seletivo GDASH 2025/02.

## Sobre o GDASH

No ramo da produção de energia fotovoltaica, há a modalidade de produção compartilhada. Nessa modalidade, diferentes pessoas investem na construção de uma mesma usina fotovoltaica e dividem o retorno finaceiro referente à energia gerada pela usina.

Acreditamos que as energias renováveis terão um lugar dominante em nossa economia pelo resto de nossas vidas. Trabalhamos no sentido de ampliar o impacto positivo que as energias renováveis podem ter no meio ambiente e nas nossas vidas. O sucesso da GDASH é resultado de nossa equipe apaixonada, juntamente com nosso compromisso de oferecer a melhor solução.

Sabemos que negócios enfrentam desafios únicos e por isso oferecemos soluções turnkey, customizadas, economicamente viáveis e seguras.

Somos uma startup em estágio de crescimento e você trabalhará diretamente com os fundadores, ajudando a definir a visão, o produto e a experiência do usuário.

<p align="left">
  <a href="https://www.linkedin.com/company/gdash/">
    <img src="https://img.shields.io/badge/LinkedIn-%230077B5.svg?&style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn Button">
  </a>
  <a href="https://gdash.io/">
    <img src="https://img.shields.io/badge/-Website-red" alt="GDASH Website Button">
  </a>
</p>

## Sobre a vaga

Já pensou em potencializar o setor que mais cresce na galáxia e trabalhar com uma solução que utiliza tecnologia web de ponta, altamente distribuída com foco em performance e disponibilidade? 👀

Os desenvolvedores GDASH são responsáveis por criar e manter aplicações para clientes internos e externos, prover soluções escaláveis, resilientes e altamente disponíveis que sustentem picos de acesso além de atuar como referência técnica e tutores de outros desenvolvedores.

Procuramos por pessoas dinâmicas e que queiram estar aprendendo sempre. Nossa equipe é jovem, motivada e estamos sempre em busca de soluções criativas para alcançar os resultados que nossos clientes esperam. Se você tem esse perfil, é autoconfiante, autodidata e tem facilidade para lidar com desafios diários, essa vaga é para você!

# 🚀 O Desafio

## 🧭 Visão geral
O objetivo deste desafio é desenvolver uma aplicação **full-stack** moderna que integre múltiplas linguagens e serviços, com foco em **integração entre sistemas, dados reais e uso de IA**.

Você deverá construir um sistema que:

1. **Coleta dados climáticos** (via **Open-Meteo** ou **OpenWeather**) da sua **cidade/localização**;  
2. **Envia esses dados periodicamente** para uma **fila** (Message Broker, como RabbitMQ ou até Redis), processada por um **worker em Go**;  
3. **Armazena os dados** em uma **API NestJS** com **MongoDB**;  
4. **Exibe um Dashboard** no frontend (React + Vite + Tailwind + shadcn/ui) com os dados coletados;  
5. Gera **insights baseados em IA** a partir das informações climáticas — podendo ser gerados automaticamente, sob demanda, ou de qualquer outra forma que você julgar adequada;  
6. Inclui:
   - **CRUD de usuários** (com autenticação e usuário padrão);
   - **Página opcional** de integração com uma **API pública paginada** (ex.: PokéAPI, Star Wars API, etc.);
   - **Exportação de dados** em **CSV/XLSX**;  
7. Toda a solução deve rodar via **Docker Compose**.

> ⚙️ **Observação importante:**  
> Os nomes de **endpoints, coleções, entidades, variáveis, bibliotecas e estruturas** usados neste documento são **apenas exemplos ilustrativos**.  
> Você pode (e deve) adotar as convenções e estruturas que considerar mais adequadas, desde que a **funcionalidade final** seja mantida.

---

## 🧩 Stack obrigatória

- **Frontend:** React + Vite + Tailwind + [shadcn/ui](https://ui.shadcn.com)  
- **Backend (API):** NestJS (TypeScript)  
- **Banco de dados:** MongoDB (Atlas ou container)  
- **Fila:** Go + Message Broker (`RabbitMQ`, `Redis`, etc.)  
- **Coleta de dados:** Python (`requests`, `httpx`, `pandas`, etc.)  
- **APIs externas:**
  - Clima (obrigatória): [Open-Meteo](https://open-meteo.com/) ou [OpenWeather](https://openweathermap.org/)
  - Opcional: qualquer API pública com **paginação**, por exemplo:
    - [PokéAPI](https://pokeapi.co/)
    - [SWAPI (Star Wars API)](https://swapi.dev/)
- **Infra:** Docker / Docker Compose  
- **Linguagem base:** **TypeScript obrigatório** (frontend e backend)

---

## ⚙️ Escopo funcional

### 1️⃣ Coleta de dados (Python → Fila)

O serviço em **Python** será responsável por:

- Buscar periodicamente (ex.: a cada 1 hora) dados da **previsão do tempo** da sua cidade/localização;  
- Extrair informações relevantes, como (exemplos):
  - Temperatura
  - Umidade
  - Velocidade do vento
  - Condição do céu
  - Probabilidade de chuva  
- Enviar os dados normalizados para uma **fila** em formato **JSON**.

> 🔹 Estrutura do JSON, nomes de campos e cron/intervalo são **livres** — podem ser adaptados conforme sua arquitetura.

O Python é o **produtor dos dados meteorológicos**. A camada de IA pode ser implementada em Python, no NestJS ou em outro serviço, desde que integrada.

---

### 2️⃣ Fila (Go + Message Broker)

Implemente um **worker em Go**, responsável por:

- Consumir mensagens da fila;  
- Validar e transformar os dados, se necessário;  
- Enviar os registros para a **API NestJS** (por exemplo, um endpoint como `POST /api/weather/logs`);  
- Confirmar as mensagens com **ack/nack**, implementar **retry básico**;  
- Registrar logs das operações principais.

> 📘 **Observação:**  
> O nome do endpoint, o body do JSON e a estrutura de erro são **apenas exemplos** neste README.  
> Você pode definir o contrato de comunicação da forma que achar melhor, desde que o fluxo Python → Message Broker → Go → NestJS funcione corretamente.

Bibliotecas sugeridas (não obrigatórias):

- `github.com/rabbitmq/amqp091-go`  
- `encoding/json`  
- `net/http`  

---

### 3️⃣ API (NestJS + MongoDB)

A API em **NestJS** será o núcleo do sistema, responsável por:

- Receber e armazenar os dados de clima;  
- Expor endpoints para consumo pelo frontend;  
- Orquestrar ou acionar a camada de IA;  
- Gerenciar usuários.

#### a) Dados de clima

Responsabilidades sugeridas:

- Receber registros vindos do worker Go;  
- Armazenar em uma coleção no MongoDB (ex.: `weather_logs`);  
- Expor endpoints, como (exemplos):
  - `GET /api/weather/logs` — listar registros climáticos;
  - `GET /api/weather/export.csv` — exportar CSV;
  - `GET /api/weather/export.xlsx` — exportar XLSX;
  - `GET ou POST /api/weather/insights` — gerar e/ou retornar insights de IA.

Os **insights de IA** podem ser:

- Gerados automaticamente quando novos dados são inseridos;  
- Calculados sob demanda (quando o frontend solicitar);  
- Atualizados de forma agendada.

> 💡 O importante é que o sistema seja capaz de **usar os dados históricos de clima** para produzir informações mais ricas, não apenas listar valores crus.

---

#### b) Usuários

- Implementar um **CRUD completo de usuários** (ex.: `/api/users`);  
- Implementar autenticação (JWT ou similar);  
- Criar um **usuário padrão** automaticamente na inicialização (ex.: `admin@example.com / 123456` — valores podem ser configuráveis via `.env`).

---

#### c) Integração com API pública (opcional)

Como parte opcional do desafio, implemente uma funcionalidade que consuma uma **API pública com paginação**, por exemplo:

- [PokéAPI](https://pokeapi.co/) — listagem de Pokémons + detalhe de um Pokémon;  
- [SWAPI](https://swapi.dev/) — listagem de personagens, planetas ou naves + detalhe.

Sugestão de funcionalidades (opcionais):

- Endpoint no backend que consome a API externa — o frontend não chama a API pública diretamente;  
- Paginação simples;  
- Endpoint de detalhe de um item (ex.: Pokémon, personagem, planeta).

> 🌍 Tanto o nome dos endpoints quanto o desenho das rotas ficam **totalmente a seu critério**.

---

## 🖥️ Frontend (React + Vite + Tailwind + shadcn/ui)

A aplicação frontend deve ser construída com **React + Vite**, estilizada com **Tailwind** e utilizando componentes do **shadcn/ui**.

Ela deve ter, no mínimo, **essas áreas de funcionalidade**:

---

### 🌦️ 1. Dashboard de Clima

O Dashboard será a **página principal** do sistema, exibindo:

- **Dados reais de clima** da sua cidade/localização, obtidos via pipeline Python → Go → NestJS → MongoDB;  
- **Insights de IA** gerados a partir desses dados.

A forma de exibir essas informações é **livre**.

Você pode, por exemplo, incluir:

- **Cards principais** (exemplos):
  - Temperatura atual  
  - Umidade atual  
  - Velocidade do vento  
  - Condição (ensolarado, nublado, chuvoso, etc.)  

- **Gráficos** (exemplos):
  - Temperatura ao longo do tempo;  
  - Probabilidade de chuva ao longo do tempo;  

- **Tabela de registros** (exemplo):
  - Data/hora  
  - Local  
  - Condição  
  - Temperatura  
  - Umidade  
  - Botões para exportar **CSV/XLSX** (integração com os endpoints do backend).

- **Insights de IA** (forma livre), como:
  - Texto explicativo (“Alta chance de chuva nas próximas horas”);  
  - Cards com alertas (“Calor extremo”, “Clima agradável”);  
  - Gráficos ou visualizações adicionais.

> 💡 Tudo acima são **exemplos ilustrativos**.  
> O requisito é: o Dashboard deve **mostrar os dados de clima da região + insights de IA**, mas você decide **como** isso será exibido (layout, tipos de gráfico, componentes etc.).

---

### 🌐 2. Página opcional – API pública paginada

Uma página (por exemplo, `/explorar`) consumindo a funcionalidade opcional do backend que integra com uma API pública paginada.

Exemplos de UX (apenas sugestões):

- Lista de Pokémons com paginação + página de detalhes de um Pokémon;  
- Lista de personagens de Star Wars com paginação + detalhes de um personagem.

---

### 👤 3. Usuários

Requisitos para a parte de usuários:

- Tela de **login**;  
- Rotas protegidas (somente usuário autenticado acessa o Dashboard);  
- CRUD de usuários (listar, criar, editar, remover);  
- Uso de componentes do **shadcn/ui** (Button, Input, Table, Dialog, Toast, etc.);  
- Feedback visual adequado (loading, erro, sucesso).

---

## 📁 Exportação de dados

- O backend deve expor endpoints para exportar dados de clima em **CSV** e **XLSX**;  
- O frontend deve oferecer botões no Dashboard para fazer o download desses arquivos.

---

## 💡 Ideias de insights (para `/api/weather/insights` ou similar)

A forma de aplicar IA é livre. Algumas ideias possíveis:

- Cálculo de média de temperatura e umidade em determinados períodos;  
- Detecção de tendência (temperaturas subindo ou caindo);  
- Pontuação de conforto climático (0–100);  
- Classificação do dia: “frio”, “quente”, “agradável”, “chuvoso”;  
- Alertas: “Alta chance de chuva”, “Calor extremo”, “Frio intenso”;  
- Geração de resumos em texto (ex.: “Nos últimos 3 dias, a temperatura média foi de 28°C, com alta umidade e tendência de chuva no fim da tarde.”).

> 🔍 Os exemplos acima são **sugestões inspiracionais**.  
> O que será implementado (e em qual serviço) fica a seu critério, desde que seja **coerente com os dados de clima**.

---

## 🧠 Critérios de avaliação

- **Funcionalidade completa:** pipeline Python → Message Broker → Go → NestJS → MongoDB → Frontend;  
- **Clareza de arquitetura:** organização de pastas, camadas e responsabilidades;  
- **Qualidade de código:** tipagem, legibilidade, padrões adotados;  
- **Integração entre serviços:** comunicação estável e bem tratada;  
- **Boas práticas:** validação, tratamento de erros, logs, eslint/prettier;  
- **UX:** experiência de uso do Dashboard e das telas;  
- **Criatividade:** na forma de mostrar dados e insights;  
- **Documentação:** README claro, com passos de execução e configuração;  
- **Uso correto do Docker Compose** para subir tudo.

**Bônus (não obrigatório):**

- Logs detalhados por serviço;  
- CI (lint/test) configurado;  
- Dashboard com filtros, múltiplos tipos de gráfico;  
- Deploy em ambiente gratuito (Railway, Render, etc.);  
- Testes automatizados (unitários e/ou e2e).

---

## ⚠️ Regras

- Respeitar termos de uso das APIs utilizadas (Open-Meteo/OpenWeather, PokéAPI, SWAPI, etc.);  
- Não coletar ou armazenar dados pessoais sensíveis;  
- Usar intervalos razoáveis para chamadas às APIs externas;  
- Focar em **integração, clareza e coesão**, não apenas em adicionar complexidade;  
- Você é livre para:
  - Renomear endpoints;
  - Alterar nomes de coleções;
  - Mudar estruturas de diretórios;
  - Escolher bibliotecas auxiliares — desde que a proposta do desafio seja atendida.

---

## 📹 Vídeo obrigatório

Grave um vídeo de **até 5 minutos** explicando:

- Arquitetura geral da aplicação;  
- Pipeline de dados (Python → Message Broker → Go → NestJS → Frontend);  
- Como os insights de IA são gerados e exibidos;  
- Principais decisões técnicas;  
- Demonstração rápida da aplicação rodando via Docker Compose.

O vídeo deve ser enviado via:

- **YouTube (não listado)**.

Inclua o link no README e/ou na descrição do Pull Request.

---

## 🧪 Entrega

A entrega deve ser feita via **Pull Request**, em uma **branch com o seu nome completo**, por exemplo:

- `joao-silva`  
- `maria-fernanda-souza`

O Pull Request deve conter:

- Código do **backend (NestJS)**;  
- Código do **frontend (Vite)**;  
- Código **Python** (coleta de clima);  
- Código **Go** (worker da fila);  
- `docker-compose.yml` com todos os serviços (API, frontend, banco, Message Broker, etc.);  
- Arquivo `.env.example` com todas as variáveis necessárias;  
- Link do vídeo explicativo (YouTube não listado);  
- README com:
  - Como rodar tudo via Docker Compose;  
  - Como rodar o serviço Python;  
  - Como rodar o worker Go;  
  - URLs principais (API, frontend, Swagger, etc.);  
  - Usuário padrão (login/senha) para acesso inicial.

---

## ✅ Checklist rápido

- [ ] Python coleta dados de clima (Open-Meteo ou OpenWeather)  
- [ ] Python envia dados para a fila  
- [ ] Worker Go consome a fila e envia para a API NestJS  
- [ ] API NestJS:
  - [ ] Armazena logs de clima em MongoDB  
  - [ ] Exponde endpoints para listar dados  
  - [ ] Gera/retorna insights de IA (endpoint próprio)  
  - [ ] Exporta dados em CSV/XLSX  
  - [ ] Implementa CRUD de usuários + autenticação  
  - [ ] (Opcional) Integração com API pública paginada  
- [ ] Frontend React + Vite + Tailwind + shadcn/ui:
  - [ ] Dashboard de clima com dados reais  
  - [ ] Exibição de insights de IA  
  - [ ] CRUD de usuários + login  
  - [ ] (Opcional) Página consumindo API pública paginada  
- [ ] Docker Compose sobe todos os serviços  
- [ ] Código em TypeScript (backend e frontend)  
- [ ] Vídeo explicativo (máx. 5 minutos)  
- [ ] Pull Request via branch com seu nome completo  
- [ ] README completo com instruções de execução  
- [ ] Logs e tratamento de erros básicos em cada serviço  

---

Boa sorte! 🚀  
Mostre sua capacidade de integrar múltiplas linguagens e serviços em uma aplicação moderna, escalável e inteligente — unindo **engenharia de dados**, **backend**, **frontend** e **IA aplicada**.
>>>>>>> main
