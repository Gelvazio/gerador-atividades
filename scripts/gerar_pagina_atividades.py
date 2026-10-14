"""Gera o atividades.html: um card por matéria com os links das atividades geradas.

Uso (na raiz do repositório): python scripts/gerar_pagina_atividades.py
Chamado sozinho pelo gerar.py e pelo ATIVIDADE-PRATICA.py ao terminar (toda atividade nova entra
na lista). Não editar o atividades.html à mão. Tela: scripts/atividades/ e scripts/menu/.
"""
import html
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

PASTA_SCRIPTS = Path(__file__).resolve().parent
RAIZ = PASTA_SCRIPTS.parent
sys.path.insert(0, str(PASTA_SCRIPTS / "atividades"))
from leitor_atividades import ler_todas  # noqa: E402

MODELO = PASTA_SCRIPTS / "atividades" / "modelo.html"
SAIDA = RAIZ / "atividades.html"
FORMATO_DATA_HORA = "%Y-%m-%d %H:%M"
RECUO = " " * 12
SEM_ATIVIDADES = "Nenhuma atividade gerada ainda."
SEM_MATERIAS = "Nenhuma matéria com materia.json encontrada."

e = html.escape


def html_atividade(atividade):
    """Item da lista de atividades de um card.

    Args:
        atividade: {titulo, link}.

    Returns:
        HTML do item.
    """
    return (f'{RECUO}        <li class="materia__atividade"><a href="{quote(atividade["link"])}">'
            f'{e(atividade["titulo"])}</a></li>')


def html_card(materia):
    """Card de uma matéria.

    Args:
        materia: {uc, curso, pasta, atividades}.

    Returns:
        HTML do card.
    """
    atividades = materia["atividades"]
    quantidade = sum(1 for atividade in atividades if not atividade["link"].endswith("index.html"))
    if atividades:
        lista = "\n".join(html_atividade(atividade) for atividade in atividades)
        corpo = f'{RECUO}    <ul class="materia__lista">\n{lista}\n{RECUO}    </ul>'
    else:
        corpo = f'{RECUO}    <p class="materia__vazio">{SEM_ATIVIDADES}</p>'
    return (f'{RECUO}<article class="materia">\n'
            f'{RECUO}    <h2 class="materia__titulo">{e(materia["uc"])}</h2>\n'
            f'{RECUO}    <p class="materia__curso">{e(materia["curso"])}</p>\n'
            f'{RECUO}    <p class="materia__quantidade">{quantidade} atividade(s) · '
            f'pasta {e(materia["pasta"])}</p>\n{corpo}\n{RECUO}</article>')


def gerar_pagina_atividades(raiz=RAIZ, saida=SAIDA):
    """Gera o atividades.html.

    Args:
        raiz: Raiz do repositório.
        saida: Arquivo HTML de saída.

    Returns:
        Quantidade de matérias na página.
    """
    materias = ler_todas(raiz)
    cards = "\n".join(html_card(materia) for materia in materias)
    if not materias:
        cards = f'{RECUO}<p class="materia__vazio">{SEM_MATERIAS}</p>'
    trocas = {"{{CARDS}}": cards, "{{GERADO_EM}}": datetime.now().strftime(FORMATO_DATA_HORA)}
    pagina = MODELO.read_text(encoding="utf-8")
    for chave, valor in trocas.items():
        pagina = pagina.replace(chave, valor)
    Path(saida).write_text(pagina, encoding="utf-8")
    return len(materias)


if __name__ == "__main__":
    print(f"atividades.html gerado com {gerar_pagina_atividades()} matéria(s)")
