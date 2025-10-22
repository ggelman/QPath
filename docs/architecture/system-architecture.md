# 🏗️ System Architecture — Q-Path

Este blueprint consolida a visão técnica de alto nível da plataforma, cobrindo frontend, backend, dados, IA e requisitos de segurança.

## 1. Visão Geral da Stack
- **Frontend**: React 18 + TypeScript, Shadcn/UI, Tailwind CSS e Vite.
- **Backend**: FastAPI (Python 3.11+), SQLModel, PostgreSQL e Redis (cache/sessões).
- **Infraestrutura**: Docker/Docker Compose para desenvolvimento, autenticação JWT com refresh tokens e rate limiting.
- **Extensões Futuras**: Execução segura de Qiskit, integração com OpenAI/Gemini e sincronização com GitHub.

## 2. Domínio e Modelo de Dados
| Entidade | Propósito | Campos-chave |
| --- | --- | --- |
| `Users` | Autenticação e preferências (timezone, roles). | `id`, `email`, `role`, `timezone` |
| `GamificationProfile` | Estado de XP, níveis, badges e streaks. | `user_id`, `current_level`, `total_xp`, `streak_state` |
| `ActivityLog` | Eventos de aprendizado e produtividade. | `user_id`, `activity_type`, `xp_awarded`, `timestamp_utc` |
| `Courses/Modules/Lessons` | Estrutura curricular e pré-requisitos. | `order_index`, `estimated_duration`, `lesson_type` |
| `Projects` | Submissões de Research/Startup com status e links GitHub. | `title`, `category`, `status`, `review_notes` |
| `UserCodeSubmissions` | Execuções sandboxed de Qiskit. | `code_content`, `execution_result`, `status`, `limits` |

JSONB é empregado para armazenar badges, contexto de diálogos IA e metadados de recomendações.

## 3. Serviços Backend
- **Autenticação**: tokens JWT assinado, refresh tokens, Argon2 para hashing e política de roles (user/moderator/admin).
- **Gamificação**: serviço dedicado calcula XP por atividade, controla streaks sensíveis a fuso horário e notifica conquistas.
- **Projetos**: repositório e serviço para submissões, incluindo moderação e auditoria.
- **Q-Mentor**: camada de orquestração para prompts socráticos, validação de escrita e sugestões personalizadas.

## 4. Fluxos Principais
1. **Registro/Login** → criação de `User` e `GamificationProfile` com XP inicial.
2. **Sessão de estudo** → front registra pomodoro → backend valida streak → retorna XP/nível atualizado.
3. **Aprendizado guiado** → liberação de lições conforme `ActivityLog` comprova pré-requisitos.
4. **Execução de código** → API encaminha snippet para sandbox Docker com whitelisting (qiskit, numpy, pandas) e limites (CPU, memória, timeout).
5. **Tutoria IA** → backend gera prompts a partir de histórico e materiais RAG, persistindo feedbacks no perfil do usuário.

## 5. Segurança e Compliance
- Armazenamento de timestamps em UTC + conversão para timezone do usuário.
- Rate limiting nos endpoints de autenticação e IA.
- Execução de código em containers não privilegiados com monitoramento de tempo/memória.
- Logs auditáveis para submissões de projetos e interações do Q-Mentor.

## 6. Observabilidade
- Eventos críticos publicados em filas (planejado) para alimentar analytics.
- Métricas de XP, streaks, uso de IA e execução quântica alimentam painéis do dashboard.

## 7. Referências
- [Tech Stack & Dependencies](tech-stack.md)
- [Technical Roadmap](../roadmap/technical-roadmap.md)
- [backend/README.md](../../backend/README.md)
