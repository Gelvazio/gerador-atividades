# CLAUDE.md — gerador-atividades

<!-- rules-ai:global -->
> 🌐 **Regras globais:** além das regras deste arquivo, valem as regras globais de
> `C:ontesules-ai` (`regras/*.md`, entregues a cada IA pelo arquivo global dela). Em divergência,
> a regra deste projeto prevalece, e o usuário decide o que fazer com cada divergência
> (`rules-ai/CONFLITOS.md`). Ao finalizar uma tarefa: commit + push.


Regras para qualquer IA neste repositório.

- **Quadro de tarefas:** seguir `.claude/rules/tasks/` (`quadro.md`, `ciclo-da-task.md`,
  `frentes-e-reserva.md`); índice em `tasks/STATUS.md`, detalhes na etapa (`tasks/etapas/`).
- **Quadro em `index.html`:** gerado por `python scripts/gerar_quadro.py` (tela em
  `scripts/quadro/`). Regenerar ao **encerrar cada tarefa** e commitar no mesmo commit; nunca
  editar o `index.html` à mão.
- **Página `atividades.html` (menu "Atividades"):** um card por matéria com o link de cada
  atividade gerada. **Toda atividade nova entra nela:** `gerar.py` e `ATIVIDADE-PRATICA.py`
  atualizam sozinhos; gerador novo deve chamar `gerar_pagina_atividades()` ao terminar; página
  criada de outro jeito → `python scripts/gerar_pagina_atividades.py`. Commitar o
  `atividades.html` junto com a atividade; nunca editar à mão.
- **Prazo de entrega:** toda atividade tem data e hora inicial e final na fonte `.md`; padrão =
  1 dia, no dia da geração, das 07:00 às 18:00 (gravado na fonte na primeira geração por
  `geradores/comum/prazo.py`). Gerador novo deve usar `prazo.garantir_prazo_na_fonte` e
  `prazo.tags_meta`.
- **Git:** tudo na `main`; `git pull --rebase origin main` antes de começar; **1 commit + push por
  tarefa** (remoto `origin` = github.com/Gelvazio/gerador-atividades); nunca `git add .` nem
  `--force`.
- **Gabarito:** nunca no HTML gerado. O remoto é **público**: arquivos com resposta
  (`*GABARITO*`, `*-50-QUESTOES.md`) ficam fora do Git (`.gitignore`), só na máquina local.
- **Sem navegador e sem testes automatizados** (exceto para reproduzir bug): validar por leitura,
  `python -m py_compile`, `node --check` e scripts de conferência.
- **Código:** SOLID, funções ≤ 45 linhas, arquivos ≤ 1000 linhas, nomes em português sem acento,
  JSDoc/docstring em toda função nova.
- Uso dos geradores: `README.md`.
