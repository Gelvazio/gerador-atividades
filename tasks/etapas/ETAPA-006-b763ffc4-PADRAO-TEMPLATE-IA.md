## Etapa 006-b763ffc4 — Colocar o repositório no padrão do template de IA

**Tarefa:** #6-b763ffc4-d5bd-4890 · **Pedido em:** 2026-10-14 09:19 · **Executor:** Claude Code (local · main)
**Pedido:** "LEIA A PASTA DE TEMPLATE QUE ADICIONEI ACIMA (C:\fontes\template-inicial-tasks-ia) E
VEJA SE ESTE REPO ESTA NO PADRAO DE TEMPLATE DE IA, SE NAO ESTIVER, COLOQUE ELE NESTE PADRAO"
**Objetivo:** deixar o `gerador-atividades` com a mesma estrutura de regras, quadro, skills,
agentes e hooks do template (commit de origem `6135ac4`), sem perder o histórico nem os geradores.
**Próximo passo:** 006.1 — aguardar a aprovação do plano pelo usuário.

### O que falta hoje (comparação com o template)

| Template | Este repositório |
|----------|------------------|
| `AGENTS.md` (porta de entrada) + `CLAUDE.md` e `GEMINI.md` só importando | Só `CLAUDE.md`, com as regras dentro |
| `.claude/rules/` com INDEX, essentials, git-quick, multiplas-ias, testes-validacao, codigo-solid, codigo-limites-nomes + visualizador | Só `.claude/rules/tasks/` (versão antiga: sem subtarefas) |
| Quadro com **tarefa-mãe + subtarefas**, reserva `lock:` na subtarefa, concluídas movidas para `tasks/task_complete.md`, sem tabela de frentes | Tarefas #1–#5 sem subtarefas, tabela de frentes, sem `task_complete.md` |
| Skills e agentes em `.agents/` (+ cópias em `.claude/`, `.grok/`, `.gemini/`, `.codex/`) | Não tem |
| Hooks do Claude Code (`.claude/hooks/` + `settings.json`) e do Git (`.githooks/`), `.gitattributes`, `package.json` com `sync:agentes` | Não tem |

### Escopo

**Entra:**
- Copiar do template: `AGENTS.md`, `GEMINI.md`, `.claude/rules/` (todas as regras + visualizador
  com `fonte.js` → `Gelvazio/gerador-atividades`), `.claude/hooks/`, `.claude/settings.json`,
  `.agents/`, cópias por IA (geradas por `npm run sync:agentes`), `.githooks/`, `.gitattributes`,
  `scripts/sincronizar-agentes.mjs`, `package.json`; `.gitignore` = o do template + as linhas deste
  projeto (Python, gabaritos). Instalar os hooks do Git neste clone.
- `CLAUDE.md` vira só ponte para o `AGENTS.md`; as regras **deste projeto** (geradores, gabarito
  fora do Git público, prazo padrão, `atividades.html`, quadro em `index.html`, Python
  `C:\Python314\python.exe`) vão para `.claude/rules/projeto-gerador-atividades.md` (≤ 5 KB),
  listado no `INDEX.md`. Validação do projeto (`py_compile`, `node --check`) em
  `testes-validacao.md`.
- **Migrar o quadro** sem perder histórico: códigos novos `GERADOR` (#1), `QUADRO` (#2),
  `PRATICA` (#3), `ATIVIDADES` (#4), `PRAZOS` (#5), `PADRAO` (#6). Cada uma vira mãe + subtarefas:
  `<COD>.1` = o trabalho já entregue (✅ → `task_complete.md`) e `<COD>.2` = aceite do usuário
  (👀, fica no `STATUS.md`). Etapas antigas ficam como estão (histórico) e ganham as seções das
  subtarefas; tabela de frentes sai (frente = "Em uso por").
- **`index.html` da raiz continua sendo o quadro em cards** (pedido seu na #2) com o menu
  Atividades; o leitor (`scripts/quadro/leitor_quadro.py`) passa a ler o modelo novo (subtarefas
  + `task_complete.md`); menu ganha **Regras** → `.claude/rules/index.html` (visualizador do
  template).
- README: seção do padrão (estrutura, hooks, skills) no início, mantendo as seções dos geradores.

**Não entra:** a página-guia `index.html` do template (o `index.html` daqui é o quadro; o guia
fica no repositório do template); mudar geradores ou atividades; `.vscode/` (é seu, porta 5501);
testes automatizados.

### Critério de pronto

Arquivos do template presentes; `npm run check:agentes` com código 0; `node --check` nos `.mjs`;
`bash -n` nos hooks; `git ls-files --eol .githooks` em `lf`; quadro migrado (5 tarefas antigas +
a #6 no modelo novo) e `index.html` regenerado com as subtarefas; geradores rodando como antes.

### Riscos

| Risco | Plano B |
|-------|---------|
| Hook `exigir-reserva` barrar edições sem subtarefa `🔄` de Claude Code | É o comportamento do padrão; a migração reserva a sua subtarefa antes de editar |
| Leitor do `index.html` quebrar com o quadro novo | Reescrever o leitor por nome de coluna e conferir por script |
| Perder histórico das etapas antigas | Etapas não são apagadas; só ganham seções novas |

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| 006.1 | Aprovação do plano pelo usuário | 👀 Aguardando o usuário | — | — |
| 006.2 | Copiar regras, skills, agentes, hooks, scripts e configs do template | ⬜ Pendente | — | `check:agentes`, `node --check`, `bash -n`, eol |
| 006.3 | `CLAUDE.md` ponte + regra do projeto + INDEX + testes-validacao | ⬜ Pendente | — | Leitura; arquivos ≤ 5 KB |
| 006.4 | Migrar quadro (STATUS, task_complete, seções de subtarefa nas etapas) | ⬜ Pendente | — | Conferência por script |
| 006.5 | Leitor do `index.html` no modelo novo + menu Regras | ⬜ Pendente | — | `index.html` com as subtarefas |
| 006.6 | README, commit + push | ⬜ Pendente | — | `git log` |
| 006.7 | Aceite do usuário | ⬜ Pendente | — | — |
