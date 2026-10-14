## Etapa 007-0b5257d3 — Cabeçalho com Docente, Turma e Data nas atividades de Testes de Front-End

**Tarefa:** #7-0b5257d3-3a47-4ae1 · **Pedido em:** 2026-10-14 09:28 · **Executor:** Claude Code (local · main)
**Pedido:** "nestes atividades de testes de frontend coloque professor=GELVAZIO CAMARGO,
Turma=imagem da turma, Data = 14/10/2026, Remova os textos *preenchimento ......* do campo de
estudante" (imagem: "T TIIN 2026/1 M1 · SENAI RIO DO SUL MANHÃ (124519)").
**Objetivo:** as 2 atividades de Testes de Front-End com o cabeçalho já preenchido e o campo do
estudante em branco.
**Próximo passo:** 007.4 — aceite do usuário.

Tarefa pequena (ajuste dos dados do cabeçalho; sem banco, segurança ou estrutura nova): sem plano
separado. Pedido completo: executar direto.

### Decisões

| Decisão | Quando | Quem | Por quê |
|---------|--------|------|---------|
| Campos `- **Docente:**`, `- **Turma:**` e `- **Data:**` na fonte `.md` (vazio = "preenchimento pelo docente"); Estudante sempre em branco | 2026-10-14 09:29 | Claude Code | Fonte única é o `.md`; vale para atividades futuras |
| Turma sem a estrela da imagem: `T TIIN 2026/1 M1 · SENAI RIO DO SUL MANHÃ (124519)` | 2026-10-14 09:29 | Claude Code | A estrela é o ícone de favorito da tela de origem |

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| 007.1 | `ATIVIDADE-PRATICA.py` + template: Data, Docente e Turma da fonte; Estudante em branco | ✅ Concluído | 2026-10-14 09:30 | HTML gerado: Data 14/10/2026, Docente GELVAZIO CAMARGO, Turma da imagem; nenhum "preenchimento" na página; Estudante em branco |
| 007.2 | Discursiva: Docente e Data da fonte; PDF usa a Data (`exportar-pdf-discursiva.js`) | ✅ Concluído | 2026-10-14 09:30 | `node --check` ok; página com data-docente, data-data e data-turma |
| 007.3 | Campos nas 2 fontes, regenerar, README, quadro, commit + push | ✅ Concluído | 2026-10-14 09:30 | `git log` / push para origin/main |
| 007.4 | Aceite do usuário (abrir as 2 atividades e exportar PDF/Word) | 👀 Aguardando o usuário | — | — |
