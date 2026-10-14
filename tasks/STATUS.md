# STATUS — Gerador de Atividades

**Objetivo:** gerar as páginas de atividades (objetiva, prática e discursiva) das matérias SENAI
fora do repositório `aulasenai`. · **Partes interessadas:** Professor Gelvazio (decide, aprova e usa)
**Links:** [Regras](../CLAUDE.md) · [Etapas](etapas/) · [Recados](RECADOS.md)

Legenda: ⬜ Pendente · 🔄 Em progresso · ✅ Concluído · ⛔ Bloqueado · 👀 Aguardando o usuário

## 🧭 Frentes de trabalho

| Frente | Tarefa (etapa) | Situação | Atualizado em |
|---|---|---|---|
| local · main | #3 ([003-4c75f0e1](etapas/ETAPA-003-4c75f0e1-ATIVIDADE-PRATICA-1-QUESTAO.md)) plano aguardando aprovação; #1 e #2 aguardam aceite | 👀 Aguardando o usuário | 2026-10-14 09:00 |

## 📌 Tarefas

| Tarefa | Título | Prioridade | Depende de | Status | Em uso por | Etapa |
|---|---|---|---|---|---|---|
| #1-90e93c4a-e4a0-4669 | Cópia independente do gerador de atividades (objetiva, prática, discursiva) | 🟠 Alta | — | 👀 Aguardando aceite | — | [001-90e93c4a](etapas/ETAPA-001-90e93c4a-COPIA-INDEPENDENTE-DO-GERADOR.md) |
| #2-0bf86ac8-1c6a-4f84 | Quadro de tarefas em `index.html` (cards, agente, datas, filtros) | 🟠 Alta | — | 👀 Aguardando aceite | — | [002-0bf86ac8](etapas/ETAPA-002-0bf86ac8-QUADRO-INDEX-HTML.md) |
| #3-4c75f0e1-7980-442c | Gerador `ATIVIDADE-PRATICA.py`: atividade de 1 questão no layout SENAI (HTML, PDF e Word, sem banco) | 🟠 Alta | — | 👀 Plano aguardando aprovação | local · main (desde 2026-10-14 09:00) | [003-4c75f0e1](etapas/ETAPA-003-4c75f0e1-ATIVIDADE-PRATICA-1-QUESTAO.md) |

## Escopo do projeto

Cópia dos geradores Python de atividades do `aulasenai`, com a raiz do projeto de destino
configurável. A parte de tela (JS/CSS) e o banco continuam no projeto de destino.

## 🗂️ Etapas

| Etapa | Assunto | Arquivo |
|---|---|---|
| 001-90e93c4a | Cópia independente do gerador | [ETAPA-001-90e93c4a-COPIA-INDEPENDENTE-DO-GERADOR.md](etapas/ETAPA-001-90e93c4a-COPIA-INDEPENDENTE-DO-GERADOR.md) |
| 002-0bf86ac8 | Quadro de tarefas em index.html | [ETAPA-002-0bf86ac8-QUADRO-INDEX-HTML.md](etapas/ETAPA-002-0bf86ac8-QUADRO-INDEX-HTML.md) |
| 003-4c75f0e1 | Gerador ATIVIDADE-PRATICA.py (1 questão) | [ETAPA-003-4c75f0e1-ATIVIDADE-PRATICA-1-QUESTAO.md](etapas/ETAPA-003-4c75f0e1-ATIVIDADE-PRATICA-1-QUESTAO.md) |

## Riscos

| Risco | Plano B |
|---|---|

## Bloqueios gerais (sem tarefa)

| Bloqueio | Motivo | O que destrava |
|---|---|---|

## Registro de decisões

| Decisão | Quando | Quem | Por quê |
|---|---|---|---|
| Repositório próprio, trabalho na `main`, push só a pedido | 2026-10-14 08:25 | Usuário | Resposta à pergunta inicial |
| Remoto `origin` = github.com/Gelvazio/gerador-atividades; 1 commit + push por tarefa | 2026-10-14 08:40 | Usuário | "ligue ao repo remoto tb" |
| Arquivos com resposta fora do Git (`.gitignore`) | 2026-10-14 08:47 | Claude Code | Remoto público: o aluno não pode ver o gabarito |

## Pendências (ficou para depois)

| Pendência | Motivo |
|---|---|

## Lições aprendidas

| Lição | Regra |
|---|---|
