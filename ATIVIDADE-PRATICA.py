"""Gera a ATIVIDADE PRÁTICA de 1 questão no layout SENAI (HTML com exportação PDF e Word).

Uso: python ATIVIDADE-PRATICA.py <MATERIA>/ATIVIDADES/CONTEUDO/<NOME>.md
Saída: <MATERIA>/ATIVIDADES/<NOME>.html (ou o nome do campo "Página").
Exclusivo para atividade de UMA questão (erro se a fonte tiver mais de uma). Sem banco e sem
login: o aluno digita a resposta e exporta o PDF (impressão) ou o Word.

Fonte (.md):
    - **Título:** ATIVIDADE PRÁTICA
    - **Tema:** Casos de Teste do Login
    - **Página:** NOME.html                (opcional)
    - **Capacidade:** C2, C3               (códigos do materia.json)
    - **Linhas da resposta:** 30           (opcional; padrão 20)
    ## ITEM 1 — Título
    **Contexto:** ...
    **Comando:** ...
    **Tópicos:**                           (opcional)
    - a) ...
Tela: geradores/pratica-unica/template_atividade_pratica.html,
assets/css/atividade-pratica-unica.css e assets/js/atividade-pratica-unica.js.
"""
import base64
import html
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
sys.path.insert(0, str(RAIZ / "geradores" / "comum"))
sys.path.insert(0, str(RAIZ / "scripts"))
import materia as dados_materia  # noqa: E402
from configuracao import ASSETS, caminho_relativo_assets  # noqa: E402
from gerar_pagina_atividades import gerar_pagina_atividades  # noqa: E402

TEMPLATE = RAIZ / "geradores" / "pratica-unica" / "template_atividade_pratica.html"
LOGO = ASSETS / "img" / "logo-sesi-senai.png"
PASTA_FONTES = "CONTEUDO"
TITULO_PADRAO = "ATIVIDADE PRÁTICA"
LINHAS_PADRAO = 20
PREFIXO_CURSO = "Técnico em "
CAMPOS_CAPACIDADES = ("capacidades", "capacidades_socioemocionais")
SEPARADOR_ITEM = re.compile(r"^## ITEM\s+", re.MULTILINE)
PADRAO_META = re.compile(r"^- \*\*(.+?):\*\*\s*(.+)$", re.MULTILINE)
PADRAO_SECAO = r"\*\*{rotulo}:\*\*\s*(.*?)(?=\n\*\*[^*\n]+:\*\*|\Z)"
PADRAO_TOPICO = re.compile(r"^- ([a-z])\)\s*(.+)$", re.MULTILINE)
PADRAO_NEGRITO = re.compile(r"\*\*(.+?)\*\*")
RECUO = " " * 20


def escapar(texto):
    """Escapa texto para HTML e mantém o negrito do Markdown (**texto**).

    Args:
        texto: Texto da fonte.

    Returns:
        HTML seguro.
    """
    return PADRAO_NEGRITO.sub(r"<strong>\1</strong>", html.escape(str(texto), quote=True))


def ler_fonte(caminho_md):
    """Lê os metadados e a única questão da fonte.

    Args:
        caminho_md: Arquivo .md da atividade.

    Returns:
        Tupla (metadados, texto da questão).

    Raises:
        SystemExit: Se a fonte não existir ou não tiver exatamente 1 questão.
    """
    if not caminho_md.is_file():
        raise SystemExit(f"❌ fonte não encontrada: {caminho_md}")
    partes = SEPARADOR_ITEM.split(caminho_md.read_text(encoding="utf-8"))
    quantidade_questoes = len(partes) - 1
    if quantidade_questoes != 1:
        raise SystemExit(f"❌ {caminho_md.name}: este gerador é de 1 questão "
                         f"(a fonte tem {quantidade_questoes})")
    metadados = {chave.strip(): valor.strip() for chave, valor in PADRAO_META.findall(partes[0])}
    return metadados, partes[1]


def extrair_secao(questao, rotulo):
    """Texto de uma seção "**Rótulo:**" da questão (até a próxima seção).

    Args:
        questao: Texto da questão.
        rotulo: Contexto, Comando ou Tópicos.

    Returns:
        Texto da seção sem espaços nas pontas ("" se não existir).
    """
    achado = re.search(PADRAO_SECAO.format(rotulo=rotulo), questao, flags=re.S)
    return achado.group(1).strip() if achado else ""


