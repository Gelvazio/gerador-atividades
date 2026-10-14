## Etapa 001-90e93c4a — Cópia independente do gerador de atividades

**Tarefa:** #1-90e93c4a-e4a0-4669 · **Pedido em:** 2026-10-14 08:24 · **Executor:** Claude Code (local · main)
**Pedido:** "GERADOR DE ATIVIDADES" → pasta `C:\fontes\gerador-atividades`; respostas: cópia
independente; tipos objetiva (50 questões), prática (10 × 3 tópicos) e discursiva/avaliação;
repositório Git próprio com quadro.
**Objetivo:** ter os geradores de atividades do `aulasenai` num repositório próprio, que roda
sozinho (sem depender da posição dentro do `aulasenai`).
**Próximo passo:** 001.1 — aguardar a aprovação do plano pelo usuário.

### Escopo

**Entra** (cópia dos 7 módulos Python do `aulasenai/assets/`, ~2 060 linhas):

| Origem (`aulasenai/assets/`) | Destino | Para quê |
|------------------------------|---------|----------|
| `gerador-atividades/` (`gerar_atividades.py` + template) | `geradores/objetiva/` | Objetiva de 50 questões + `index.html` |
| `gerador-avaliacao-discursiva/` (+ template) | `geradores/discursiva/` | Prática (10 × 3 tópicos) e discursiva + seed SQL |
| `gerador-menu/` (`tags_menu.py`, `tags_header.py`) | `geradores/comum/` | Tags de menu e header |
| `gerador-indices/gerar_indices.py` (só `montar_tags_crud`) | `geradores/comum/` | Tags do CRUD usadas pela objetiva |
| `gerador-capacidades/capacidades.py` | `geradores/comum/` | Quadro e caixa de capacidades |
| `gerador-materia/materia.py` | `geradores/comum/` | Leitura do `materia.json` |

- **Raiz do projeto configurável:** hoje os caminhos saem da posição do script
  (`Path(__file__).parent.parent`). Na cópia, a raiz do projeto de destino (onde ficam `assets/`,
  `js/`, `database/` e `MATERIAIS/`) vem de `--projeto <pasta>` ou de `config.json`
  (padrão `C:\fontes\aulasenai`), num módulo só (`geradores/comum/configuracao.py`).
- Um ponto de entrada: `gerar.py objetiva|pratica|discursiva <pasta ATIVIDADES> [arquivo.md]`.
- `README.md` com uso e exemplos; `CLAUDE.md`/`AGENTS.md` mínimos apontando para as regras;
  `.gitignore` (`__pycache__`, `config.json` local).

**Não entra:**
- Os arquivos de tela (`assets/js`, `assets/css`, `js/login.js`, `js/supabase.js`) e o banco:
  as páginas geradas continuam usando os do projeto de destino (o `aulasenai`). Copiar também a
  parte de tela seria outra tarefa.
- Excel (`gerador-atividade-excel`), apostilas, índices completos, média final.
- Mexer no `aulasenai` (os geradores de lá continuam como estão).
- Testes automatizados (regra do usuário); push (só quando o usuário pedir).

### Critério de pronto

Rodar a cópia numa pasta ATIVIDADES do `aulasenai` (`--projeto C:\fontes\aulasenai`) gera
HTML **idêntico** ao do gerador original (comparação por `diff` em pasta temporária) para uma
objetiva e uma prática/discursiva.

### Riscos

| Risco | Plano B |
|-------|---------|
| Cópia desatualiza quando o gerador do `aulasenai` mudar | README diz a versão de origem (commit `42e90ab`); sincronizar a pedido |
| Gerar direto na pasta real sobrescreve páginas do `aulasenai` | Verificação roda numa cópia da pasta ATIVIDADES na pasta temporária da sessão |
| Seed SQL da discursiva cair no `database/` real | Na verificação, `--projeto` aponta para a cópia temporária |

### Decisões

| Decisão | Quando | Quem | Por quê |
|---------|--------|------|---------|
| Cópia independente, 3 tipos, repositório próprio | 2026-10-14 08:25 | Usuário | Respostas às perguntas iniciais |

| Item | Descrição | Status | Concluído em | Verificação |
|------|-----------|--------|--------------|-------------|
| 001.1 | Aprovação do plano pelo usuário | 👀 Aguardando o usuário | — | — |
| 001.2 | Copiar os 7 módulos para `geradores/` (estrutura acima) | ⬜ Pendente | — | Arquivos presentes |
| 001.3 | `configuracao.py` + `--projeto`/`config.json`; trocar caminhos fixos | ⬜ Pendente | — | `python -m py_compile` em todos |
| 001.4 | `gerar.py` (objetiva, pratica, discursiva) | ⬜ Pendente | — | `gerar.py --help` |
| 001.5 | README, CLAUDE.md/AGENTS.md, .gitignore | ⬜ Pendente | — | Leitura |
| 001.6 | Comparar saída com o original (objetiva + discursiva) | ⬜ Pendente | — | `diff` sem diferenças |
| 001.7 | Commit | ⬜ Pendente | — | `git log` |
| 001.8 | Aceite do usuário | ⬜ Pendente | — | — |
