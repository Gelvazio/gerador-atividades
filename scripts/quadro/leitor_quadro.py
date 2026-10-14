"""Lê o quadro de tarefas em Markdown (tasks/STATUS.md + etapas) e devolve os dados do index.html.

Fonte única: o quadro em Markdown. Este módulo só lê; as colunas são achadas pelo nome do
cabeçalho (não pela posição), para o leitor não quebrar se a ordem mudar.
"""
import re
from pathlib import Path

SECAO_TAREFAS = "📌 Tarefas"
SECAO_FRENTES = "🧭 Frentes"
COLUNA_ITEM = "Item"
COLUNA_STATUS = "Status"
COLUNA_CONCLUIDO = "Concluído em"
SEM_VALOR = "—"
EMOJI_CONCLUIDO = "✅"
EMOJI_CANCELADO = "⛔"
EMOJIS_STATUS = {"⬜": "pendente", "🔄": "andamento", "✅": "concluido", "⛔": "bloqueado",
                 "👀": "aguardando"}
PADRAO_LINK = re.compile(r"\]\(([^)]+)\)")
PADRAO_CAMPO_ETAPA = r"\*\*{nome}:\*\*\s*(.+?)(?=\s+·\s+\*\*|$)"
PADRAO_DATA_HORA = re.compile(r"\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?")
PADRAO_LIMPAR_MARKDOWN = re.compile(r"\[([^\]]+)\]\([^)]+\)")


def limpar_markdown(texto):
    """Troca links Markdown pelo texto e tira crases e negrito.

    Args:
        texto: Texto da célula.

    Returns:
        Texto simples.
    """
    texto = PADRAO_LIMPAR_MARKDOWN.sub(r"\1", texto or "")
    return texto.replace("`", "").replace("**", "").strip()


def dividir_linha(linha):
    """Divide uma linha de tabela Markdown em células.

    Args:
        linha: Linha começando e terminando com "|".

    Returns:
        Lista de células sem espaços nas pontas.
    """
    return [celula.strip() for celula in linha.strip().strip("|").split("|")]


def ler_tabelas(linhas):
    """Lê todas as tabelas Markdown de uma lista de linhas.

    Args:
        linhas: Linhas do texto.

    Returns:
        Lista de tabelas; cada tabela é uma lista de dicionários coluna → valor.
    """
    tabelas, cabecalho, atual = [], None, []
    for linha in linhas + [""]:
        eh_linha_de_tabela = linha.strip().startswith("|")
        if not eh_linha_de_tabela:
            if cabecalho:
                tabelas.append(atual)
            cabecalho, atual = None, []
            continue
        celulas = dividir_linha(linha)
        if cabecalho is None:
            cabecalho = celulas
        elif not all(set(celula) <= set("-: ") for celula in celulas):
            atual.append(dict(zip(cabecalho, celulas)))
    return tabelas


def linhas_da_secao(texto, titulo):
    """Linhas da seção "## <titulo...>" até a próxima seção "## ".

    Args:
        texto: Conteúdo do Markdown.
        titulo: Começo do título da seção.

    Returns:
        Lista de linhas da seção.

    Raises:
        SystemExit: Se a seção não existir.
    """
    partes = re.split(r"^## ", texto, flags=re.M)
    for parte in partes[1:]:
        if parte.startswith(titulo):
            return parte.splitlines()[1:]
    raise SystemExit(f"❌ seção '## {titulo}' não encontrada no STATUS.md")


def tabela_da_secao(texto, titulo):
    """Primeira tabela da seção pedida.

    Args:
        texto: Conteúdo do Markdown.
        titulo: Começo do título da seção.

    Returns:
        Lista de dicionários coluna → valor (vazia se a seção não tiver tabela).
    """
    tabelas = ler_tabelas(linhas_da_secao(texto, titulo))
    return tabelas[0] if tabelas else []


def classificar_status(texto):
    """Classe do status pelo emoji do começo do texto.

    Args:
        texto: Texto da coluna Status (ex.: "🔄 Em execução").

    Returns:
        Chave do status (pendente, andamento, concluido, bloqueado, aguardando) ou "pendente".
    """
    for emoji, chave in EMOJIS_STATUS.items():
        if texto.strip().startswith(emoji):
            return chave
    return "pendente"


def campo_da_etapa(texto, nome):
    """Lê um campo "**Nome:** valor" do cabeçalho da etapa.

    Args:
        texto: Conteúdo da etapa.
        nome: Nome do campo (ex.: "Executor").

    Returns:
        Valor sem Markdown, ou "" se não existir.
    """
    achado = re.search(PADRAO_CAMPO_ETAPA.format(nome=re.escape(nome)), texto, flags=re.M)
    return limpar_markdown(achado.group(1)) if achado else ""


