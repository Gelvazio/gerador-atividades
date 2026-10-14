## Etapa 003-4c75f0e1 — Gerador `ATIVIDADE-PRATICA.py` (atividade de 1 questão, layout SENAI)

**Tarefa:** #3-4c75f0e1-7980-442c · **Pedido em:** 2026-10-14 09:00 · **Executor:** Claude Code (local · main)
**Pedido:** "crie 1 atividade, em html mas com opcao de exportar pra word desta imagem acima, mas
seguindo o layout da imagem, e deve ser apenas 1 pergunta, mas com as capacidades, deve ficar igual
a imagem no html e no pdf, crie um gerador de nome ATIVIDADE-PRATICA.py, exclusivo pra este tipo
de atividade, ATIVIDADE DE 1 QUESTAO" · "E ESTE CASO, NAO PRECISA DE BANCO DE DADOS".
Imagens: slide "Desafio 1: Escrever 3 Casos de Teste" (conteúdo) e modelo SENAI "AVALIAÇÃO
OBJETIVA" (layout: logo SENAI | título, Data, Docente, Curso Técnico em, Unidade Curricular,
Turma, Estudante | Desempenho; faixa azul "ITEM 1"; linha CAPACIDADE; Contexto e Comando).
**Objetivo:** gerar atividade prática de 1 questão no layout SENAI da imagem, igual no HTML, no
PDF e no Word, sem banco.
**Próximo passo:** 003.1 — aguardar a aprovação do plano pelo usuário.

### Escopo

**Entra:**
- `ATIVIDADE-PRATICA.py` (raiz): `python ATIVIDADE-PRATICA.py <arquivo .md>` → HTML ao lado da
  pasta `CONTEUDO/` (como os outros geradores). Exclusivo para 1 questão (erro se a fonte tiver
  mais de uma).
- Fonte `.md`: título ("ATIVIDADE PRÁTICA"), curso, capacidades (`C2, C3`), Contexto, Comando e
  o espaço de resposta (tópicos opcionais). Dados da matéria pelo `materia.json`.
- Layout igual à imagem: tabela do cabeçalho com o **logo SENAI** (`assets/img/logo-senai.png`,
  criado), "preenchimento pelo docente/estudante" em azul itálico, coluna **Desempenho**; faixa
  azul **ITEM 1**; linha **CAPACIDADE** (código + texto oficial); bloco Contexto / Comando; área
  de resposta (o aluno digita na página; no PDF/Word sai o texto digitado ou linhas em branco).
- **PDF** = impressão do navegador ("Salvar como PDF") com CSS de impressão A4: sai igual ao
  HTML. **Word** = `.doc` com o mesmo layout (cópia de `documento-word.js` do aulasenai + um
  exportador novo).
- Tela: `assets/css/atividade-pratica-unica.css`, `assets/js/atividade-pratica-unica.js`.
- Desafio 1 de Testes de Front-End como **1 questão** (3 casos de teste na mesma resposta),
  "você como aluno consultor", capacidades C2 e C3, em
  `TESTES-DE-FRONTEND/ATIVIDADES/ATIVIDADE-PRATICA-DESAFIO-01-CASOS-DE-TESTE.html`.
- README + quadro (`index.html`) regenerado.

**Não entra:** banco, login, gabarito na página, mudança nos geradores existentes, testes
automatizados.

### Critério de pronto

Gerador cria o HTML; referências de CSS/JS/imagem existem (script); `node --check` ok. Conferência
visual do HTML, PDF e Word com o usuário (regra: sem navegador).

### Riscos

| Risco | Plano B |
|-------|---------|
| Word mostrar a tabela diferente do HTML | Tabela simples com bordas e larguras fixas em pt (o Word respeita) |
| Logo SENAI não ser o oficial | Logo desenhado (faixas azuis + "SENAI"); trocar o PNG por o oficial quando o usuário enviar |

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| 003.1 | Aprovação do plano pelo usuário | 👀 Aguardando o usuário | — | — |
| 003.2 | Logo `assets/img/logo-senai.png` | ⬜ Pendente | — | Arquivo gerado |
| 003.3 | Template + CSS (tela e impressão A4) | ⬜ Pendente | — | Leitura |
| 003.4 | JS: PDF (impressão) e Word (`documento-word.js` + exportador) | ⬜ Pendente | — | `node --check` |
| 003.5 | `ATIVIDADE-PRATICA.py` | ⬜ Pendente | — | `py_compile` + geração |
| 003.6 | Fonte do Desafio 1 (1 questão) e geração do HTML | ⬜ Pendente | — | Script de conferência |
| 003.7 | README, quadro regenerado, commit + push | ⬜ Pendente | — | `git log` |
| 003.8 | Aceite do usuário (HTML, PDF e Word) | ⬜ Pendente | — | — |
