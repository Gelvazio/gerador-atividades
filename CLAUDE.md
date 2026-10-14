# CLAUDE.md — gerador-atividades

Regras para qualquer IA neste repositório.

- **Quadro de tarefas:** seguir `.claude/rules/tasks/` (`quadro.md`, `ciclo-da-task.md`,
  `frentes-e-reserva.md`); índice em `tasks/STATUS.md`, detalhes na etapa (`tasks/etapas/`).
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
