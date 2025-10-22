# 🧰 Tech Stack & Dependencies

Consolidação das dependências utilizadas no Q-Path, com foco em justificar escolhas, registrar versões e indicar documentação oficial.

## Frontend (Implementado)
| Categoria | Dependências Principais | Versão | Função |
| --- | --- | --- | --- |
| Core | `react`, `react-dom`, `typescript`, `vite` | ^18.3 / ^5.8 / ^5.4 | UI em TS + bundler rápido. |
| UI & Estilização | `@radix-ui/*`, `@shadcn/ui`, `tailwindcss`, `tailwindcss-animate`, `class-variance-authority`, `clsx`, `tailwind-merge` | ^1.x / ^3.4 | Design system acessível e consistente. |
| Navegação & Estado | `react-router-dom`, `@tanstack/react-query` | ^6.30 / ^5.83 | Rotas declarativas e cache de dados. |
| Formulários & Validação | `react-hook-form`, `@hookform/resolvers`, `zod` | ^7.61 / ^3.10 / ^3.25 | Form handling com validação type-safe. |
| Visualizações | `recharts`, `react-day-picker` | ^2.15 / ^8.10 | Gráficos de progresso e seleção de datas. |
| UI Helpers | `sonner`, `lucide-react`, `embla-carousel-react`, `react-resizable-panels`, `vaul`, `input-otp`, `cmdk` | várias | Feedback e componentes avançados. |
| Utilidades | `date-fns` | ^3.6 | Conversão e formatação de datas. |

### Ferramentas de Desenvolvimento
| Função | Dependências | Observações |
| --- | --- | --- |
| Build & Transpilação | `@vitejs/plugin-react-swc`, `postcss`, `autoprefixer` | Hot reload e suporte a CSS moderno. |
| Qualidade de Código | `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` | Regras alinhadas ao ecossistema React/TS. |
| Tipos | `@types/node`, `@types/react`, `@types/react-dom` | Completa cobertura de typings. |

## Backend (Planejado / Em Progresso)
| Categoria | Tecnologia | Status | Função |
| --- | --- | --- | --- |
| Framework | FastAPI 0.104+ | Em desenvolvimento | API de alto desempenho com docs automáticas. |
| Banco de Dados | PostgreSQL 15+, SQLModel, Alembic | Em desenvolvimento | Persistência relacional com migrations. |
| Autenticação | JWT, Argon2, python-jose | Em desenvolvimento | Tokens seguros e hashing robusto. |
| Cache/Mensageria | Redis | Planejado | Cache de sessões e filas de eventos. |
| IA | OpenAI API, Google Gemini, LangChain, Sentence Transformers | Planejado | Tutoria socrática e validação de escrita. |
| Execução Quântica | Qiskit, IBM Quantum Runtime | Planejado | Execução segura de circuitos quânticos. |
| Containerização | Docker, Docker Compose | Em uso | Padronização de ambientes e sandboxing. |

> Para detalhes de setup e variáveis de ambiente consulte o [backend/README.md](../../backend/README.md).
