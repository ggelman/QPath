# Q-Path Backend

Backend API para a plataforma educacional Q-Path - Quantum Security Engineering.

## Tecnologias Utilizadas

- **FastAPI** - Framework web moderno e rápido para Python
- **SQLModel** - ORM moderno baseado em SQLAlchemy e Pydantic
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e sessões
- **Alembic** - Migrações de banco de dados
- **JWT** - Autenticação via tokens
- **Docker** - Containerização
- **Poetry** - Gerenciamento de dependências

## Estrutura do Projeto

```
backend/
├── app/
│   ├── core/           # Configurações e utilitários centrais
│   │   ├── config.py   # Configurações da aplicação
│   │   ├── database.py # Conexão com banco de dados
│   │   ├── security.py # Autenticação e segurança
│   │   └── auth.py     # Middleware de autenticação
│   ├── models/         # Modelos de dados SQLModel
│   │   └── models.py   # Definições de tabelas e esquemas
│   ├── repositories/   # Camada de acesso a dados
│   │   └── base.py     # Repositórios para operações de BD
│   ├── services/       # Lógica de negócio
│   │   └── user_service.py # Serviços de usuário e gamificação
│   ├── api/            # Endpoints da API
│   │   └── v1/         # Versão 1 da API
│   │       ├── __init__.py
│   │       ├── auth.py      # Autenticação
│   │       ├── users.py     # Usuários
│   │       ├── gamification.py # Sistema de gamificação
│   │       └── projects.py  # Hub de projetos
│   └── main.py         # Aplicação principal FastAPI
├── alembic/            # Migrações de banco de dados
├── pyproject.toml      # Configuração Poetry
├── docker-compose.yml  # Serviços Docker
├── Dockerfile         # Imagem da aplicação
├── alembic.ini        # Configuração Alembic
└── .env.example       # Variáveis de ambiente
```

## Funcionalidades Implementadas

### Sistema de Autenticação
- ✅ Registro de usuários
- ✅ Login com JWT tokens
- ✅ Refresh tokens
- ✅ Reset de senha
- ✅ Middleware de autenticação
- ✅ Roles (user, moderator, admin)

### Sistema de Gamificação
- ✅ Perfis de gamificação
- ✅ Sistema de XP e níveis
- ✅ Sequências (streaks) diárias
- ✅ Log de atividades
- ✅ Ranking de usuários
- ✅ Níveis: Iniciante → Explorador → Especialista → Mestre → Quantum Guardian

### Hub de Projetos
- ✅ Submissão de projetos (Research/Startup)
- ✅ Status de aprovação
- ✅ Histórico de submissões
- ✅ Painel de moderação

### Modelos de Dados
- ✅ Users (usuários)
- ✅ GamificationProfile (perfis de gamificação)
- ✅ ActivityLog (log de atividades)
- ✅ UserProjectSubmission (submissões de projetos)

## Configuração de Desenvolvimento

### Pré-requisitos
- Python 3.11+
- Poetry
- Docker e Docker Compose
- PostgreSQL (via Docker)

### Instalação

1. **Instalar dependências**:
```bash
cd backend
poetry install
```

2. **Configurar variáveis de ambiente**:
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. **Iniciar serviços com Docker**:
```bash
docker-compose up -d postgres redis
```

4. **Executar migrações**:
```bash
poetry run alembic upgrade head
```

5. **Iniciar aplicação**:
```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://qpath:qpath_password@localhost:5432/qpath_db

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Environment
ENVIRONMENT=development
DEBUG=true

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
ALLOWED_HOSTS=["localhost", "127.0.0.1"]
```

## API Endpoints

### Autenticação (`/api/v1/auth`)
- `POST /login` - Login de usuário
- `POST /refresh` - Renovar token
- `POST /logout` - Logout
- `POST /forgot-password` - Solicitar reset de senha
- `POST /reset-password` - Resetar senha
- `GET /me` - Informações do usuário atual

### Usuários (`/api/v1/users`)
- `POST /register` - Registrar usuário
- `GET /me` - Perfil atual
- `PUT /me` - Atualizar perfil
- `GET /{user_id}` - Perfil público
- `GET /` - Listar usuários (admin)

### Gamificação (`/api/v1/gamification`)
- `GET /dashboard` - Dados agregados do dashboard (tarefas, progresso semanal e resumo das trilhas)
- `PUT /tasks` - Sincronizar tarefas do dashboard (migração a partir do `localStorage`)
- `PATCH /tasks/{task_id}` - Atualizar conclusão de uma tarefa
- `POST /pomodoro-session` - Registrar sessão Pomodoro (atualiza XP e streaks)
- `POST /add-xp` - Adicionar XP (requer `description` para auditoria)
- `GET /rewards` - Listar recompensas personalizadas do usuário
- `POST /rewards` - Criar nova recompensa personalizada
- `PATCH /rewards/{reward_id}` - Atualizar/confirmar recompensa existente
- `GET /profile/details` - Perfil completo com conquistas, recompensas, estatísticas e trilhas
- `GET /profile` - Perfil de gamificação resumido
- `POST /complete-trilha` - Completar trilha
- `GET /activity-logs` - Histórico de atividades
- `GET /leaderboard` - Ranking
- `GET /profile/{user_id}` - Perfil público

### Trilhas (`/api/v1/tracks`)
- `GET /` - Listar trilhas com módulos, lições e progresso do usuário
- `GET /summary` - Resumo compacto de progresso por trilha (usado no dashboard)
- `PATCH /lessons/{lesson_id}` - Atualizar conclusão de lição específica

### Projetos (`/api/v1/projects`)
- `POST /submit` - Submeter projeto
- `GET /my-submissions` - Minhas submissões
- `GET /submission/{id}` - Detalhes da submissão
- `PUT /submission/{id}` - Atualizar submissão
- `GET /all-submissions` - Todas submissões (moderador)
- `GET /public/submission/{id}` - Submissão pública aprovada

## Desenvolvimento

### Executar com Docker
```bash
docker-compose up --build
```

### Criar nova migração
```bash
poetry run alembic revision --autogenerate -m "Descrição da migração"
```

### Aplicar migrações
```bash
poetry run alembic upgrade head
```

### Documentação da API
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Sistema de Gamificação

### Níveis e XP
- **Iniciante**: 0-999 XP
- **Explorador**: 1000-2999 XP
- **Especialista**: 3000-6999 XP
- **Mestre**: 7000-14999 XP
- **Quantum Guardian**: 15000+ XP

### Pontuação por Atividades
- Login diário: 5 XP
- Sessão Pomodoro: 1 XP/minuto (máx 60)
- Completar trilha: 100 XP
- Submeter projeto: 150 XP
- Bônus sequência: 5 XP × dias consecutivos
- Bônus cadastro: 50 XP

## Próximos Passos

1. **Integração com IA (Google Gemini)**
2. **Sistema de notificações**
3. **Trilhas dinâmicas**
4. **Sistema de conquistas/badges**
5. **Analytics e métricas**
6. **Testes automatizados**
7. **Deploy em produção**

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.