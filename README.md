# gerador-atividades

Gera páginas HTML de atividades no **padrão SENAI** (objetiva, prática e discursiva), que abrem
por duplo clique, sem servidor, sem login e sem banco. O aluno responde na página e entrega o
**PDF SENAI** exportado pelo botão **📥 Exportar PDF**.

Cópia independente dos geradores do repositório `aulasenai` (commit de origem `01361bb`):
`assets/gerador-atividades`, `assets/gerador-avaliacao-discursiva`, `assets/gerador-capacidades`,
`assets/gerador-materia` e a tela (CSS/JS) que eles usam.

## Uso

```bash
python gerar.py objetiva   <pasta ATIVIDADES> [arquivo.md]
python gerar.py pratica    <pasta ATIVIDADES> [arquivo.md]
python gerar.py discursiva <pasta ATIVIDADES> [arquivo.md]
```

Exemplo (Desafio 1 de Testes de Front-End):

```bash
python gerar.py discursiva TESTES-DE-FRONTEND/ATIVIDADES DESAFIO-01-CASOS-DE-TESTE-LOGIN.md
```

## Estrutura

```
gerar.py                      ← ponto de entrada
geradores/
├─ objetiva/                  ← 50 questões de múltipla escolha + index.html
├─ discursiva/                ← prática (10 × 3 tópicos) e discursiva
└─ comum/                     ← configuracao.py, materia.py, capacidades.py
assets/css, assets/js         ← tela das páginas (visual e PDF SENAI, modo local)
<MATERIA>/                    ← ex.: TESTES-DE-FRONTEND/
├─ materia.json               ← uc, uc_curta, curso, docente, capacidades
└─ ATIVIDADES/
   ├─ CONTEUDO/               ← fontes .md (e -GABARITO.md, só do professor)
   └─ *.html                  ← páginas geradas
tasks/                        ← quadro de tarefas (STATUS.md + etapas)
```

## Quadro de tarefas

O `index.html` da raiz mostra o quadro (`tasks/STATUS.md` + etapas) em cards: agente, quando
foi pedida, quando terminou, progresso dos itens e próximo passo, com filtros por status,
prioridade, agente e busca. Abre por duplo clique. Para atualizar:

```bash
python scripts/gerar_quadro.py
```

## Formato das fontes

- **Objetiva:** `CONTEUDO/ATIVIDADES-AULA-NN-50-QUESTOES.md` com `## ITEM NN — Título`,
  `**Contexto:**`, `**Comando:**`, `**Alternativas:**` (`- A) ...`) e `**Gabarito:** X`.
- **Prática / discursiva:** `CONTEUDO/<NOME>.md` com `## ITEM NN — Título`, `- **Capacidade:** C1`,
  `**Contexto:**`, `**Comando:**` e `**Tópicos:**` (`- a) enunciado (0,4)`); os tópicos de cada
  questão somam os "Pontos por questão". O `<NOME>-GABARITO.md` (`### ITEM NN-a` com
  `**Resposta esperada:**` e `**Critérios:**`) só define a altura dos campos.
- Contexto das questões: **"Você, como aluno consultor..."** (sem empresa fictícia).

## ⚠️ Gabarito

O gabarito e o padrão de resposta **nunca** vão para o HTML. Este repositório no GitHub é
**público**: os arquivos com resposta (`*GABARITO*` e `*-50-QUESTOES.md`) estão no `.gitignore` e
ficam só na máquina do professor. Ao publicar as páginas para os alunos, não publique as pastas
`CONTEUDO/`.

## Diferenças em relação ao `aulasenai`

Sem login, Supabase, seed SQL, folha de respostas, correção pela IA, menu e header do site. Os
campos de fonte que dependem do banco ("Botão gravar", "Aula no banco"...) são ignorados.
