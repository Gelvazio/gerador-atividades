## Etapa 005-5ffac7c5 — Cards de atividade com prazo de entrega no `atividades.html`

**Tarefa:** #5-5ffac7c5-a87c-42ab · **Pedido em:** 2026-10-14 09:11 · **Executor:** Claude Code (local · main)
**Pedido:** "aqui, http://127.0.0.1:5501/atividades.html, dentro da materia, cada atividade deve
aparecer em forma de um card pequeno, deixe o card mae de materia maior pra isso, a atividade deve
ter data de entrega inicial e data de entrega final e hora inicial e hora final"
**Objetivo:** cada atividade num card pequeno dentro do card da matéria, com o prazo de entrega
(data e hora de início e de fim).
**Próximo passo:** 005.6 — aceite do usuário.

### Escopo

**Entra:**
- **Fonte única do prazo = a fonte `.md` da atividade**, 4 campos opcionais no cabeçalho:
  `- **Data de entrega inicial:** 14/10/2026` · `- **Hora de entrega inicial:** 08:00` ·
  `- **Data de entrega final:** 21/10/2026` · `- **Hora de entrega final:** 23:59`.
- Os 3 geradores (`gerar.py` objetiva/discursiva e `ATIVIDADE-PRATICA.py`) gravam o prazo na
  página da atividade em `<meta name="entrega-...">` (dado, sem aparecer); o leitor do
  `atividades.html` lê essas tags.
- `atividades.html`: card da matéria **largura total** (um por linha) e, dentro dele, uma grade de
  **cards pequenos de atividade**: título, tipo, 📅 início (data + hora), 🏁 fim (data + hora) e
  a situação calculada na hora da abertura (⏳ ainda não abriu · 🟢 aberta · 🔴 encerrada);
  sem prazo → "Prazo não definido". Busca continua.
- Validação no gerador: data `DD/MM/AAAA`, hora `HH:MM`, fim depois do início (erro claro).
- README (formato dos campos), regenerar as 2 atividades, quadro regenerado.

**Não entra:** bloquear a página fora do prazo (sem banco/login), testes automatizados.

### Critério de pronto

As 2 atividades geradas com o prazo; `atividades.html` com o card de TESTES DE FRONT-END
contendo 2 cards pequenos com início e fim; `node --check`; conferência por script.

### Riscos

| Risco | Plano B |
|-------|---------|
| Situação (aberta/encerrada) depender do relógio do computador do aluno | É só informativa (não bloqueia) |
| Página antiga sem as tags | Card mostra "Prazo não definido" |

### Decisões

| Decisão | Quando | Quem | Por quê |
|---------|--------|------|---------|
| Prazo padrão = 1 dia, no dia da geração, 07:00 às 18:00 | 2026-10-14 09:17 | Usuário | "o prazo e 1 dia, na data de geracao delas... 7 da manha e... 6 da tarde" |
| Prazo padrão gravado na fonte na 1ª geração | 2026-10-14 09:17 | Claude Code | Para a data não mudar quando a atividade for gerada de novo |

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| 005.1 | Aprovação do plano e datas das 2 atividades | ✅ Concluído | 2026-10-14 09:15 | Usuário: "preencho depois" (aprova; as 2 atividades ficam sem prazo até ele preencher) |
| 005.2 | Leitura e validação do prazo (módulo comum) + meta tags nos 3 geradores/templates | ✅ Concluído | 2026-10-14 09:18 | `py_compile` ok; 3 geradores gravam `<meta>`; data inválida e fim antes do início dão erro |
| 005.3 | Leitor do `atividades.html` lê prazo e tipo | ✅ Concluído | 2026-10-14 09:18 | 2 atividades com tipo, início e fim |
| 005.4 | Tela: card da matéria largo + cards pequenos + situação | ✅ Concluído | 2026-10-14 09:18 | `node --check` ok |
| 005.5 | Prazos nas 2 fontes, regenerar, README, quadro, commit + push | ✅ Concluído | 2026-10-14 09:18 | Prazo 14/10/2026 07:00–18:00 gravado nas 2 fontes; gerar de novo não muda; `git log` |
| 005.6 | Aceite do usuário (abrir `atividades.html`) | 👀 Aguardando o usuário | — | — |
