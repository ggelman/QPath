# Blueprint Arquitetural e Especificação de Componentes

**Q-Path: Plataforma Educacional para Quantum Security Engineering**

Este documento detalha a arquitetura full-stack, modelo de dados, especificações algorítmicas e requisitos de segurança para a implementação da plataforma Q-Path, focando na integração de funcionalidades complexas como execução segura de código quântico (RCE), tutoria socrática com LLM e sistema robusto de gamificação.

---

## I. Arquitetura de Dados e Backend

### 1. Visão Geral da Tecnologia (The Stack)

A fundação tecnológica será centrada no modelo **Python/JavaScript**, especificamente **FastAPI/React/PostgreSQL**.

#### Backend e Serviços de API

**FastAPI** com Python 3.11+ é escolhido por três fatores principais:

1. **Performance**: Aproxima-se dos níveis do Rust, fundamental para tráfego de alto volume
2. **Ecossistema**: Python é dominante em EdTech, análise de dados e desenvolvimento Qiskit
3. **Documentação**: Geração automática de documentação interativa de API

#### Frontend e Experiência do Usuário

- **React.js** com **TypeScript** para robustez e segurança
- **Chakra UI** ou **MUI X Charts** para design moderno e responsivo
- Suporte nativo a **dark mode**

#### Banco de Dados

**PostgreSQL** como sistema de persistência devido à:
- Robustez transacional
- Capacidade de escalar para bases crescentes de usuários
- Ideal para integridade de dados essenciais (avaliações, perfis, matrículas)

### 2. Modelo de Domínio Central (LMS Gamificado)

Baseado na arquitetura de LMS gamificado, seguindo normalização 3NF/BCNF.

#### Schema Central

| Entidade | Propósito | Chave Primária/Estrangeira | Atributos Chave |
|----------|-----------|---------------------------|-----------------|
| **Users** | Perfis e Autenticação | user_id (PK) | username, email, role, timezone |
| **Courses** | Estrutura de conteúdo | course_id (PK) | title, description, instructor_id (FK) |
| **Modules** | Agrupamento de lições | module_id (PK) | course_id (FK), title, order_index |
| **Lessons** | Unidades de aprendizado | lesson_id (PK) | module_id (FK), type, estimated_duration_min |
| **Enrollments** | Relação N:M User-Course | (user_id, course_id) (PK) | enrollment_date, status, completion_date |
| **GamificationProfile** | Métricas de gamificação | user_id (PK) | current_level, total_xp, badges_earned (JSONB), last_streak_utc |
| **ActivityLog** | Rastreamento de interações | log_id (PK) | user_id (FK), lesson_id (FK), activity_type, timestamp_utc |
| **UserCodeSubmissions** | Códigos e resultados RCE | submission_id (PK) | user_id (FK), lesson_id (FK), code_content, execution_result_json, status |

#### Integração PostgreSQL JSONB

Uso de **JSONB** para dados flexíveis (badges, contexto de diálogo) mantendo tabelas centrais normalizadas.

---

## II. Funcionalidades Interativas Complexas

### 3. Sistema de Gamificação e Engajamento

#### 3.1. Progressão de XP e Níveis

**Curva Polinomial** para controle de ritmo de aprendizado:

```
XP_para_próximo_nível = base × (nível_atual ^ fator_polinomial) + constante_ajuste
```

Onde:
- **fator_polinomial**: 1.5 - 2.0 (controla inclinação)
- **base** e **constante_ajuste**: variáveis de balanceamento

**Princípios:**
- Simplicidade da fórmula > complexidade
- Distribuição inteligente de XP por atividade
- Configuração ajustável via backend

#### 3.2. Algoritmo de Streak (Gerenciamento de Fuso Horário)

**Arquitetura de Timestamps:**

| Componente | Descrição | Localização | Princípio |
|------------|-----------|-------------|-----------|
| **DB Storage** | `last_streak_utc`, `activity_log.timestamp_utc` | PostgreSQL | Armazenar tudo em UTC |
| **User Timezone** | `Users.timezone` | PostgreSQL | Define meia-noite local |
| **startOfDay()** | Calcula início do dia em UTC | FastAPI Logic | Comparação de datas |
| **canUpdateStreakToday()** | Verifica elegibilidade de streak | FastAPI Logic | Previne múltiplas atualizações |

#### 3.3. Visualização e Timer Pomodoro

