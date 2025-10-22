# 🤝 Contribuindo com o Q-Path

Obrigado por contribuir! Este guia garante consistência entre código e documentação.

## Fluxo Geral
1. Crie uma branch descritiva (`feature/`, `fix/`, `docs/`).
2. Garanta que lint e testes automatizados sejam executados antes do push.
3. Atualize documentação e changelog quando a alteração impactar usuários.
4. Abra PR descrevendo motivação, mudanças e passos de teste.

## Checklist de Documentação
- [ ] Verifique o [Documentation Audit](docs/documentation-audit.md) para evitar criar arquivos duplicados.
- [ ] Atualize os arquivos relevantes em `docs/` e o índice (`docs/README.md`) quando novos tópicos forem adicionados.
- [ ] Mantenha o `README.md` apenas com visão executiva; detalhes técnicos vão para `docs/`.
- [ ] Se um documento for removido/movido, registre no `documentation-audit.md`.
- [ ] Revise links internos e sumários após renomear arquivos.

## Checklist Técnico
- [ ] `npm run lint` (frontend) ou `poetry run task lint` (backend, quando aplicável) executado sem erros.
- [ ] Testes automatizados relevantes executados.
- [ ] Variáveis sensíveis mantidas fora do versionamento.
- [ ] Dependências novas documentadas em `docs/architecture/tech-stack.md`.

## Padrão de Commits
Siga o formato `<tipo>: <resumo>`:
- `feat:` novas funcionalidades.
- `fix:` correções de bug.
- `docs:` atualizações de documentação.
- `refactor:` alterações internas sem mudança de comportamento.
- `chore:` manutenção, atualizações de dependência, scripts.

## Suporte
Dúvidas? Abra uma issue descrevendo o contexto, impacto e seções de código afetadas.
