# ⚽ Bomba Bet — Bolão da Copa

Aplicação de **bolão (palpites) da Copa do Mundo** desenvolvida no Hackathon da **UNIALFA**.
Os usuários palpitam o placar das partidas, ganham pontos conforme a precisão do palpite e
disputam um ranking. O projeto é dividido em duas partes:

- **Backend (Java + Spring Boot):** API REST consumida pelo app + um painel administrativo web (Thymeleaf).
- **Frontend (React Native + Expo):** aplicativo mobile (Android / iOS / Web) para os participantes.

---

## 📑 Sumário

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do repositório](#-estrutura-do-repositório)
- [Sistema de pontuação](#-sistema-de-pontuação)
- [Como executar o backend](#-como-executar-o-backend)
- [Como executar o app (frontend)](#-como-executar-o-app-frontend)
- [Endpoints da API](#-endpoints-da-api)
- [Painel administrativo](#-painel-administrativo)
- [Equipe](#-equipe)

---

## ✨ Funcionalidades

### Para o participante (app mobile)
- Cadastro, login e recuperação de senha.
- Visualização das próximas partidas e do calendário de jogos.
- Registro, edição e exclusão de palpites de placar.
- Acompanhamento da pontuação pessoal e de placares exatos.
- Ranking geral dos participantes (com versão pública).
- Edição do perfil (nome, e-mail, foto).

### Para o administrador (painel web)
- Dashboard com indicadores (usuários ativos, acessos nas últimas 24h, partidas pendentes, total de palpites).
- CRUD de **seleções** (nome, código FIFA, grupo, bandeira).
- CRUD de **partidas** (fase, grupo, estádio, data/hora).
- Início de partida, lançamento e correção de resultados (recalcula a pontuação automaticamente).
- Gestão de **usuários** (bloquear/desbloquear, ativar/desativar, alterar privilégio).

---

## 🛠 Tecnologias

### Backend
- **Java 21** + **Spring Boot 3.5.3**
- Spring Web, Spring Data JPA, Spring Security
- Autenticação **JWT** (`jjwt 0.12.6`)
- **Thymeleaf** (painel administrativo)
- **MySQL** (via `mysql-connector-j`)
- Lombok • Bean Validation • Maven

### Frontend
- **React Native 0.85** + **React 19**
- **Expo ~56** + **Expo Router** (navegação por arquivos)
- **TypeScript**
- `@react-native-async-storage/async-storage` (persistência do token)
- `expo-video`, `expo-image-picker`, `@expo/vector-icons`

---

## 📁 Estrutura do repositório

```
Hackathun/
├── Java/bombaBet/                  # Backend Spring Boot
│   └── src/main/java/com/example/bombaBet/
│       ├── api/                    # Controllers REST (/api/**) + DTOs
│       ├── config/                 # SecurityConfig (2 cadeias: API JWT + painel web)
│       ├── model/                  # Entidades JPA: Usuario, Selecao, Partida, Palpite
│       ├── repository/             # Repositórios Spring Data JPA
│       ├── security/               # JwtService + JwtAuthenticationFilter
│       ├── service/                # Regras de negócio (inclui pontuação)
│       └── web/controller/         # Controllers Thymeleaf (painel /admin)
│   └── src/main/resources/
│       ├── templates/              # Telas do painel (admin/, auth/, fragments/)
│       └── application.properties  # Configuração (banco, JWT)
│
└── React/                          # App mobile Expo
    ├── app/                        # Rotas (expo-router)
    │   ├── (tabs)/                 # Início, Partidas, Palpites, Ranking, Perfil
    │   ├── login.tsx / register.tsx / forgot-password.tsx
    │   └── match/[id].tsx          # Detalhe da partida
    ├── components/                 # Componentes de UI reutilizáveis
    ├── contexts/AuthContext.tsx    # Estado de autenticação
    ├── services/                   # Camada de acesso à API
    ├── constants/theme.ts          # Tema (dark)
    └── types/domain.ts             # Tipos de domínio
```

---

## 🎯 Sistema de pontuação

A cada resultado lançado, os palpites da partida são recalculados:

| Critério | Condição | Pontos |
|----------|----------|:------:|
| **Placar exato** | acertou os gols das duas seleções | **10** |
| **Vencedor / empate** | acertou só quem venceu (ou o empate) | **5** |
| **Erro total** | errou o resultado | **0** |

A pontuação total e a contagem de placares exatos de cada usuário são atualizadas
automaticamente. Partidas **ao vivo** (`EM_ANDAMENTO`) não geram pontos — apenas o
lançamento do resultado final (`ENCERRADA`) pontua.

---

## 🚀 Como executar o backend

### Pré-requisitos
- **JDK 21**
- **MySQL** em execução (o projeto foi desenvolvido com **XAMPP**)
- Maven (ou use o wrapper `./mvnw` incluído)

### 1. Banco de dados
Crie o banco `bolao` (as tabelas são criadas automaticamente pelo Hibernate — `ddl-auto=update`):

```sql
CREATE DATABASE bolao;
```

### 2. Configuração
Ajuste, se necessário, o arquivo
[`application.properties`](Java/bombaBet/src/main/resources/application.properties):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bolao
spring.datasource.username=root
spring.datasource.password=          # vazio por padrão (XAMPP)

bombaBet.jwt.secret=MinhaChaveSuperSecretaBombaBetComMaisDe32Caracteres
bombaBet.jwt.expiration=86400000     # 24h em milissegundos
```

> ⚠️ Em produção, mova `jwt.secret` e as credenciais do banco para variáveis de ambiente —
> não versione segredos.

### 3. Executar

```bash
cd Java/bombaBet

# Linux/macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

A aplicação sobe em **http://localhost:8080**.
- API REST: `http://localhost:8080/api`
- Painel admin: `http://localhost:8080/admin` (requer login como `ADMIN`)

---

## 📱 Como executar o app (frontend)

### Pré-requisitos
- **Node.js** (LTS)
- **Expo CLI** (via `npx`)
- Emulador Android/iOS ou o app **Expo Go** no celular

### 1. Instalar dependências

```bash
cd React
npm install
```

### 2. Apontar para a API

A URL base é definida em [`services/api.ts`](React/services/api.ts). Por padrão usa
`http://10.0.2.2:8080/api` (localhost da máquina visto pelo **emulador Android**).
Para celular físico ou web, defina a variável de ambiente com o IP da sua máquina:

```bash
# exemplo
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080/api npx expo start
```

### 3. Executar

```bash
npm start          # inicia o Metro/Expo
npm run android    # abre no Android
npm run ios        # abre no iOS
npm run web        # abre no navegador
```

---

## 🔌 Endpoints da API

Base: `/api`. Rotas marcadas com 🔒 exigem token JWT no header `Authorization: Bearer <token>`.

### Autenticação — `/api/auth`
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/cadastro` | Cria um novo usuário |
| `POST` | `/login` | Autentica e retorna o token JWT |
| `POST` | `/forgot-password` | Gera um token de recuperação de senha |
| `POST` | `/reset-password` | Redefine a senha usando o token |

### Usuários — `/api/usuarios`
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Lista/pesquisa usuários (`?termo=`) |
| `GET` | `/me` 🔒 | Perfil do usuário autenticado |
| `PUT` | `/me` 🔒 | Atualiza o próprio perfil |
| `PATCH` | `/me/senha` 🔒 | Altera a própria senha |
| `GET` | `/ranking` | Ranking paginado por pontuação |
| `PATCH` | `/{id}/privilegio` • `/bloquear` • `/ativar` … | Ações administrativas |

### Seleções — `/api/selecoes` (GET público)
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Lista/pesquisa seleções (`?nome=`) |
| `GET` | `/codigo/{codigoFifa}` | Busca por código FIFA |
| `POST` / `PUT` / `DELETE` | `/...` | CRUD (admin) |

### Partidas — `/api/partidas` (GET público)
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Lista (filtros: `?fase=`, `?status=`, `?data=`) |
| `GET` | `/proximas` | Próximas 10 partidas agendadas |
| `POST` | `/{id}/iniciar` | Inicia a partida |
| `POST` | `/{id}/resultado` | Lança o resultado (`?golsCasa=&golsVisitante=`) |
| `PUT` | `/{id}/resultado` | Corrige o resultado |

### Palpites — `/api/palpites` 🔒
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/meus` | Palpites do usuário autenticado |
| `POST` | `/` | Registra um palpite |
| `PUT` | `/{id}` | Edita um palpite |
| `DELETE` | `/{id}` | Exclui um palpite |

---

## 🖥 Painel administrativo

Acessível em `http://localhost:8080/admin`, com autenticação por formulário (sessão).
Apenas usuários com privilégio **`ADMIN`** conseguem acessar — os demais são redirecionados
para a tela de login. O painel cobre o dashboard de indicadores e a gestão de seleções,
partidas, resultados e usuários.

---

## 👥 Equipe

Projeto desenvolvido por estudantes da **UNIALFA** durante o Hackathon.

---

> _Projeto acadêmico — Bolão da Copa._
