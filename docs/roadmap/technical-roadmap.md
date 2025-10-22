# 🗺️ Technical Roadmap — Q-Path

Roadmap consolidado a partir do MVP, blueprint arquitetural e planos de fase. As durações indicadas assumem sprints semanais dedicadas.

## Status Atual
- ✅ Frontend React/TypeScript com dashboard, trilhas, hub de projetos e Q-Mentor UI.
- ✅ Backend FastAPI inicial com autenticação JWT, gamificação e serviços de projeto.
- ❌ Pendências críticas: sandbox Qiskit, IA socrática completa, analytics avançado e integrações externas.

## Fase 1 — Backend Foundation & Core APIs (4–6 semanas)
1. **Infraestrutura de Dados**
   - Estruturar módulos FastAPI com SQLModel e Pydantic.
   - Configurar PostgreSQL + Docker Compose, migrations Alembic e seeds iniciais.
2. **Autenticação e Segurança**
   - Fluxos de login/refresh/logout, roles e política de senhas Argon2.
   - Rate limiting e CORS alinhados ao frontend.
3. **Gamificação**
   - Algoritmo de XP (`base * (level ** 1.8)`), streak por timezone e achievements.
   - Endpoints públicos/privados para perfil, leaderboard e registro de atividades.

## Fase 2 — LLM Integration & Socratic Tutor (3–4 semanas)
1. **Infraestrutura de IA**
   - Conectar OpenAI/Gemini com fallback, armazenar chaves de forma segura e aplicar monitoramento de custo.
   - Implementar RAG com embeddings (conteúdo Qiskit, roadmaps próprios).
2. **Método Socrático**
   - Ciclo de prompts Elicit → Probe → Diagnose → Deepen → Consolidate.
   - Validação estruturada de escrita técnica com Pydantic schemas.
   - Persistir métricas de feedback para alimentar gamificação.

## Fase 3 — Quantum Code Execution (4–5 semanas)
1. **Sandbox Seguro**
   - Containers não privilegiados, whitelisting de libs (`qiskit`, `numpy`, `pandas`), limites de CPU/memória/tempo.
   - Auditoria de submissões e logs para incident response.
2. **Integração Qiskit**
   - Suporte a simuladores locais e IBM Quantum Runtime.
   - Visualização de circuitos e resultados no frontend.

## Fase 4 — Enhanced Learning System (3–4 semanas)
- Trilhas interativas com dependências explícitas, exercícios autoavaliados e conteúdo multimídia.
- Editor acadêmico avançado com templates (ABNT, IEEE, white-paper) e gestão de bibliografia.

## Fase 5 — Analytics & Insights (2–3 semanas)
- Painéis de produtividade (heatmaps, curvas de aprendizado) e previsão de metas.
- Engine de recomendações baseada em ActivityLog e interações do Q-Mentor.

## Fase 6 — External Integrations (3–4 semanas)
- GitHub: sincronizar repositórios, conceder XP por commits e validar projetos publicados.
- Outras integrações futuras: plataformas de certificação, calendários externos e provedores de autenticação social.

## Governança do Roadmap
- Revisitar este documento ao final de cada sprint.
- Atualizar indicadores "✅"/"❌" conforme funcionalidades entram em produção.
- Registrar decisões relevantes no [Documentation Audit](../documentation-audit.md).