def itens_da_etapa(texto):
    """Itens da etapa (tabela com a coluna "Item").

    Args:
        texto: Conteúdo da etapa.

    Returns:
        Lista de itens {numero, descricao, status, classe, concluido_em}.
    """
    for tabela in ler_tabelas(texto.splitlines()):
        if tabela and COLUNA_ITEM in tabela[0]:
            return [{"numero": linha.get(COLUNA_ITEM, ""),
                     "descricao": limpar_markdown(linha.get("Descrição", "")),
                     "status": linha.get(COLUNA_STATUS, ""),
                     "classe": classificar_status(linha.get(COLUNA_STATUS, "")),
                     "concluido_em": linha.get(COLUNA_CONCLUIDO, SEM_VALOR)} for linha in tabela]
    return []


def data_de_termino(itens):
    """Data em que a tarefa terminou: a maior "Concluído em" quando todos os itens fecharam.

    Args:
        itens: Itens da etapa.

    Returns:
        Data e hora (texto) ou "" se ainda há item aberto.
    """
    fechados = [item for item in itens if item["status"].startswith((EMOJI_CONCLUIDO,
                                                                    EMOJI_CANCELADO))]
    esta_tudo_fechado = bool(itens) and len(fechados) == len(itens)
    if not esta_tudo_fechado:
        return ""
    datas = [achado.group(0) for item in fechados
             if (achado := PADRAO_DATA_HORA.search(item["concluido_em"]))]
    return max(datas) if datas else ""


def ler_etapa(caminho):
    """Dados de uma etapa: executor, pedido em, próximo passo, itens e término.

    Args:
        caminho: Arquivo da etapa (pode não existir).

    Returns:
        Dicionário com os dados (vazio se o arquivo não existir).
    """
    if not caminho or not caminho.is_file():
        return {}
    texto = caminho.read_text(encoding="utf-8")
    itens = itens_da_etapa(texto)
    return {"executor": campo_da_etapa(texto, "Executor"),
            "pedido_em": campo_da_etapa(texto, "Pedido em"),
            "proximo_passo": campo_da_etapa(texto, "Próximo passo"),
            "objetivo": campo_da_etapa(texto, "Objetivo"),
            "itens": itens, "terminou_em": data_de_termino(itens)}


def montar_tarefa(linha, pasta_tasks):
    """Junta a linha da tarefa no STATUS.md com os dados da etapa dela.

    Args:
        linha: Linha da tabela "📌 Tarefas" (coluna → valor).
        pasta_tasks: Pasta tasks/ (os links das etapas são relativos a ela).

    Returns:
        Dicionário da tarefa para o index.html.
    """
    link = PADRAO_LINK.search(linha.get("Etapa", ""))
    caminho_etapa = pasta_tasks / link.group(1) if link else None
    etapa = ler_etapa(caminho_etapa)
    em_uso_por = limpar_markdown(linha.get("Em uso por", ""))
    tem_reserva = em_uso_por not in ("", SEM_VALOR)
    agente = etapa.get("executor") or re.sub(r"\s*\(desde .*\)$", "", em_uso_por)
    return {"numero": linha.get("Tarefa", "").split("-")[0],
            "titulo": limpar_markdown(linha.get("Título", "")),
            "prioridade": linha.get("Prioridade", ""),
            "status": linha.get(COLUNA_STATUS, ""),
            "classe": classificar_status(linha.get(COLUNA_STATUS, "")),
            "agente": agente or SEM_VALOR, "em_uso_por": em_uso_por if tem_reserva else "",
            "etapa": link.group(1) if link else "", **etapa}


def ler_quadro(raiz):
    """Lê o quadro completo do repositório.

    Args:
        raiz: Raiz do repositório (onde fica a pasta tasks/).

    Returns:
        Dicionário {tarefas, frentes, titulo}.
    """
    pasta_tasks = Path(raiz) / "tasks"
    texto = (pasta_tasks / "STATUS.md").read_text(encoding="utf-8")
    titulo = limpar_markdown(texto.splitlines()[0].lstrip("# "))
    tarefas = [montar_tarefa(linha, pasta_tasks)
               for linha in tabela_da_secao(texto, SECAO_TAREFAS)]
    frentes = [{chave: limpar_markdown(valor) for chave, valor in linha.items()}
               for linha in tabela_da_secao(texto, SECAO_FRENTES)]
    return {"titulo": titulo, "tarefas": tarefas, "frentes": frentes}
