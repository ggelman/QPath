# 🚀 Q-Path: Quantum Career System

**Plataforma Educacional Gamificada para Quantum Security Engineering**

O Q-Path é uma plataforma de gestão de carreira e aprendizado especializada em formar profissionais na intersecção entre **Software Engineering**, **Computação Quântica** e **Cybersecurity**. Com foco específico na meta de se tornar um **Senior Quantum Security Engineer** até 2029.

---

## 🎯 **Visão Geral**

### **Missão**
Criar uma jornada estruturada e gamificada para especialização em **Post-Quantum Cryptography (PQC)** e **DevSecOps**, combinando aprendizado teórico, prática de código e validação acadêmica.

### **Meta Específica**
- **Período**: 2025-2029
- **Objetivo**: Senior Quantum Security Engineer internacional
- **Salário Alvo**: $172k-$300k+ USD/ano
- **Certificações**: C1 Cambridge, DevSecOps, Qiskit Developer

---

## ✨ **Funcionalidades Atuais**

### 🎮 **Sistema de Gamificação**
- Timer Pomodoro integrado (25/5 min)
- Sistema de XP e níveis progressivos
- Conquistas e recompensas personalizadas
- Tracking de streaks de estudo

### 📚 **Trilhas de Aprendizagem**
- **Quantum**: Fundamentos matemáticos → Qiskit → Algoritmos quânticos
- **Security**: Criptografia clássica → AppSec → Post-Quantum Crypto
- **Software**: DevOps → APIs seguras → Arquitetura resiliente
- **Inglês C1**: Preparação Cambridge com foco técnico

### 📝 **Hub de Projetos**
- Editor de código e documentação
- Templates para artigos acadêmicos
- Integração com GitHub (planejada)
- Tracking de publicações científicas

### 🗺️ **Roadmap de Carreira**
- Timeline visual até 2029
- Marcos de certificação
- Tracking de salário objetivo
- Deadlines acadêmicos

### 🤖 **Q-Mentor (IA Assistant)**
- Interface de chat flutuante
- Método socrático para aprendizado
- Validação contextual de escrita
- Suporte técnico focado

---

## 🏗️ **Arquitetura Técnica**

### **Frontend (Atual)**
- **React 18** + TypeScript
- **Shadcn/UI** + Tailwind CSS
- **Vite** para build otimizado
- **TanStack Query** para state management

### **Backend (Planejado)**
- **FastAPI** + Python 3.11+
- **PostgreSQL** com JSONB
- **Docker** containerização
- **JWT** authentication

### **Funcionalidades Avançadas (Roadmap)**
- **LLM Integration** (OpenAI + RAG)
- **Qiskit Execution** seguro (RCE)
- **Analytics Avançado**
- **PWA** com offline support

---

## 🚀 **Quick Start**

### **Pré-requisitos**
- Node.js 18.0+
- npm 9.0+
- Git 2.30+

### **Instalação**

```bash
# 1. Clone o repositório
git clone https://github.com/ggelman/qpath.git
cd qpath

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse http://localhost:5173
```

### **Scripts Disponíveis**
```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build para produção
npm run lint     # Verificação de código
npm run preview  # Preview da build
```

### **Configuração do Backend FastAPI**
O frontend agora consome as rotas reais do backend (`/api/v1`). Para executar o fluxo ponta a ponta:

1. Configure o backend seguindo as instruções de [`backend/README.md`](./backend/README.md).
2. Garanta que as variáveis `.env` do backend estejam preenchidas (especialmente banco, Redis e chaves JWT).
3. Inicie os serviços de suporte (`docker-compose up -d postgres redis`).
4. Rode as migrações `poetry run alembic upgrade head`.
5. Inicie a API: `poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`.

### **Configuração do Frontend (Variáveis de Ambiente)**
Crie um arquivo `.env.local` na raiz com o endpoint do backend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Em ambientes de produção utilize o domínio definitivo no mesmo formato.

