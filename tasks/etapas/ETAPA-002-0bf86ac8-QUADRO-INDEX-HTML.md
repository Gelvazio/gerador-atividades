## Etapa 002-0bf86ac8 — Quadro de tarefas em `index.html`

**Tarefa:** #2-0bf86ac8-1c6a-4f84 · **Pedido em:** 2026-10-14 08:44 · **Executor:** Claude Code (local · main)
**Pedido:** "crie 1 quadro de nome index.html, que deve mostrar o quadro de tarefas, qual agente
pegou, quando terminou, com cards e filtros"
**Objetivo:** ver o quadro de tarefas (`tasks/STATUS.md` + etapas) em cards, com filtros, num
`index.html` na raiz que abre por duplo clique.
**Próximo passo:** 002.1 — aguardar a aprovação do plano pelo usuário.

### Escopo

**Entra:**
- `index.html` na raiz (gerado; não editar à mão), com os dados **embutidos** (abre sem servidor).
- Gerador `scripts/gerar_quadro.py` que lê o `tasks/STATUS.md` (tabelas "📌 Tarefas" e
  "🧭 Frentes") e cada etapa (itens, próximo passo, executor, datas). Fonte única continua sendo
  o quadro em Markdown.
- Um **card por tarefa**: número, título, prioridade, status, **agente que pegou** (Executor da
  etapa / "Em uso por"), **quando começou** (Pedido em), **quando terminou** (maior "Concluído
  em" dos itens, quando todos estão ✅), progresso dos itens (ex.: 7/9) e próximo passo; ao
  abrir o card, a lista de itens.
- **Filtros:** status, prioridade, agente, busca por texto; contadores por status no topo; faixa
  com as frentes de trabalho.
- Tela separada: `scripts/quadro/modelo.html`, `quadro.css`, `quadro.js` (o gerador junta tudo no
  `index.html`). Data e hora da geração no topo.
- Regra no `CLAUDE.md`: regenerar o `index.html` ao encerrar cada tarefa (mesmo commit).

**Não entra:** editar tarefas pela página, banco, servidor, testes automatizados.

### Critério de pronto

`python scripts/gerar_quadro.py` gera o `index.html` com as tarefas #1 e #2; `node --check` no JS;
conferência por script de que o JSON embutido tem as 2 tarefas com agente e datas. Teste visual
no navegador com o usuário (regra: sem navegador).

### Riscos

| Risco | Plano B |
|-------|---------|
| Formato do `STATUS.md` mudar e o leitor quebrar | Leitor por nome de coluna (não por posição); erro claro dizendo a tabela/coluna |
| `index.html` desatualizado | Data da geração no topo; regra de regenerar ao encerrar tarefa |

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| 002.1 | Aprovação do plano pelo usuário | 👀 Aguardando o usuário | — | — |
| 002.2 | Leitor do quadro (`scripts/quadro/leitor_quadro.py`) | ⬜ Pendente | — | Saída JSON com #1 e #2 |
| 002.3 | Tela: `modelo.html`, `quadro.css`, `quadro.js` (cards, filtros, contadores, frentes) | ⬜ Pendente | — | `node --check` |
| 002.4 | `scripts/gerar_quadro.py` → `index.html` | ⬜ Pendente | — | Script de conferência |
| 002.5 | Regra no `CLAUDE.md` + README + commit + push | ⬜ Pendente | — | `git log` |
| 002.6 | Aceite do usuário (abrir o `index.html`) | ⬜ Pendente | — | — |