def html_capacidades(codigos_texto, dados):
    """Linhas "CAPACIDADE: C2 — texto oficial" das capacidades da questão.

    Args:
        codigos_texto: Campo "Capacidade" da fonte (ex.: "C2, C3").
        dados: Dados da matéria (materia.json).

    Returns:
        HTML das linhas de capacidade.

    Raises:
        SystemExit: Se faltar o campo ou um código não existir no materia.json.
    """
    codigos = [codigo.strip() for codigo in codigos_texto.split(",") if codigo.strip()]
    if not codigos:
        raise SystemExit('❌ falta o campo "- **Capacidade:** C1" na fonte')
    tabela = {}
    for campo in CAMPOS_CAPACIDADES:
        tabela.update(dados.get(campo, {}))
    faltando = [codigo for codigo in codigos if codigo not in tabela]
    if faltando:
        raise SystemExit(f"❌ capacidade(s) {', '.join(faltando)} fora do materia.json")
    linhas = [f'{RECUO}<p class="questao__capacidade-linha">CAPACIDADE: {codigo} — '
              f'{escapar(tabela[codigo])}</p>' for codigo in codigos]
    return "\n".join(linhas)


def html_topicos(texto_topicos):
    """Lista dos tópicos da questão (vazia se não houver).

    Args:
        texto_topicos: Seção "Tópicos" da fonte.

    Returns:
        HTML da lista ou "".
    """
    topicos = PADRAO_TOPICO.findall(texto_topicos)
    if not topicos:
        return ""
    itens = "".join(f"\n{RECUO}    <li>{letra}) {escapar(texto)}</li>" for letra, texto in topicos)
    return f'{RECUO}<ul class="questao__topicos">{itens}\n{RECUO}</ul>'


def logo_em_data_uri():
    """Logo SESI SENAI embutido (o Word recebe a imagem sem depender de arquivo).

    Returns:
        Data URI do PNG.
    """
    return "data:image/png;base64," + base64.b64encode(LOGO.read_bytes()).decode("ascii")


def nome_do_curso(curso):
    """Nome do curso para "Curso Técnico em ___" (sem o prefixo, em maiúsculas).

    Args:
        curso: Campo "curso" do materia.json (ex.: "Técnico em Informática para Internet").

    Returns:
        Nome em maiúsculas (ex.: "INFORMÁTICA PARA INTERNET").
    """
    return curso.removeprefix(PREFIXO_CURSO).upper()


def montar_trocas(metadados, questao, dados, pasta_pagina):
    """Placeholders do template.

    Args:
        metadados: Metadados da fonte.
        questao: Texto da questão.
        dados: Dados da matéria.
        pasta_pagina: Pasta onde o HTML é gravado.

    Returns:
        Dicionário placeholder → valor.
    """
    titulo = metadados.get("Título", TITULO_PADRAO)
    tema = metadados.get("Tema", "")
    linhas = metadados.get("Linhas da resposta", str(LINHAS_PADRAO))
    if not linhas.isdigit():
        raise SystemExit(f'❌ "Linhas da resposta" inválido: {linhas}')
    return {
        "{{TITULO}}": escapar(titulo), "{{TEMA}}": escapar(tema),
        "{{CURSO}}": escapar(nome_do_curso(dados["curso"])), "{{UC}}": escapar(dados["uc"].upper()),
        "{{CAPACIDADES}}": html_capacidades(metadados.get("Capacidade", ""), dados),
        "{{CONTEXTO}}": escapar(extrair_secao(questao, "Contexto")),
        "{{COMANDO}}": escapar(extrair_secao(questao, "Comando")),
        "{{TOPICOS}}": html_topicos(extrair_secao(questao, "Tópicos")),
        "{{LINHAS}}": linhas, "{{LOGO}}": logo_em_data_uri(),
        "{{ASSETS}}": caminho_relativo_assets(pasta_pagina),
        "{{RODAPE}}": escapar(f"{titulo} · {dados['uc_curta']} · SENAI"),
    }


def gerar(caminho_md):
    """Gera o HTML da atividade prática de 1 questão.

    Args:
        caminho_md: Fonte .md (em <MATERIA>/ATIVIDADES/CONTEUDO/).

    Returns:
        Caminho do HTML gerado.
    """
    caminho_md = Path(caminho_md).resolve()
    metadados, questao = ler_fonte(caminho_md)
    pasta_pagina = caminho_md.parent
    if pasta_pagina.name == PASTA_FONTES:
        pasta_pagina = pasta_pagina.parent
    dados = dados_materia.ler_materia(pasta_pagina)
    saida = pasta_pagina / metadados.get("Página", caminho_md.stem + ".html")
    trocas = montar_trocas(metadados, questao, dados, pasta_pagina)
    trocas["{{NOME_ARQUIVO}}"] = saida.stem
    pagina = TEMPLATE.read_text(encoding="utf-8")
    for chave, valor in trocas.items():
        pagina = pagina.replace(chave, valor)
    if "{{" in pagina:
        raise SystemExit("❌ marcador do template não substituído")
    saida.write_text(pagina, encoding="utf-8")
    return saida


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    print(f"Página: {gerar(sys.argv[1])}")
    print(f"atividades.html atualizado ({gerar_pagina_atividades()} matéria(s))")
