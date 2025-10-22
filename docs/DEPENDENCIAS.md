# 📦 Dependências e Tecnologias - Q-Path

**Documentação completa das tecnologias utilizadas e suas versões**

---

## 🎯 **Frontend - Stack Atual**

### **Core Framework**
| Dependência | Versão | Propósito | Documentação |
|-------------|--------|-----------|--------------|
| **React** | ^18.3.1 | Library principal para UI | [React Docs](https://react.dev) |
| **React DOM** | ^18.3.1 | Renderização no DOM | [React DOM](https://react.dev/reference/react-dom) |
| **TypeScript** | ^5.8.3 | Type safety e development experience | [TypeScript](https://www.typescriptlang.org) |
| **Vite** | ^5.4.19 | Build tool e dev server | [Vite Guide](https://vitejs.dev) |

### **UI Components & Styling**
| Dependência | Versão | Propósito | Uso no Q-Path |
|-------------|--------|-----------|---------------|
| **@radix-ui/react-*** | ^1.x | Primitivos acessíveis de UI | Base para todos os componentes |
| **Tailwind CSS** | ^3.4.17 | Utility-first CSS framework | Sistema de design dark tech |
| **tailwindcss-animate** | ^1.0.7 | Animações com Tailwind | Transições smooth no UI |
| **class-variance-authority** | ^0.7.1 | Variantes de componentes | Sistema de design consistente |
| **clsx** | ^2.1.1 | Conditional className utility | Lógica de estilos dinâmicos |
| **tailwind-merge** | ^2.6.0 | Merge de classes Tailwind | Evita conflitos de CSS |

### **Routing & Navigation**
| Dependência | Versão | Propósito | Uso no Q-Path |
|-------------|--------|-----------|---------------|
| **react-router-dom** | ^6.30.1 | Client-side routing | Navegação entre Dashboard, Trilhas, etc. |

### **State Management & Data Fetching**
| Dependência | Versão | Propósito | Uso no Q-Path |
|-------------|--------|-----------|---------------|
| **@tanstack/react-query** | ^5.83.0 | Server state management | Cache e sincronização de dados |

### **Forms & Validation**
| Dependência | Versão | Propósito | Uso no Q-Path |
|-------------|--------|-----------|---------------|
| **react-hook-form** | ^7.61.1 | Form management | Formulários de recompensas/perfil |
| **@hookform/resolvers** | ^3.10.0 | Resolvers para validação | Integração com Zod |
| **zod** | ^3.25.76 | Schema validation | Validação type-safe |

### **Charts & Visualizations**
| Dependência | Versão | Propósito | Uso no Q-Path |
|-------------|--------|-----------|---------------|
| **recharts** | ^2.15.4 | React charts library | Gráficos de progresso e analytics |

### **Icons & Assets**
| Dependência | Versão | Propósito | Uso no Q-Path |
|-------------|--------|-----------|---------------|
| **lucide-react** | ^0.462.0 | Icon library | Ícones consistentes no design system |

### **Utilities & Helpers**
| Dependência | Versão | Propósito | Uso no Q-Path |
|-------------|--------|-----------|---------------|
| **date-fns** | ^3.6.0 | Date manipulation | Formatação de datas e deadlines |
| **react-day-picker** | ^8.10.1 | Date picker component | Seleção de datas para deadlines |

### **UI Enhancements**
| Dependência | Versão | Propósito | Uso no Q-Path |
|-------------|--------|-----------|---------------|
| **sonner** | ^1.7.4 | Toast notifications | Feedback de ações do usuário |
| **next-themes** | ^0.3.0 | Theme management | Dark mode nativo |
| **embla-carousel-react** | ^8.6.0 | Carousel component | Navegação de conteúdo |
| **react-resizable-panels** | ^2.1.9 | Resizable layouts | Interface adaptável |
| **vaul** | ^0.9.9 | Drawer component | Modais e drawers móveis |
| **input-otp** | ^1.4.2 | OTP input component | Futuro: autenticação 2FA |
| **cmdk** | ^1.1.1 | Command palette | Futuro: navegação rápida |

---

## 🛠️ **Development Tools**

### **Build & Development**
| Dependência | Versão | Propósito |
|-------------|--------|-----------|
| **@vitejs/plugin-react-swc** | ^3.11.0 | Fast React refresh com SWC |
| **autoprefixer** | ^10.4.21 | CSS vendor prefixes |
| **postcss** | ^8.5.6 | CSS processing |

### **Linting & Code Quality**
| Dependência | Versão | Propósito |
|-------------|--------|-----------|
| **eslint** | ^9.32.0 | JavaScript/TypeScript linter |
| **@eslint/js** | ^9.32.0 | ESLint JavaScript rules |
| **typescript-eslint** | ^8.38.0 | TypeScript ESLint integration |
| **eslint-plugin-react-hooks** | ^5.2.0 | React Hooks linting rules |
| **eslint-plugin-react-refresh** | ^0.4.20 | React Fast Refresh linting |

### **Type Definitions**
| Dependência | Versão | Propósito |
|-------------|--------|-----------|
| **@types/node** | ^22.16.5 | Node.js type definitions |
| **@types/react** | ^18.3.23 | React type definitions |
| **@types/react-dom** | ^18.3.7 | React DOM type definitions |

### **Additional Tools**
| Dependência | Versão | Propósito |
|-------------|--------|-----------|
| **@tailwindcss/typography** | ^0.5.16 | Typography plugin para artigos |
| **globals** | ^15.15.0 | Global type definitions |
| **lovable-tagger** | ^1.1.10 | Lovable platform integration |

---

## 🔮 **Backend Stack (Planejado)**

### **Core Backend**
| Tecnologia | Versão Alvo | Propósito | Status |
|------------|-------------|-----------|--------|
| **FastAPI** | 0.104+ | Python web framework | 🔄 Planejado |
| **Python** | 3.11+ | Backend language | 🔄 Planejado |
| **PostgreSQL** | 15+ | Primary database | 🔄 Planejado |
| **SQLModel** | Latest | ORM com Pydantic | 🔄 Planejado |

### **AI & Machine Learning**
| Tecnologia | Versão Alvo | Propósito | Status |
|------------|-------------|-----------|--------|
| **OpenAI API** | Latest | LLM para Q-Mentor | 🔄 Planejado |
| **LangChain** | Latest | LLM orchestration | 🔄 Planejado |
| **Sentence Transformers** | Latest | Embeddings para RAG | 🔄 Planejado |

### **Quantum Computing**
| Tecnologia | Versão Alvo | Propósito | Status |
|------------|-------------|-----------|--------|
| **Qiskit** | Latest | Quantum computing SDK | 🔄 Planejado |
| **IBM Quantum Runtime** | Latest | Quantum cloud access | 🔄 Planejado |

### **Security & Infrastructure**
| Tecnologia | Versão Alvo | Propósito | Status |
|------------|-------------|-----------|--------|
| **Docker** | Latest | Containerization | 🔄 Planejado |
| **JWT** | Latest | Authentication | 🔄 Planejado |
| **Argon2** | Latest | Password hashing | 🔄 Planejado |

---

## 📊 **Performance Metrics**

### **Bundle Analysis (Frontend Atual)**
```bash
# Build size (gzipped)
Total bundle: ~500KB
Vendor chunk: ~350KB (React, UI components)
App chunk: ~150KB (Application code)
```

### **Development Performance**
```bash
# Startup time
Cold start: ~2-3 segundos
Hot reload: ~100-300ms
Build time: ~15-20 segundos
```

---

## 🔧 **Configuration Files**

### **Package.json Scripts**
```json
{
  "dev": "vite",                    // Development server
  "build": "vite build",            // Production build
  "build:dev": "vite build --mode development",
  "lint": "eslint .",               // Code linting
  "preview": "vite preview"         // Preview build
}
```

### **Key Config Files**
- **vite.config.ts** - Vite configuration
- **tailwind.config.ts** - Tailwind customization
- **tsconfig.json** - TypeScript configuration
- **eslint.config.js** - ESLint rules
- **postcss.config.js** - PostCSS plugins
- **components.json** - Shadcn/UI configuration

---

## 🚀 **Browser Support**

### **Minimum Requirements**
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### **Features Used**
- ES2020+ features
- CSS Grid & Flexbox
- CSS Custom Properties
- Local Storage API
- Fetch API

---

## 🔍 **Troubleshooting Dependencies**

### **Common Issues**

#### **Peer Dependencies Warnings**
```bash
# Normal - React 18 peer deps are satisfied
npm WARN peer dep missing: @types/react
```

#### **Version Conflicts**
```bash
# If conflicts occur
npm install --force
# or
rm -rf node_modules package-lock.json && npm install
```

#### **TypeScript Errors**
```bash
# Check types
npx tsc --noEmit

# Clear TypeScript cache
rm -rf node_modules/.cache
```

---

## 📈 **Futuras Otimizações**

### **Bundle Optimization**
- [ ] Code splitting por rota
- [ ] Lazy loading de componentes
- [ ] Tree shaking optimization
- [ ] Dynamic imports para features

### **Performance Improvements**
- [ ] Service Worker para cache
- [ ] Image optimization
- [ ] CDN para assets estáticos
- [ ] Bundle analyzer integration

### **Development Experience**
- [ ] Storybook para componentes
- [ ] Vitest para testing
- [ ] Husky para git hooks
- [ ] Prettier para code formatting

---

## 📞 **Suporte Técnico**

### **Recursos de Debugging**
- React DevTools
- Vite dev server logs
- Browser DevTools
- TypeScript compiler

### **Performance Monitoring**
- Bundle Analyzer
- Lighthouse CI
- Core Web Vitals
- Memory usage profiling