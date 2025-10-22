# ⚙️ Frontend Setup Guide

Guia oficial para preparar o ambiente local do frontend React/TypeScript.

## Pré-requisitos
| Ferramenta | Versão Mínima | Link |
| --- | --- | --- |
| Node.js | 18.0+ | https://nodejs.org |
| npm | 9.0+ | Incluído no Node.js |
| Git | 2.30+ | https://git-scm.com |
| VS Code (opcional) | Última | https://code.visualstudio.com |

### Extensões VS Code sugeridas
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Auto Rename Tag

## Instalação
```bash
# Clonar o repositório
git clone https://github.com/ggelman/qpath.git
cd qpath

# Instalar dependências
npm install
```

## Scripts NPM
```bash
npm run dev      # inicia o servidor Vite com hot reload
npm run build    # gera build de produção
npm run lint     # executa ESLint
npm run preview  # valida a build localmente
```

A aplicação estará disponível em `http://localhost:5173` por padrão.

## Smoke Tests Manuais
1. **Dashboard** — verificar timer Pomodoro, gráfico semanal e lista de tarefas.
2. **Trilhas** — expandir módulos, marcar lições como concluídas, conferir persistência em localStorage.
3. **Hub de Projetos** — alternar entre abas, usar modo preview e validar checklist.
4. **Roadmap de Carreira** — conferir milestones e status (done/in progress/todo).
5. **Perfil & Recompensas** — checar estatísticas, criar recompensa e alterar usuário (Giulia/Yasmin).
6. **Q-Mentor Chat** — abrir janela flutuante e validar resposta simulada.

## Troubleshooting
| Problema | Solução |
| --- | --- |
| Dependências inconsistentes | `rm -rf node_modules package-lock.json && npm install` |
| Porta 5173 ocupada | `npm run dev -- --port 3000` ou encerrar processo (`lsof -i :5173`). |
| Erros TypeScript | `npx tsc --noEmit` para validar tipos e revisar `tsconfig.json`. |

> Para executar os serviços de backend consulte o [guia oficial](../../backend/README.md).
