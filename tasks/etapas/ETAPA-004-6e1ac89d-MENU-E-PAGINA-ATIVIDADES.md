## Etapa 004-6e1ac89d — Menu "Atividades" e página `atividades.html`

**Tarefa:** #4-6e1ac89d-4bfc-486c · **Pedido em:** 2026-10-14 09:02 · **Executor:** Claude Code (local · main)
**Pedido:** "NO INDEX, CRIE UM MENU DE NOME Atividades, que redireciene pra uma pagina de nome
atividades.html, que deve ter a lista de atividades geradas, e sempre que gerar nova atividade
deve ser adicionado o link nesta pagina, adicione esta regra" · "nesta pagina de atividades, as
materias devem aparecer em forma de cards".
**Objetivo:** achar todas as atividades geradas numa página só, organizada por matéria, sempre
atualizada pelos geradores.
**Próximo passo:** 004.1 — aguardar a aprovação do plano pelo usuário.

### Escopo

**Entra:**
- Menu no topo do `index.html` (quadro) e do `atividades.html`: **Quadro de tarefas** ·
  **Atividades** (link para `atividades.html`).
- `atividades.html` na raiz (gerado; não editar à mão): **um card por matéria** (pastas com
  `materia.json`): nome da UC, curso, quantidade de atividades e a lista de links das páginas de
  `<MATERIA>/ATIVIDADES/*.html` (título tirado do `<title>` da página; o `index.html` da pasta
  entra como "Índice"). Busca por texto que filtra matérias e atividades.
- Gerador `scripts/gerar_pagina_atividades.py` (+ tela em `scripts/atividades/`: `modelo.html`,
  `atividades.css`, `atividades.js`); menu em CSS compartilhado `scripts/menu/menu.css`.
- **Atualização automática:** `gerar.py` e `ATIVIDADE-PRATICA.py` chamam o gerador da página ao
  terminar (toda atividade nova entra na lista sem passo manual).
- **Regra** no `CLAUDE.md` e no README: atividade nova → link no `atividades.html` (automático
  pelos geradores; se a página for criada de outro jeito, rodar o script).

**Não entra:** banco, login, mudar as páginas das atividades, testes automatizados.

### Critério de pronto

`atividades.html` com o card de TESTES DE FRONT-END e as 2 atividades; gerar uma atividade
atualiza a página sozinho; menu presente nas duas páginas; `node --check` e conferência por script.

### Riscos

| Risco | Plano B |
|-------|---------|
| Página HTML criada à mão não entrar na lista | Regra manda rodar `python scripts/gerar_pagina_atividades.py` |
| Matéria sem `materia.json` | Card usa o nome da pasta |

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| 004.1 | Aprovação do plano pelo usuário | 👀 Aguardando o usuário | — | — |
| 004.2 | Leitor das atividades + `scripts/gerar_pagina_atividades.py` | ⬜ Pendente | — | Saída com 1 matéria e 2 atividades |
| 004.3 | Tela da página (cards por matéria, busca) + menu compartilhado | ⬜ Pendente | — | `node --check` |
| 004.4 | Menu no `index.html` (modelo do quadro) | ⬜ Pendente | — | Link presente |
| 004.5 | `gerar.py` e `ATIVIDADE-PRATICA.py` atualizam a página sozinhos | ⬜ Pendente | — | Gerar atividade e conferir a página |
| 004.6 | Regra no `CLAUDE.md` + README, quadro regenerado, commit + push | ⬜ Pendente | — | `git log` |
| 004.7 | Aceite do usuário | ⬜ Pendente | — | — |
