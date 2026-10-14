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
SEM_PRAZO = "Prazo não definido"
SEM_PRAZO_LADO = "—"
TIPO_INDICE = "Índice"
TIPO_DESCONHECIDO = "Atividade"
FORMATO_META = "%Y-%m-%dT%H:%M"
FORMATO_CARD = "%d/%m/%Y às %H:%M"

e = html.escape


def formatar_momento(momento):
    """Converte AAAA-MM-DDTHH:MM em "DD/MM/AAAA às HH:MM".

    Args:
        momento: Data e hora da meta tag ("" quando não há).

    Returns:
        Texto para o card, ou "—".
    """
    if not momento:
        return SEM_PRAZO_LADO
    return datetime.strptime(momento, FORMATO_META).strftime(FORMATO_CARD)


def html_prazo(atividade):
    """Linhas de início e fim do prazo do card (ou o aviso de prazo não definido).

    Args:
        atividade: {inicio, fim, tipo, ...}.

    Returns:
        HTML das linhas do prazo ("" para o índice da pasta).
    """
    if atividade["tipo"] == TIPO_INDICE:
        return ""
    recuo = RECUO + " " * 12
    if not (atividade["inicio"] or atividade["fim"]):
        return f'\n{recuo}<p class="atividade__prazo">{SEM_PRAZO}</p>'
    return (f'\n{recuo}<p class="atividade__prazo">📅 Início: '
            f'{formatar_momento(atividade["inicio"])}</p>'
            f'\n{recuo}<p class="atividade__prazo">🏁 Fim: '
            f'{formatar_momento(atividade["fim"])}</p>'
            f'\n{recuo}<p class="atividade__situacao"></p>')


def html_atividade(atividade):
    """Card pequeno de uma atividade (título, tipo, prazo e situação calculada na tela).

    Args:
        atividade: {titulo, link, tipo, inicio, fim}.

    Returns:
        HTML do card.
    """
    recuo = RECUO + " " * 8
    tipo = atividade["tipo"] or TIPO_DESCONHECIDO
    return (f'{recuo}<li class="atividade" data-inicio="{e(atividade["inicio"])}" '
            f'data-fim="{e(atividade["fim"])}">\n'
            f'{recuo}    <a class="atividade__link" href="{quote(atividade["link"])}">\n'
            f'{recuo}        <span class="atividade__tipo">{e(tipo)}</span>\n'
            f'{recuo}        <span class="atividade__titulo">{e(atividade["titulo"])}</span>'
            f'{html_prazo(atividade)}\n'
            f'{recuo}    </a>\n{recuo}</li>')


def html_card(materia):
    """Card de uma matéria.

    Args:
        materia: {uc, curso, pasta, atividades}.

    Returns:
        HTML do card.
    """
    atividades = materia["atividades"]
    quantidade = sum(1 for atividade in atividades if atividade["tipo"] != TIPO_INDICE)
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