- **Recharts** para dashboards dinâmicos (encapsula D3 em React)
- **EasyTimer.js** para timer Pomodoro robusto
- **localStorage** para persistência de estado

### 4. LLM para Tutoria e Análise

#### 4.1. Arquitetura do Socratic Tutor

**System Prompt** seguindo Método Socrático:

1. **Elicit**: Pedir definição/resumo do conceito
2. **Probe**: Desafiar termos, solicitar evidências
3. **Diagnose**: Apontar lacunas lógicas
4. **Deepen**: Conectar a outras ideias
5. **Consolidate**: Aplicar ou ensinar o conceito

**Endpoint**: `/api/v1/llm/socratic_step`
- Gerencia contexto conversacional
- Janela deslizante ou resumos
- **RAG** com materiais específicos (Qiskit docs)

#### 4.2. Análise Estruturada de Escrita Técnica

**Higher Order Concerns (HOCs)** - feedback estruturado:

| Endpoint | Função | Método LLM | Structured Output |
|----------|--------|------------|-------------------|
| `/api/v1/llm/analyze_writing` | Avaliação HOCs | Geração Estruturada | `{"Clarity_Score": float, "Cohesion_Feedback": string}` |
| `/api/v1/llm/socratic_step` | Diálogo Tutor | Geração de Texto | `{"response_type": "Probe", "prompt_text": string}` |
| `/api/v1/llm/retry_validation` | Correção de Erro | Feedback Loop | JSON reparado após falha |

**Características:**
- **Pydantic Schemas** para contrato de dados
- **Métricas quantificáveis** para gamificação
- **Auto-cura** para JSON malformado

---

## III. Execução de Código e Segurança

### 5. Arquitetura de Sandboxing de Código

#### 5.1. Desafio do Remote Code Execution (RCE)

**Solução**: Containerização Docker + Modelo Serverless (FaaS)
- Isolamento absoluto
- Contêiner novo por execução
- Minimiza riscos de persistência

#### 5.2. Hardening do Sandbox

**Práticas de Segurança:**

1. **Isolamento e Recriação**: Contêiner novo a cada execução
2. **Whitelisting de Módulos**: Lista restrita (qiskit, numpy, pandas)
3. **Bloqueio de Módulos Perigosos**: os, subprocess, socket, pickle
4. **Gestão de Recursos**: Limites CPU/memória, timeout de 5s
5. **Princípio do Mínimo Privilégio**: Usuário non-root, sem gravação
6. **Isolamento de Rede**: Apenas comunicação necessária

#### 5.3. Execução de Qiskit e Quantum Backend

- **Qiskit Primitives**: Sampler ou Estimator
- **Session Mode**: Para debugging sequencial eficiente
- **IBM Quantum Runtime**: Backend quântico autenticado

### 6. Segurança da API e Proteção de Dados

#### 6.1. Prioridades OWASP

**Principais Ameaças:**

- **A01 - Broken Access Control**: RBAC rigoroso, validação por requisição
- **A02 - Cryptographic Failures**: Password hashing seguro, TLS/SSL
- **A04 - Insecure Design**: Mitigado por sandboxing RCE e JWT

**EdTech Privacy:**

- **P6 - Insufficient Deletion**: Mecanismos de exclusão completa de PII
- **P7 - Insufficient Data Quality**: Validação Pydantic/SQLModel

#### 6.2. Endurecimento do Backend FastAPI

**Rate Limiting:**
- **Token Bucket Algorithm** via `fastapi-limiter`
- Limites por IP/usuário autenticado
- Proteção para endpoints caros (`/api/v1/llm/*`, `/api/v1/rce/*`)

**Autenticação:**
- **JWT** para autenticação stateless
- **Multi-Factor Authentication (MFA)** para login seguro

---

## Resumo da Arquitetura

### Stack Tecnológico
- **Backend**: FastAPI + Python 3.11+
- **Frontend**: React + TypeScript + Chakra UI
- **Database**: PostgreSQL + JSONB
- **Security**: Docker Sandboxing + JWT + Rate Limiting
- **AI**: LLM com RAG + Structured Output
- **Quantum**: Qiskit + IBM Runtime

### Componentes Core
1. **Sistema de Gamificação** com XP algorítmico e streaks
2. **Tutoria Socrática** com LLM contextualizado
3. **RCE Seguro** para execução de código Qiskit
4. **Analytics Avançado** com dashboards dinâmicos
5. **Segurança Enterprise** com hardening completo