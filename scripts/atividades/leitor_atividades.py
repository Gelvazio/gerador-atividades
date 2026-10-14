"""Lista as matérias do repositório e as páginas de atividade geradas em cada uma.

Matéria = pasta com materia.json; atividades = páginas .html de <MATERIA>/ATIVIDADES/.
O título de cada atividade vem do <title> da própria página.
"""
import json
import re
from pathlib import Path

ARQUIVO_MATERIA = "materia.json"
PASTA_ATIVIDADES = "ATIVIDADES"
PASTAS_IGNORADAS = {".git", ".claude", "assets", "geradores", "scripts", "tasks", "node_modules"}
NOME_INDICE = "index.html"
ROTULO_INDICE = "Índice das atividades"
PADRAO_TITULO = re.compile(r"<title>(.*?)</title>", re.S | re.I)


def ler_titulo(pagina):
    """Título da página (conteúdo do <title>), ou o nome do arquivo se não houver.

    Args:
        pagina: Arquivo .html.

    Returns:
        Título em texto simples.
    """
    achado = PADRAO_TITULO.search(pagina.read_text(encoding="utf-8", errors="ignore"))
    if not achado:
        return pagina.stem
    return " ".join(achado.group(1).split())


def localizar_materias(raiz):
    """Pastas de matéria (com materia.json) dentro do repositório.

    Args:
        raiz: Raiz do repositório.

    Returns:
        Lista de pastas, em ordem alfabética.
    """
    materias = []
    for arquivo in Path(raiz).rglob(ARQUIVO_MATERIA):
        partes = arquivo.relative_to(raiz).parts
        if PASTAS_IGNORADAS.intersection(partes):
            continue
        materias.append(arquivo.parent)
    return sorted(materias)


def ler_atividades(pasta_materia, raiz):
    """Páginas de atividade da matéria, com o índice da pasta (se houver) no fim.

    Args:
        pasta_materia: Pasta da matéria.
        raiz: Raiz do repositório (os links são relativos a ela).

    Returns:
        Lista de {titulo, link}.
    """
    pasta = pasta_materia / PASTA_ATIVIDADES
    if not pasta.is_dir():
        return []
    paginas = sorted(pagina for pagina in pasta.glob("*.html") if pagina.name != NOME_INDICE)
    atividades = [{"titulo": ler_titulo(pagina),
                   "link": pagina.relative_to(raiz).as_posix()} for pagina in paginas]
    indice = pasta / NOME_INDICE
    if indice.is_file():
        atividades.append({"titulo": ROTULO_INDICE, "link": indice.relative_to(raiz).as_posix()})
    return atividades


def ler_materia(pasta_materia, raiz):
    """Dados do card de uma matéria.

    Args:
        pasta_materia: Pasta da matéria.
        raiz: Raiz do repositório.

    Returns:
        Dicionário {uc, curso, pasta, atividades}.
    """
    dados = json.loads((pasta_materia / ARQUIVO_MATERIA).read_text(encoding="utf-8"))
    return {"uc": dados.get("uc") or pasta_materia.name, "curso": dados.get("curso", ""),
            "pasta": pasta_materia.relative_to(raiz).as_posix(),
            "atividades": ler_atividades(pasta_materia, raiz)}


def ler_todas(raiz):
    """Todas as matérias com as suas atividades.

    Args:
        raiz: Raiz do repositório.

    Returns:
        Lista de matérias (dicionários de ler_materia).
    """
    return [ler_materia(pasta, Path(raiz)) for pasta in localizar_materias(raiz)]
