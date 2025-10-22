# 🚀 Q-Path: Quantum Career System

Plataforma educacional gamificada para acelerar a jornada rumo a **Senior Quantum Security Engineer** combinando trilhas de aprendizado, gamificação e suporte inteligente.

## 🎯 Visão Geral
- **Missão**: estruturar estudos em PQC, DevSecOps, computação quântica e inglês técnico entre 2025–2029.
- **Resultados esperados**: certificações internacionais, publicações acadêmicas e portfólio comprovado.
- **Pilares do produto**: produtividade diária, trilhas guiadas, hub de projetos e assistente IA (Q-Mentor).

Confira detalhes completos em [Product Vision](docs/overview/product-vision.md) e [MVP Scope](docs/overview/mvp.md).

## ✨ Destaques do Produto
- **Dashboard gamificado** com Pomodoro, XP algorítmico e acompanhamento de metas.
- **Trilhas de aprendizado** para Quantum, Security, Software Engineering e Inglês C1.
- **Hub de projetos** com templates de artigos, checklists de submissão e integração GitHub planejada.
- **Q-Mentor** (roadmap) aplicando método socrático e validação de escrita técnica.

## 🏗️ Arquitetura em Resumo
- **Frontend**: React 18 + TypeScript, Shadcn/UI e Tailwind CSS (Vite).
- **Backend**: FastAPI + PostgreSQL + SQLModel, serviços para autenticação, gamificação e Q-Mentor.
- **Infra**: Docker Compose para desenvolvimento, sandbox planejado para execução Qiskit.

Blueprint completo em [System Architecture](docs/architecture/system-architecture.md) e [Tech Stack & Dependencies](docs/architecture/tech-stack.md).

## 🚀 Quick Start
```bash
# 1. Clone o repositório
git clone https://github.com/ggelman/qpath.git
cd qpath

# 2. Instale as dependências do frontend
npm install

# 3. Execute em modo desenvolvimento
npm run dev
```
Acesse `http://localhost:5173` para testar o dashboard. Para o backend FastAPI consulte [backend/README.md](backend/README.md).

Scripts disponíveis:
```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build de produção
npm run lint     # Linting do projeto
npm run preview  # Preview da build
```

Passos detalhados de setup, smoke tests e troubleshooting estão em [Frontend Setup Guide](docs/setup/frontend.md).

## 🗺️ Roadmap
O planejamento técnico completo, com fases de backend, IA e execução quântica, está em [Technical Roadmap](docs/roadmap/technical-roadmap.md). Relatórios históricos permanecem acessíveis via [Documentation Hub](docs/README.md).

## 📚 Documentação Consolidada
Visite o [Documentation Hub](docs/README.md) para navegar pelo blueprint, roadmap, planos estratégicos e auditoria de documentos.

## 🤝 Contribuindo
Siga o [guia de contribuição](CONTRIBUTING.md) para padronizar commits, atualizar documentação e executar verificações obrigatórias antes do PR.

## 📄 Licença
Projeto desenvolvido para fins educacionais e construção de portfólio na área de Quantum Security Engineering.
