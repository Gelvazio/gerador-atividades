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
**Próximo passo:** 003.8 — aceite do usuário (HTML, PDF e Word).

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
| Logo no Word | O gerador embute o logo no HTML (data URI): o Word recebe a imagem sem depender de arquivo |

### Decisões

| Decisão | Quando | Quem | Por quê |
|---------|--------|------|---------|
| Logo SESI SENAI (`logo-sesi-senai.png`) em vez de desenhar um só SENAI | 2026-10-14 09:02 | Usuário | "USE A LOGO SESI SENAI MESMO" |

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| 003.1 | Aprovação do plano pelo usuário | ✅ Concluído | 2026-10-14 09:02 | Usuário: "USE A LOGO SESI SENAI MESMO" (aprova o plano trocando o logo) |
| 003.2 | Logo `assets/img/logo-sesi-senai.png` (copiado do aulasenai) | ✅ Concluído | 2026-10-14 09:02 | Arquivo copiado (250 × 48) |
| 003.3 | Template + CSS (tela e impressão A4) | ✅ Concluído | 2026-10-14 09:04 | Leitura; linhas ≤ 100 caracteres |
| 003.4 | JS: PDF (impressão) e Word (`documento-word.js` + exportador) | ✅ Concluído | 2026-10-14 09:04 | `node --check` ok |
| 003.5 | `ATIVIDADE-PRATICA.py` | ✅ Concluído | 2026-10-14 09:04 | Gera o HTML; fonte com 3 questões é recusada com erro claro |
| 003.6 | Fonte do Desafio 1 (1 questão) e geração do HTML | ✅ Concluído | 2026-10-14 09:04 | CSS/JS existem; logo embutido; curso, UC, C2, C3, contexto e tópicos presentes; sem marcador sobrando |
| 003.7 | README, quadro regenerado, commit + push | ✅ Concluído | 2026-10-14 09:04 | `git log` / push para origin/main |
| 003.8 | Aceite do usuário (abrir `TESTES-DE-FRONTEND/ATIVIDADES/ATIVIDADE-PRATICA-DESAFIO-01-CASOS-DE-TESTE.html`, exportar PDF e Word) | 👀 Aguardando o usuário | — | — |
