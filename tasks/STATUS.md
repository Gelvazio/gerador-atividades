# STATUS — Gerador de Atividades

**Objetivo:** gerar as páginas de atividades (objetiva, prática e discursiva) das matérias SENAI
fora do repositório `aulasenai`. · **Partes interessadas:** Professor Gelvazio (decide, aprova e usa)
**Links:** [Regras](../CLAUDE.md) · [Etapas](etapas/) · [Recados](RECADOS.md)

Legenda: ⬜ Pendente · 🔄 Em progresso · ✅ Concluído · ⛔ Bloqueado · 👀 Aguardando o usuário

## 🧭 Frentes de trabalho

| Frente | Tarefa (etapa) | Situação | Atualizado em |
|---|---|---|---|
| local · main | #6 ([006-b763ffc4](etapas/ETAPA-006-b763ffc4-PADRAO-TEMPLATE-IA.md)) plano aguardando aprovação; #1 a #5 aguardam aceite | 👀 Aguardando o usuário | 2026-10-14 09:21 |

## 📌 Tarefas

| Tarefa | Título | Prioridade | Depende de | Status | Em uso por | Etapa |
|---|---|---|---|---|---|---|
| #1-90e93c4a-e4a0-4669 | Cópia independente do gerador de atividades (objetiva, prática, discursiva) | 🟠 Alta | — | 👀 Aguardando aceite | — | [001-90e93c4a](etapas/ETAPA-001-90e93c4a-COPIA-INDEPENDENTE-DO-GERADOR.md) |
| #2-0bf86ac8-1c6a-4f84 | Quadro de tarefas em `index.html` (cards, agente, datas, filtros) | 🟠 Alta | — | 👀 Aguardando aceite | — | [002-0bf86ac8](etapas/ETAPA-002-0bf86ac8-QUADRO-INDEX-HTML.md) |
| #3-4c75f0e1-7980-442c | Gerador `ATIVIDADE-PRATICA.py`: atividade de 1 questão no layout SENAI (HTML, PDF e Word, sem banco) | 🟠 Alta | — | 👀 Aguardando aceite | — | [003-4c75f0e1](etapas/ETAPA-003-4c75f0e1-ATIVIDADE-PRATICA-1-QUESTAO.md) |
| #4-6e1ac89d-4bfc-486c | Menu "Atividades" e página `atividades.html` (matérias em cards, atualizada pelos geradores) | 🟠 Alta | — | 👀 Aguardando aceite | — | [004-6e1ac89d](etapas/ETAPA-004-6e1ac89d-MENU-E-PAGINA-ATIVIDADES.md) |
| #5-5ffac7c5-a87c-42ab | Cards de atividade com prazo de entrega (data/hora inicial e final) no `atividades.html` | 🟠 Alta | — | 👀 Aguardando aceite | — | [005-5ffac7c5](etapas/ETAPA-005-5ffac7c5-CARDS-DE-ATIVIDADE-E-PRAZOS.md) |
| #6-b763ffc4-d5bd-4890 | Colocar o repositório no padrão do template de IA (`template-inicial-tasks-ia`) | 🟠 Alta | — | 👀 Plano aguardando aprovação | local · main (desde 2026-10-14 09:21) | [006-b763ffc4](etapas/ETAPA-006-b763ffc4-PADRAO-TEMPLATE-IA.md) |

## Escopo do projeto

Cópia dos geradores Python de atividades do `aulasenai`, com a raiz do projeto de destino
configurável. A parte de tela (JS/CSS) e o banco continuam no projeto de destino.

## 🗂️ Etapas

| Etapa | Assunto | Arquivo |
|---|---|---|
| 001-90e93c4a | Cópia independente do gerador | [ETAPA-001-90e93c4a-COPIA-INDEPENDENTE-DO-GERADOR.md](etapas/ETAPA-001-90e93c4a-COPIA-INDEPENDENTE-DO-GERADOR.md) |
| 002-0bf86ac8 | Quadro de tarefas em index.html | [ETAPA-002-0bf86ac8-QUADRO-INDEX-HTML.md](etapas/ETAPA-002-0bf86ac8-QUADRO-INDEX-HTML.md) |
| 003-4c75f0e1 | Gerador ATIVIDADE-PRATICA.py (1 questão) | [ETAPA-003-4c75f0e1-ATIVIDADE-PRATICA-1-QUESTAO.md](etapas/ETAPA-003-4c75f0e1-ATIVIDADE-PRATICA-1-QUESTAO.md) |
| 004-6e1ac89d | Menu Atividades e atividades.html | [ETAPA-004-6e1ac89d-MENU-E-PAGINA-ATIVIDADES.md](etapas/ETAPA-004-6e1ac89d-MENU-E-PAGINA-ATIVIDADES.md) |
| 005-5ffac7c5 | Cards de atividade e prazos | [ETAPA-005-5ffac7c5-CARDS-DE-ATIVIDADE-E-PRAZOS.md](etapas/ETAPA-005-5ffac7c5-CARDS-DE-ATIVIDADE-E-PRAZOS.md) |
| 006-b763ffc4 | Padrão do template de IA | [ETAPA-006-b763ffc4-PADRAO-TEMPLATE-IA.md](etapas/ETAPA-006-b763ffc4-PADRAO-TEMPLATE-IA.md) |

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
| Toda atividade nova entra no `atividades.html` (geradores atualizam sozinhos) | 2026-10-14 09:08 | Usuário | Pedido da #4: "sempre que gerar nova atividade deve ser adicionado o link" |
| Prazo padrão de entrega: 1 dia, no dia da geração, 07:00 às 18:00 (gravado na fonte) | 2026-10-14 09:17 | Usuário | Pedido na #5 |

## Pendências (ficou para depois)

| Pendência | Motivo |
|---|---|

## Lições aprendidas

| Lição | Regra |
|---|---|
