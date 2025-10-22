# 🧪 Quality & Reliability Backlog

Conjunto de tarefas focadas em recuperar a suíte de testes do frontend e revisar possíveis duplicidades introduzidas nas últimas mesclas. Utilize estas atividades como complemento ao [Technical Roadmap](./technical-roadmap.md) para garantir estabilidade antes das próximas entregas funcionais.

## 5. Restaurar a suíte de testes do frontend

Diagnosticar por que o comando `npm run test` falha (Vitest não encontrado) e reconfigurar o ambiente para que os testes rodem em qualquer máquina de desenvolvimento.

:::task-stub{title="Corrigir execução dos testes do frontend"}
1. Confirmar se as dependências (`vitest`, `@testing-library/*`, `jsdom`) estão instaladas; caso contrário, alinhar o gerenciador de pacotes (npm/bun) e registrar o procedimento no `docs/setup/frontend.md`.
2. Ajustar `package.json` e `vite.config.ts` caso haja divergências de configuração (ex.: caminhos de `setupFiles`, ambiente `jsdom`, opções globais) que impeçam a inicialização do Vitest.
3. Atualizar ou criar testes mínimos para componentes críticos (ex.: `AuthContext`, `Sidebar`, `QMentorChat`) garantindo que a suíte falhe se houver regressões.
4. Documentar no README e em `package.json` os comandos de teste (`test`, `test:watch`, `test:coverage`) e validar a execução localmente.
5. Integrar o comando à pipeline CI (ou preparar o workflow) para que a verificação seja automática em cada PR.
:::

## 6. Revisar duplicidades pós-merge

Alguns conflitos foram resolvidos aceitando ambas as versões, o que pode ter deixado blocos de código ou strings duplicadas.

:::task-stub{title="Auditar e eliminar duplicações introduzidas nos merges"}
1. Mapear arquivos afetados pelos últimos merges (ex.: `src/contexts/`, `src/pages/` e `docs/`) buscando seções repetidas, componentes duplicados ou comentários redundantes.
2. Comparar cada bloco suspeito com a versão anterior no histórico (`git blame`/`git log`) para decidir qual variante deve permanecer.
3. Refatorar os trechos duplicados, garantindo que não haja regressão de comportamento (rodar build/testes após ajustes).
4. Atualizar a documentação correlata e registrar no `docs/documentation-audit.md` quaisquer arquivos removidos ou consolidados.
5. Abrir follow-up tasks se identificar pontos que demandem refatorações maiores além da remoção da duplicidade.
:::

> Atualize este backlog sempre que novas ocorrências de falhas de teste ou duplicações surgirem, mantendo o projeto estável antes de evoluir funcionalidades.

