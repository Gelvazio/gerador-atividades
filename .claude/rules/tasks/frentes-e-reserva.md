# 🧭 Frentes e reserva de tarefas

Reutilizável em qualquer projeto em que várias sessões ou IAs (Claude, Gemini, Grok, Copilot…)
trabalham no mesmo repositório e só se falam pelos arquivos. Quadro: `quadro.md`.

## Frentes

- Cada sessão é uma **frente**: `<ambiente> · <branch>` (ex.: `local · main`,
  `nuvem · <nome-da-sessão>`).
- Cada frente atualiza **só a própria linha** em "🧭 Frentes", ao começar e ao parar. Sem
  pendência → `⏹️ Encerrada`.
- O nome da IA/frente aparece na reserva, na linha da frente, no Executor da etapa e na mensagem
  de commit (ex.: `feat(x): ... por Claude Code (local · main)`).

## Pegar uma tarefa

1. Sincronizar com o remoto; **só então** ler o `STATUS.md` (sem sincronizar, o quadro mente).
2. Escolher uma tarefa com **"Em uso por" = `—`** e **todas as dependências ✅**.
3. Entre as livres, a de **maior prioridade** (🔴 → 🟠 → 🟡 → 🟢); empate = ordem do quadro.
   🟢 Baixa só com orientação explícita do usuário.
4. Gravar `<frente> (desde <data hora>)` em "Em uso por", fazer **commit + push imediatos** e só
   então começar o trabalho.
5. Push da reserva recusado → sincronizar, **reler** o quadro; se outra frente pegou a mesma tarefa,
   desfazer a sua reserva e escolher outra.

## Limites

- **1 tarefa reservada por frente.** Só pega a próxima depois de entregar ou liberar a atual.
- ⛔ Nunca mexer na reserva, na linha de frente ou na etapa de outra frente. Reserva "parada" não é
  abandonada: quem libera é **o usuário** (ou quem ele autorizar).
- Tarefa grande demais → dividir em tarefas menores antes de começar, cada uma com prioridade
  (herda a da mãe, ou 🟡) e dependências declaradas.
- A prioridade é **do usuário**; a IA não muda a de tarefas existentes sem pedido.
- Scripts e rascunhos temporários na **pasta da própria sessão**, nunca em pasta compartilhada
  nem no repositório.

## Conflitos

- Conflito no `STATUS.md` ao sincronizar: manter as mudanças das duas frentes (cada uma só mexe
  nas próprias linhas) e reler antes de seguir.
- Arquivo **gerado** em conflito (ex.: visualizador do quadro): não resolver à mão — rodar o
  gerador de novo depois de sincronizar.
- Recado para outra frente (ou para todas) → `tasks/RECADOS.md`; ler os recados ao começar.
