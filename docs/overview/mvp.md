# 🎯 MVP Scope — Q-Path

Este documento consolida as funcionalidades mínimas viáveis para entregar a experiência completa do Q-Path. O MVP está organizado em cinco pilares que cobrem produtividade, aprendizado guiado, produção acadêmica e suporte inteligente.

## 1. Sistema de Engajamento e Produtividade
- **Timer Pomodoro 25/5** com notificações e persistência local.
- **Gamificação**: atribuição de XP por pomodoro, conclusão de módulos e commits GitHub, com níveis e recompensas configuráveis.
- **Painel "Próximo Salto"** destacando lacunas críticas rumo ao cargo alvo.
- **Calendário e lembretes** para provas, deadlines de artigos e eventos importantes.

## 2. Trilhas de Aprendizado (Learning Missions)
- **Desbloqueio progressivo** baseado em pré-requisitos e trilhas paralelas (Quantum, Security, Software, Inglês C1).
- **Conteúdo prático** com foco em aplicação real: simuladores Qiskit, laboratórios de PQC, pipelines DevSecOps e produção textual técnica.
- **Projetos de referência**:
  - *Qubit Playground* — fundamentos de portas quânticas.
  - *Crypto-Playground* — experimentos com ML-KEM/Kyber.
  - *Cloud Secure API* — API FastAPI com autenticação JWT e crypto agility.
  - *Classical vs Quantum Search* — benchmark Grover vs busca clássica.

## 3. Centro de Criação e Publicação
- **Editor estruturado** com templates (Medium/LinkedIn, ABNT, white-paper).
- **Checklists de submissão** para eventos acadêmicos (SBSEG/CBSoft) e projetos de iniciação científica.
- **Integração GitHub planejada** para validar commits e sincronizar portfólio.

## 4. Q-Mentor (Assistente IA)
- **Tutor Socrático** conduzindo ciclos Elicit → Probe → Diagnose → Deepen → Consolidate.
- **Validação contextual de escrita** garantindo que referências técnicas estejam corretas.
- **Suporte técnico** focado em desbloquear dúvidas sobre Qiskit, FastAPI e PQC sem entregar respostas prontas.

## 5. Produtividade, Analytics e Execução Quântica
- **XP algorítmico** com curva polinomial ajustável, streaks por fuso horário e achievements configuráveis.
- **Analytics avançado**: heatmaps de atividade, previsões de metas e recomendações personalizadas.
- **Execução segura de código** via sandbox Docker com whitelisting de bibliotecas quânticas.
- **Monitoramento de performance**: limites de CPU/memória, timeouts e auditoria de submissões.

## Critérios de Aceite Gerais
1. Todas as funcionalidades essenciais são acessíveis via dashboard responsivo.
2. Dados de progresso persistem entre sessões (localStorage e backend quando disponível).
3. Endpoints FastAPI fornecem APIs públicas e autenticadas para XP, streaks, projetos e tutoria.
4. Logs e métricas de uso alimentam recomendações do Q-Mentor e painéis de analytics.

> Consulte o [Technical Roadmap](../roadmap/technical-roadmap.md) para prioridades e estimativas de entrega de cada pilar.
