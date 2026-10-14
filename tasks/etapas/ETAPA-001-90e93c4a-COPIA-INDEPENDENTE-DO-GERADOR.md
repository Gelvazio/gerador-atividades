## Etapa 001-90e93c4a — Cópia independente do gerador de atividades

**Tarefa:** #1-90e93c4a-e4a0-4669 · **Pedido em:** 2026-10-14 08:24 · **Executor:** Claude Code (local · main)
**Pedido:** "GERADOR DE ATIVIDADES" → pasta `C:\fontes\gerador-atividades`; respostas: cópia
independente; tipos objetiva (50 questões), prática (10 × 3 tópicos) e discursiva/avaliação;
repositório Git próprio com quadro. Em 2026-10-14 08:35: "USE O GERADOR E COLOQUE ESTA ATIVIDADE
NO PADRAO SENAI NUM ARQUIVO HTML DENTRO DA PASTA TESTES-DE-FRONTEND" (Desafio 1: 3 casos de teste
do Login) — "a certa é esta daqui" — e escolha "Copiar gerador + tela".
**Objetivo:** ter os geradores de atividades num repositório próprio, que roda sozinho, com a
tela (CSS/JS) junto, e gerar nele o Desafio 1 de Testes de Front-End.
**Próximo passo:** 001.9 — aceite do usuário (abrir a página do Desafio 1 e exportar o PDF).

### Escopo (revisto em 2026-10-14 08:37, aprovado pelo usuário)

**Entra:**

| Origem (`aulasenai`) | Destino | Para quê |
|----------------------|---------|----------|
| `assets/gerador-atividades/` (`gerar_atividades.py` + template) | `geradores/objetiva/` | Objetiva de 50 questões + `index.html` |
| `assets/gerador-avaliacao-discursiva/` (+ template) | `geradores/discursiva/` | Prática (10 × 3 tópicos) e discursiva |
| `assets/gerador-capacidades/capacidades.py` | `geradores/comum/` | Quadro e caixa de capacidades |
| `assets/gerador-materia/materia.py` | `geradores/comum/` | Leitura do `materia.json` |
| `assets/css/` atividade, avaliacao-discursiva, capacidades | `assets/css/` | Visual SENAI |
| `assets/js/` atividade, exportar-pdf-discursiva, popup, bloqueio-colar-discursiva, campo-tamanho-discursiva | `assets/js/` | PDF SENAI e campos |

- **Modo local (sem login e sem banco):** as páginas abrem por duplo clique; as respostas não
  são gravadas; o aluno exporta o PDF SENAI com as respostas digitadas. Novo
  `assets/js/discursiva-local.js` liga a barra do PDF e o aviso de modo local.
- Raiz = este repositório (`geradores/comum/configuracao.py`); matérias em `<MATERIA>/` na raiz
  (ex.: `TESTES-DE-FRONTEND/`), com `materia.json` e `ATIVIDADES/CONTEUDO/`.
- Desafio 1 em `TESTES-DE-FRONTEND/ATIVIDADES/DESAFIO-01-CASOS-DE-TESTE-LOGIN.html`.
- `README.md`, `CLAUDE.md` mínimo, `.gitignore`.

**Não entra:** login, Supabase, seed SQL, menu e header do `aulasenai` (`gerador-menu`,
`gerador-indices`: dependem do login), folha de respostas e PDF de gabarito do professor (dependem
do banco), Excel, mudanças no `aulasenai`, testes automatizados, push (só a pedido).

### Critério de pronto

`gerar.py` gera o Desafio 1 em `TESTES-DE-FRONTEND/ATIVIDADES/`, a página referencia só arquivos
que existem no repositório (conferido por script) e o JS passa no `node --check`. O teste visual
no navegador fica com o usuário (regra: sem navegador).

### Riscos

| Risco | Plano B |
|-------|---------|
| Cópia desatualiza quando o `aulasenai` mudar | README diz a origem (commit `01361bb`) |
| Padrão de resposta (`-GABARITO.md`) ir para os alunos | Fica só em `CONTEUDO/`, nunca no HTML; README avisa para não publicar a pasta `CONTEUDO/` |

### Decisões

| Decisão | Quando | Quem | Por quê |
|---------|--------|------|---------|
| Cópia independente, 3 tipos, repositório próprio | 2026-10-14 08:25 | Usuário | Respostas às perguntas iniciais |
| Copiar também a tela; páginas sem login/banco | 2026-10-14 08:37 | Usuário | Escolha "Copiar gerador + tela" |
| Sem `--projeto`, sem menu/header/índices/seed | 2026-10-14 08:37 | Claude Code | Dependem do login e do banco do `aulasenai`; consequência da escolha acima |
| Remoto `origin` = github.com/Gelvazio/gerador-atividades; push ao fim de cada tarefa | 2026-10-14 08:40 | Usuário | "ligue ao repo remoto tb" |
| Arquivos com resposta (`*GABARITO*`, `*-50-QUESTOES.md`) fora do Git | 2026-10-14 08:47 | Claude Code | O remoto é público (`gh repo view`): o aluno não pode ver o gabarito |

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| 001.1 | Aprovação do plano pelo usuário | ✅ Concluído | 2026-10-14 08:37 | Usuário escolheu "Copiar gerador + tela" |
| 001.2 | Copiar módulos Python e a tela (CSS/JS) | ✅ Concluído | 2026-10-14 08:45 | 4 módulos Python, 4 CSS (com indice-atividades.css) e 5 JS copiados |
| 001.3 | `configuracao.py`, modo local nos templates e geradores (sem menu/header/seed/banco) | ✅ Concluído | 2026-10-14 08:45 | `py_compile` ok nos 5 arquivos; objetiva sem gabarito embutido |
| 001.4 | `assets/js/discursiva-local.js` | ✅ Concluído | 2026-10-14 08:45 | `node --check` ok |
| 001.5 | `gerar.py` (objetiva, pratica, discursiva) | ✅ Concluído | 2026-10-14 08:45 | Sem argumentos mostra o uso; objetiva testada em pasta temporária (50 itens, sem arquivo faltando, sem gabarito) |
| 001.6 | `TESTES-DE-FRONTEND/materia.json` + fonte e padrão de resposta do Desafio 1 | ✅ Concluído | 2026-10-14 08:45 | 3 questões × 3 tópicos (0,2 + 0,4 + 0,4), aula 02, "você como aluno consultor" |
| 001.7 | Gerar o Desafio 1 e conferir os arquivos referenciados | ✅ Concluído | 2026-10-14 08:45 | 8 referências OK; nenhum texto do padrão de resposta no HTML; sem supabase/login |
| 001.8 | README, CLAUDE.md, .gitignore + commit + push | ✅ Concluído | 2026-10-14 08:45 | `git log` / push para origin/main |
| 001.9 | Aceite do usuário (abrir `TESTES-DE-FRONTEND/ATIVIDADES/DESAFIO-01-CASOS-DE-TESTE-LOGIN.html` e exportar o PDF) | 👀 Aguardando o usuário | — | — |