## ✅ **Validação Manual Recomendada**
1. Inicie backend e frontend (`npm run dev`) apontando para o mesmo host.
2. Crie um usuário pela tela de registro ou via `POST /api/v1/users/register`.
3. Faça login e verifique no DevTools que os requests `POST /auth/login`, `GET /auth/me` e `GET /gamification/profile` retornam 200.
4. Recarregue a página: o estado deve ser restaurado usando os tokens persistidos e um novo `GET /auth/me` deve ser disparado.
5. Abra o menu do usuário (Sidebar) e confirme que o perfil reflete os dados reais (nome, XP, nível) vindos da API.
6. Interaja com o Q-Mentor: ao enviar uma pergunta verifique o `POST /qmentor/guidance` e a resposta exibida no chat.
7. Opcional: force um `401` (revogue o token no backend) e confirme que o frontend limpa a sessão após falha no refresh.

---

## 📖 **Documentação Técnica**

### **Próximas Implementações**
1. **Backend FastAPI** com PostgreSQL
2. **Sistema de XP algorítmico** com streaks reais
3. **Q-Mentor IA** com método socrático
4. **Execução de código Qiskit** segura
5. **Editor acadêmico** com templates

---

## 🎯 **Funcionalidades para Testar**

### ✅ **Dashboard**
- Timer Pomodoro funcional
- Gráfico de progresso semanal
- Resumo das 4 trilhas
- Lista de próximas tarefas

### ✅ **Sistema de Trilhas**
- Visualização de módulos e lições
- Progresso por trilha
- Marcação de conclusão
- Dependências entre conteúdos

### ✅ **Hub de Projetos**
- Editor de texto com preview
- Abas para Research e Startup
- Checklist de tarefas
- Persistência local

### ✅ **Roadmap de Carreira**
- Timeline vertical até 2029
- Status dos marcos (done/progress/todo)
- Informações de salário
- Tracking de objetivos

### ✅ **Perfil & Gamificação**
- Estatísticas detalhadas (XP, horas, lições)
- Sistema de conquistas
- Recompensas personalizáveis
- Troca entre perfis (Giulia/Yasmin)

### 🔄 **Q-Mentor Chat**
- Interface flutuante funcional
- Simulação de respostas
- *(IA real em desenvolvimento)*

---

## 🛠️ **Stack Tecnológico**

### **Frontend (Implementado)**
- **React 18.3.1** com TypeScript
- **Vite 5.4.19** para build e dev server
- **Shadcn/UI** para componentes
- **Tailwind CSS** para styling
- **Lucide React** para ícones
- **Recharts** para gráficos
- **React Router** para navegação

### **Funcionalidades Avançadas**
- **TanStack Query** para state management
- **React Hook Form** + Zod para formulários
- **date-fns** para manipulação de datas
- **localStorage** para persistência

---

## 🎓 **Contexto Acadêmico**

### **Objetivo de Carreira**
O Q-Path foi desenvolvido especificamente para apoiar a minha jornada de especialização como **Quantum Security Engineer**, combinando:

- **Formação acadêmica**: Sistemas de Informação (FIAP)
- **Certificações internacionais**: Cambridge C1, DevSecOps, Qiskit Developer
- **Validação científica**: Iniciação Científica, publicações em CBSoft/SBSEG
- **Projeto de startup**: Q-Shield Logistics (PQC + Otimização Quântica)

### **Timeline Estratégica**
- **2025-2026**: Fundamentação (Quantum + Security + C1)
- **2027**: Aplicação (IC + Publicações + Salto Plena)
- **2028**: Especialização (Certificações + Startup MVP)
- **2029**: Internacionalização (Senior role + $172k-$300k)

---

## 🤝 **Contribuindo**

### **Próximas Prioridades**
- [ ] Backend APIs com FastAPI + PostgreSQL
- [ ] Sistema de autenticação JWT
- [ ] Integração com LLM para Q-Mentor
- [ ] Execução segura de código Qiskit
- [ ] Analytics avançado com insights

---

## 📄 **Licença**

Este projeto é desenvolvido para fins educacionais e de portfólio, focado na especialização em Quantum Security Engineering.

## 🔗 **Links Úteis**

- [Qiskit Documentation](https://qiskit.org/documentation/) - Para desenvolvimento quântico
- [Cambridge C1 Advanced](https://www.cambridgeenglish.org/exams-and-tests/advanced/) - Certificação de inglês
- [Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography) - Padrões NIST PQC

---

**Q-Path**: *Sua jornada quântica para o futuro da cibersegurança* 🌟
