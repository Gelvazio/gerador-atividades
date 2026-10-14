"""Prazo de entrega da atividade (fonte única: o cabeçalho da fonte .md).

Campos da fonte:
    - **Data de entrega inicial:** 14/10/2026
    - **Hora de entrega inicial:** 07:00
    - **Data de entrega final:** 14/10/2026
    - **Hora de entrega final:** 18:00
Padrão (regra do usuário, 2026-10-14): o prazo é de 1 dia, no dia da geração, das 07:00 às
18:00. Na primeira geração, os campos que faltam são GRAVADOS na fonte .md (assim a data não muda
quando a atividade for gerada de novo); depois é só editar a fonte para mudar o prazo.
Os geradores gravam o prazo e o tipo da atividade em <meta> na página (dado, não aparece); o
atividades.html lê essas tags (scripts/atividades/leitor_atividades.py).
"""
import html
import re
from datetime import date, datetime

CAMPO_DATA_INICIAL = "Data de entrega inicial"
CAMPO_HORA_INICIAL = "Hora de entrega inicial"
CAMPO_DATA_FINAL = "Data de entrega final"
CAMPO_HORA_FINAL = "Hora de entrega final"
HORA_INICIAL_PADRAO = "07:00"
HORA_FINAL_PADRAO = "18:00"
FORMATO_DATA_FONTE = "%d/%m/%Y"
FORMATO_FONTE = "%d/%m/%Y %H:%M"
PADRAO_LINHA_META = re.compile(r"^- \*\*(.+?):\*\*\s*(.+)$")
PREFIXO_SECAO = "## "
FORMATO_META = "%Y-%m-%dT%H:%M"
META_INICIO = "entrega-inicio"
META_FIM = "entrega-fim"
META_TIPO = "tipo-atividade"


def ler_momento(metadados, campo_data, campo_hora, hora_padrao):
    """Data e hora de um lado do prazo (início ou fim).

    Args:
        metadados: Metadados da fonte (campo → valor).
        campo_data: Nome do campo da data.
        campo_hora: Nome do campo da hora.
        hora_padrao: Hora usada quando o campo da hora falta.

    Returns:
        datetime, ou None se a data não foi informada.

    Raises:
        SystemExit: Se a data ou a hora estiverem fora do formato DD/MM/AAAA e HH:MM.
    """
    data = (metadados.get(campo_data) or "").strip()
    if not data:
        return None
    hora = (metadados.get(campo_hora) or hora_padrao).strip()
    try:
        return datetime.strptime(f"{data} {hora}", FORMATO_FONTE)
    except ValueError:
        raise SystemExit(f'❌ prazo inválido: "{campo_data}: {data}" / "{campo_hora}: {hora}" '
                         "(use DD/MM/AAAA e HH:MM)") from None


def ler_prazo(metadados):
    """Lê e valida o prazo de entrega da fonte.

    Args:
        metadados: Metadados da fonte (campo → valor).

    Returns:
        Tupla (início, fim), cada um datetime ou None.

    Raises:
        SystemExit: Se o fim vier antes do início.
    """
    inicio = ler_momento(metadados, CAMPO_DATA_INICIAL, CAMPO_HORA_INICIAL, HORA_INICIAL_PADRAO)
    fim = ler_momento(metadados, CAMPO_DATA_FINAL, CAMPO_HORA_FINAL, HORA_FINAL_PADRAO)
    fim_antes_do_inicio = inicio and fim and fim < inicio
    if fim_antes_do_inicio:
        raise SystemExit("❌ prazo inválido: a entrega final vem antes da inicial")
    return inicio, fim


def campos_padrao(hoje=None):
    """Prazo padrão: 1 dia, no dia da geração, das 07:00 às 18:00.

    Args:
        hoje: Data da geração (padrão: hoje).

    Returns:
        Dicionário campo → valor dos 4 campos do prazo.
    """
    dia = (hoje or date.today()).strftime(FORMATO_DATA_FONTE)
    return {CAMPO_DATA_INICIAL: dia, CAMPO_HORA_INICIAL: HORA_INICIAL_PADRAO,
            CAMPO_DATA_FINAL: dia, CAMPO_HORA_FINAL: HORA_FINAL_PADRAO}


def posicao_fim_do_cabecalho(linhas):
    """Índice logo depois da última linha "- **Campo:** valor" do cabeçalho (antes do 1º "## ").

    Args:
        linhas: Linhas da fonte.

    Returns:
        Índice onde inserir os campos novos.
    """
    posicao = 1
    for indice, linha in enumerate(linhas):
        if linha.startswith(PREFIXO_SECAO):
            break
        if PADRAO_LINHA_META.match(linha):
            posicao = indice + 1
    return posicao


def garantir_prazo_na_fonte(caminho_md, metadados):
    """Grava na fonte .md os campos do prazo que faltam (padrão: hoje, 07:00 às 18:00).

    Args:
        caminho_md: Fonte .md da atividade.
        metadados: Metadados já lidos da fonte.

    Returns:
        Metadados com os 4 campos do prazo preenchidos.
    """
    faltando = {campo: valor for campo, valor in campos_padrao().items()
                if not (metadados.get(campo) or "").strip()}
    if not faltando:
        return metadados
    texto = caminho_md.read_text(encoding="utf-8")
    linhas = texto.splitlines()
    posicao = posicao_fim_do_cabecalho(linhas)
    novas = [f"- **{campo}:** {valor}" for campo, valor in faltando.items()]
    linhas[posicao:posicao] = novas
    final = "\n" if texto.endswith("\n") else ""
    caminho_md.write_text("\n".join(linhas) + final, encoding="utf-8")
    print(f"Prazo gravado na fonte {caminho_md.name}: " + ", ".join(novas))
    return {**metadados, **faltando}


def tags_meta(metadados, tipo):
    """Tags <meta> com o tipo da atividade e o prazo (só os lados informados).

    Args:
        metadados: Metadados da fonte.
        tipo: Tipo da atividade (ex.: "Objetiva").

    Returns:
        HTML das tags, uma por linha, com recuo de 4 espaços.
    """
    inicio, fim = ler_prazo(metadados)
    tags = [(META_TIPO, tipo)]
    if inicio:
        tags.append((META_INICIO, inicio.strftime(FORMATO_META)))
    if fim:
        tags.append((META_FIM, fim.strftime(FORMATO_META)))
    return "".join(f'\n    <meta name="{nome}" content="{html.escape(valor)}">'
                   for nome, valor in tags)
