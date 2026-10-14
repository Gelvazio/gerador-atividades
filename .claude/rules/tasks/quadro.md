# 🗂️ Quadro de tarefas — fonte única

Esta pasta (`.claude/rules/tasks/`) serve para **qualquer projeto**: não tem nada específico de um
projeto. Para usar em outro, copie a pasta e crie `tasks/STATUS.md` e `tasks/etapas/` pelos
modelos abaixo. Ciclo da tarefa: `ciclo-da-task.md` · várias sessões: `frentes-e-reserva.md`.

## Cada informação em um lugar só

| Informação | Lugar único |
|------------|-------------|
| Pedido, objetivo, próximo passo, escopo, riscos, itens e status de cada item | **Etapa** da tarefa: `tasks/etapas/ETAPA-NNN-<uuid8>-ASSUNTO.md` |
| Status geral, prioridade, dependências e reserva | Linha da tarefa em "📌 Tarefas" do `tasks/STATUS.md` |
| Tarefa que cada sessão está fazendo | Linha da frente em "🧭 Frentes" do `tasks/STATUS.md` |
| Decisões, riscos, pendências e lições do projeto | Seções do `tasks/STATUS.md` |
| Recados entre sessões | `tasks/RECADOS.md` (só se acrescentam linhas) |

- ⛔ Não copiar para outro lugar: sem `TASKS.md`, sem plano separado em `docs/`, sem lista de
  pendências do usuário montada à mão, sem cópia da fila em tabela de banco.
- O que o usuário precisa fazer = itens **👀** das etapas (filtrar; não copiar).
- O que não está no quadro não aconteceu. Histórico nunca é apagado: só se acrescentam etapas.
- Quadro em formato antigo → migrar para este modelo levando o conteúdo, sem perder histórico.
- Linguagem simples, que quem não é técnico entende.

## Legenda

⬜ Pendente · 🔄 Em progresso · ✅ Concluído · ⛔ Bloqueado (motivo + o que destrava) ·
👀 Aguardando o usuário

## Modelo do `tasks/STATUS.md`

```markdown
# STATUS — <Projeto>

**Objetivo:** <1 frase> · **Partes interessadas:** <quem decide / aprova / usa>
**Links:** [Regras](../AGENTS.md) · [Etapas](etapas/) · [Recados](RECADOS.md)

## 🧭 Frentes de trabalho
| Frente | Tarefa (etapa) | Situação | Atualizado em |

## 📌 Tarefas
| Tarefa | Título | Prioridade | Depende de | Status | Em uso por | Etapa |

## Escopo do projeto
## 🗂️ Etapas            (uma linha por etapa, criada junto com ela; nunca apagar)
| Etapa | Assunto | Arquivo |
## Riscos · ## Bloqueios gerais (sem tarefa) · ## Registro de decisões
## Pendências (ficou para depois) · ## Lições aprendidas
```

- **Status** na linha da tarefa: só o emoji e 1–3 palavras (`🔄 Em execução`); o detalhe fica na
  etapa. **Prioridade:** 🔴 Máxima · 🟠 Alta · 🟡 Média · 🟢 Baixa (definida pelo usuário).
- Seção sem conteúdo fica com a tabela vazia (não apagar o cabeçalho).

## Modelo da etapa

```markdown
## Etapa NNN-<uuid8> — <título>

**Tarefa:** #NN-<uuid> · **Pedido em:** AAAA-MM-DD HH:MM · **Executor:** <IA (frente)>
**Pedido:** <palavras de quem pediu>
**Objetivo:** <1 frase: o que e por quê>
**Próximo passo:** NNN.x — <ação exata>

### Escopo · ### Riscos · ### Decisões     ← só em tarefa grande (o plano é a etapa)

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| NNN.1 | … | ⬜ Pendente | — | <como foi conferido> |
| NNN.x | Aceite do usuário | ⬜ Pendente | — | — |
```

- Número da etapa sequencial + 8 caracteres de um UUID (evita número repetido entre sessões).
- Itens pequenos (horas, não semanas), na ordem de execução.
