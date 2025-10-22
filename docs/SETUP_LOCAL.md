# 🚀 Guia de Setup Local - Q-Path

**Como executar o projeto Q-Path localmente para desenvolvimento e testes**

---

## 📋 **Pré-requisitos**

### **Software Necessário**

| Ferramenta | Versão Mínima | Link de Download |
|------------|---------------|------------------|
| **Node.js** | 18.0+ | https://nodejs.org |
| **npm** | 9.0+ | Incluído com Node.js |
| **Git** | 2.30+ | https://git-scm.com |
| **VS Code** | Latest | https://code.visualstudio.com (recomendado) |

### **Extensões VS Code Recomendadas**
```
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Prettier - Code formatter
```

---

## 🔧 **Setup do Frontend (Atual)**

### **1. Clone do Repositório**

```powershell
# Clone o repositório
git clone https://github.com/ggelman/qpath-career-quest.git

# Navegue para o diretório
cd qpath-career-quest
```

### **2. Instalação de Dependências**

```powershell
# Instale as dependências
npm install

# Verificar se tudo foi instalado corretamente
npm list --depth=0
```

### **3. Executar em Modo Desenvolvimento**

```powershell
# Iniciar servidor de desenvolvimento
npm run dev

# O servidor estará disponível em:
# http://localhost:5173
```

### **4. Scripts Disponíveis**

```powershell
# Desenvolvimento (Hot reload)
npm run dev

# Build para produção
npm run build

# Build para desenvolvimento
npm run build:dev

# Lint do código
npm run lint

# Preview da build de produção
npm run preview
```

---

## 🧪 **Testando o Frontend Atual**

### **Funcionalidades para Testar**

#### **1. Dashboard**
- ✅ Timer Pomodoro (25/5 min)
- ✅ Progresso semanal (gráfico)
- ✅ Resumo das trilhas
- ✅ Próximas tarefas

#### **2. Sistema de Trilhas**
- ✅ Visualização das 4 trilhas (Quantum, Security, Software, Inglês)
- ✅ Progresso por módulo
- ✅ Expansão/colapso de lições
- ✅ Marcação de conclusão

#### **3. Hub de Projetos**
- ✅ Editor de texto básico
- ✅ Modo preview
- ✅ Checklist de tarefas
- ✅ Persistência no localStorage

#### **4. Roadmap de Carreira**
- ✅ Timeline vertical
- ✅ Status dos marcos (done/progress/todo)
- ✅ Detalhes de cada milestone

#### **5. Perfil & Recompensas**
- ✅ Estatísticas (XP, horas, lições)
- ✅ Sistema de conquistas
- ✅ Recompensas personalizadas
- ✅ Criação de novas recompensas

#### **6. Q-Mentor Chat**
- ✅ Interface de chat flutuante
- ✅ Simulação de respostas
- ❌ IA real (ainda não implementada)

#### **7. Sistema de Usuários**
- ✅ Troca entre Giulia e Yasmin
- ✅ Dados separados por usuário
- ✅ Persistência localStorage

---

## 🛠️ **Troubleshooting Frontend**

### **Problemas Comuns**

#### **Erro de Dependências**
```powershell
# Limpar cache e reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

#### **Porta em Uso**
```powershell
# Verificar processos na porta 5173
netstat -ano | findstr :5173

# Matar processo se necessário
taskkill /PID <PID_NUMBER> /F

# Ou usar porta alternativa
npm run dev -- --port 3000
```

#### **Problemas de TypeScript**
```powershell
# Verificar tipos
npx tsc --noEmit

# Verificar configuração
cat tsconfig.json
```

---

## 🗄️ **Preparação para Backend (Futuro)**

### **Dependências Adicionais Necessárias**

```powershell
# Python 3.11+ (para FastAPI backend)
# Instalar via: https://www.python.org/downloads/

# PostgreSQL (para banco de dados)
# Instalar via: https://www.postgresql.org/download/

# Docker Desktop (para containerização)
# Instalar via: https://www.docker.com/products/docker-desktop/
```

### **Estrutura de Pastas Futura**
```
qpath-career-quest/
├── frontend/                 # React atual
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # FastAPI (futuro)
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml        # Orquestração completa
├── docs/                     # Documentação
└── README.md
```

---

## 🔍 **Verificação do Setup**

### **Checklist de Validação**

- [ ] **Node.js instalado**: `node --version` retorna v18.0+
- [ ] **npm funcionando**: `npm --version` retorna v9.0+
- [ ] **Dependências instaladas**: `npm list` sem erros
- [ ] **Servidor iniciando**: `npm run dev` sem erros
- [ ] **Aplicação carregando**: http://localhost:5173 acessível
- [ ] **Hot reload funcionando**: Mudança em arquivo reflete imediatamente
- [ ] **Build funcionando**: `npm run build` executa com sucesso

### **Logs de Sucesso Esperados**

```
VITE v5.4.19  ready in 432 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## 📊 **Monitoramento de Performance**

### **Métricas de Desenvolvimento**

```powershell
# Tamanho do bundle
npm run build
# Verificar: dist/assets/ sizes

# Tempo de build
Measure-Command { npm run build }

# Uso de memória durante desenvolvimento
# Task Manager → Node.js processes
```

### **Otimizações Recomendadas**

```javascript
// vite.config.ts - Configurações de performance
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-*']
        }
      }
    }
  }
}
```

---

## 🔐 **Configurações de Desenvolvimento**

### **Variáveis de Ambiente**

Criar arquivo `.env.local`:
```env
# Frontend only (por enquanto)
VITE_APP_TITLE=Q-Path Development
VITE_DEBUG_MODE=true

# Futuras (Backend integration)
VITE_API_BASE_URL=http://localhost:8000
VITE_OPENAI_API_KEY=your_key_here
VITE_IBM_QUANTUM_TOKEN=your_token_here
```

### **Git Hooks (Recomendado)**

```powershell
# Instalar husky para hooks
npm install --save-dev husky

# Setup pre-commit
npx husky add .husky/pre-commit "npm run lint"
```

---

## 🚀 **Próximos Passos**

### **Para Contribuidores**

1. **Familiarize-se** com o código frontend atual
2. **Teste todas** as funcionalidades descritas
3. **Leia** o ROADMAP_TECNICO.md para próximas implementações
4. **Configure** ambiente de desenvolvimento completo
5. **Identifique** issues para implementação do backend

### **Para Implementação do Backend**

1. **Setup FastAPI** seguindo Blueprint.md
2. **Configurar PostgreSQL** com schema definido
3. **Implementar APIs** de gamificação primeiro
4. **Integrar LLM** para Q-Mentor funcional
5. **Adicionar RCE** para execução Qiskit

---

## 📞 **Suporte e Recursos**

### **Documentação Técnica**
- [MVP.md](./MVP_formatado.md) - Especificação completa
- [Blueprint.md](./Blueprint_formatado.md) - Arquitetura técnica
- [ROADMAP_TECNICO.md](./ROADMAP_TECNICO.md) - Plano de implementação

### **Stack Documentation**
- [Vite Guide](https://vitejs.dev/guide/)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [Shadcn/UI Components](https://ui.shadcn.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### **Community**
- GitHub Issues para bugs/features
- README.md para overview geral
- Código bem comentado para referência