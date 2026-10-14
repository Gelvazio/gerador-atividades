"""Gera a página de uma atividade discursiva ou prática (Contexto, Comando e Tópicos).

Uso: python gerar.py discursiva|pratica <pasta ATIVIDADES da matéria> [nome da fonte .md]

Fonte: <pasta>/CONTEUDO/AVALIACAO-PRATICA.md (questões com Contexto, Comando e Tópicos) e,
se existir, <pasta>/CONTEUDO/AVALIACAO-PRATICA-GABARITO.md (padrão de resposta: só dá a altura
de cada campo; nunca vai para o HTML).
Saída: <pasta>/AVALIACAO-PRATICA.html (ou o nome do campo "Página").
Modo local (cópia do aulasenai, assets/gerador-avaliacao-discursiva): sem login, sem banco e sem
seed SQL; o aluno digita as respostas e exporta o PDF SENAI (assets/js/discursiva-local.js).
Campos opcionais no cabeçalho da fonte: "- **Pontos por questão:** 0,5" (padrão 1) e
"- **Página:** NOME.html" (padrão: mesmo nome da fonte) e "- **Aviso:** texto" (caixa em
destaque no início da página), "- **Máximo de caracteres:** 500" (limite de cada resposta; padrão
3000), "- **PDF compacto:** sim" (o PDF exportado usa fonte e espaços menores, para caber em
menos folhas) e "- **PDF sem respostas:** sim" (o PDF sai sem as caixas de resposta: o aluno
responde no caderno); os dois em assets/js/exportar-pdf-discursiva.js. "- **Bloquear colar:** sim"
liga o bloqueio de colar/arrastar/copiar nos campos (assets/js/bloqueio-colar-discursiva.js).
"- **Campo do tamanho da resposta:** sim" dá a cada campo a altura da resposta esperada (padrão
de resposta, com folga) e o faz crescer ao digitar (assets/js/campo-tamanho-discursiva.js).
Campos do aulasenai que dependem do banco ("Botão gravar", "Progresso para o professor",
"Ocultar respostas após entrega", "Aula no banco") são aceitos na fonte e ignorados aqui.
"""
import html
import math
import re
import sys
from pathlib import Path
from urllib.parse import quote

GERADOR = Path(__file__).resolve().parent
sys.path.insert(0, str(GERADOR.parent / "comum"))
import capacidades as cap  # noqa: E402
import materia as dados_materia  # noqa: E402
import prazo  # noqa: E402
from configuracao import caminho_relativo_assets  # noqa: E402

TEMPLATE = GERADOR / "template_avaliacao_discursiva.html"
PASTA_FONTES = "CONTEUDO"
FONTE_PADRAO = "AVALIACAO-PRATICA.md"
SUFIXO_GABARITO = "-GABARITO.md"
TIPO_ATIVIDADE = "Discursiva / prática"
MAXIMO_CARACTERES = 3000
PONTOS_POR_QUESTAO_PADRAO = 1.0
CAMPO_PONTOS_POR_QUESTAO = "Pontos por questão"
CAMPO_PAGINA = "Página"
CAMPO_AVISO = "Aviso"
CAMPO_MAXIMO_CARACTERES = "Máximo de caracteres"
CAMPO_PDF_COMPACTO = "PDF compacto"
CAMPO_PDF_SEM_RESPOSTAS = "PDF sem respostas"
CAMPO_BLOQUEAR_COLAR = "Bloquear colar"
CAMPO_TAMANHO_RESPOSTA = "Campo do tamanho da resposta"
ATRIBUTOS_BODY = {CAMPO_PDF_COMPACTO: "data-pdf-compacto",
                  CAMPO_PDF_SEM_RESPOSTAS: "data-pdf-sem-respostas",
                  CAMPO_BLOQUEAR_COLAR: "data-bloquear-colar",
                  CAMPO_TAMANHO_RESPOSTA: "data-campo-tamanho-resposta"}
LINHAS_CAMPO_PADRAO = 5
LINHAS_CAMPO_MAXIMO = 16
CARACTERES_POR_LINHA = 70
FOLGA_RESPOSTA_ALUNO = 1.5
VALOR_SIM = "sim"
TOLERANCIA_PONTOS = 0.001
SEPARADOR_ITEM = re.compile(r"^## ITEM\s+", re.MULTILINE)
PADRAO_META = re.compile(r"^- \*\*(.+?):\*\*\s*(.+)$", re.MULTILINE)
PADRAO_CABECALHO = re.compile(r"^(\d+)\s*[—-]\s*(.+)$")
PADRAO_TOPICO = re.compile(r"^- ([a-z])\)\s*(.+?)\s*\((\d+(?:,\d+)?)\)\s*$", re.MULTILINE)
PADRAO_ORIENTACAO = re.compile(r"^\*\*(.+?):\*\*\s*(.+)$", re.MULTILINE)
PADRAO_NEGRITO = re.compile(r"\*\*(.+?)\*\*")
PADRAO_GABARITO = re.compile(r"^### ITEM\s+(\d+)-([a-z])\s*$", re.MULTILINE)
ROTULOS_SECAO = ("Contexto", "Comando", "Tópicos")
CAIXA_CAPACIDADE_TEXTO = '''                <div class="content-box">
                    <div class="content-label">🎯 CAPACIDADE AVALIADA</div>
                    <div class="content-text">{texto}</div>
                </div>'''
RECUO_QUADRO = " " * 16


def escapar(texto):
    """Escapa texto para HTML.

    Args:
        texto: Texto puro.

    Returns:
        Texto seguro para HTML.
    """
    return html.escape(str(texto), quote=True)


def ler_metadados(texto):
    """Lê os metadados "- **Chave:** valor" do cabeçalho (antes do primeiro item).

    Args:
        texto: Conteúdo completo do .md.

    Returns:
        Dicionário chave → valor.
    """
    cabecalho = SEPARADOR_ITEM.split(texto, maxsplit=1)[0]
    return {chave.strip(): valor.strip() for chave, valor in PADRAO_META.findall(cabecalho)}


def ler_orientacoes(texto):
    """Lê os parágrafos "**Rótulo:** texto" do cabeçalho (empresa fictícia, como responder).

    Args:
        texto: Conteúdo completo do .md.

    Returns:
        Lista de pares (rótulo, texto).
    """
    cabecalho = SEPARADOR_ITEM.split(texto, maxsplit=1)[0]
    return PADRAO_ORIENTACAO.findall(cabecalho)


def extrair_secao(bloco, rotulo):
    """Extrai o texto de uma seção "**Rótulo:**" até a próxima seção conhecida.

    Args:
        bloco: Texto de um item.
        rotulo: Nome da seção (Contexto, Comando ou Tópicos).

    Returns:
        Texto da seção, sem espaços nas pontas ('' se não existir).
    """
    outros = "|".join(re.escape(r) for r in ROTULOS_SECAO if r != rotulo)
    padrao = rf"\*\*{re.escape(rotulo)}:\*\*\s*(.*?)(?=\n\*\*(?:{outros}):\*\*|\n---|\Z)"
    achado = re.search(padrao, bloco, re.DOTALL)
    return achado.group(1).strip() if achado else ""


def ler_topicos(texto_topicos):
    """Lê os tópicos "- a) enunciado (0,5)".

    Args:
        texto_topicos: Texto da seção Tópicos.

    Returns:
        Lista de dicionários com letra, número, enunciado e pontos.
    """
    topicos = []
    for numero, (letra, enunciado, pontos) in enumerate(PADRAO_TOPICO.findall(texto_topicos), 1):
        topicos.append({"letra": letra, "numero": numero, "enunciado": enunciado,
                        "pontos": float(pontos.replace(",", "."))})
    return topicos


def ler_item(bloco):
    """Converte o texto de um item em dicionário.

    Args:
        bloco: Texto do item a partir de "NN — Título".

    Returns:
        Dicionário com número, título, aula, contexto, comando e tópicos.

    Raises:
        ValueError: Se o cabeçalho do item for inválido.
    """
    primeira_linha = bloco.splitlines()[0].strip()
    cabecalho = PADRAO_CABECALHO.match(primeira_linha)
    if not cabecalho:
        raise ValueError(f"Cabeçalho de item inválido: {primeira_linha}")
    meta = dict(PADRAO_META.findall(bloco))
    return {
        "numero": int(cabecalho.group(1)),
        "titulo": cabecalho.group(2).strip(),
        "aula": meta.get("Aula", "").strip(),
        "contexto": extrair_secao(bloco, "Contexto"),
        "comando": extrair_secao(bloco, "Comando"),
        "topicos": ler_topicos(extrair_secao(bloco, "Tópicos")),
        "capacidades": cap.ler_codigos_questao(bloco),
    }


def ler_pontos_por_questao(meta):
    """Lê o valor de cada questão (campo opcional "Pontos por questão"; padrão 1).

    Args:
        meta: Metadados da fonte.

    Returns:
        Pontos que os tópicos de cada questão devem somar.
    """
    valor = meta.get(CAMPO_PONTOS_POR_QUESTAO)
    if not valor:
        return PONTOS_POR_QUESTAO_PADRAO
    return float(valor.replace(",", "."))


def validar_itens(itens, total_esperado, pontos_por_questao):
    """Confere quantidade, numeração, seções e soma dos pontos de cada item.

    Args:
        itens: Itens lidos da fonte.
        total_esperado: Total de questões declarado no cabeçalho.
        pontos_por_questao: Valor que os tópicos de cada questão devem somar.

    Raises:
        ValueError: Na primeira inconsistência encontrada.
    """
    if len(itens) != total_esperado:
        raise ValueError(f"Esperadas {total_esperado} questões, encontradas {len(itens)}.")
    for posicao, item in enumerate(itens, 1):
        rotulo = f"ITEM {item['numero']:02d}"
        if item["numero"] != posicao:
            raise ValueError(f"{rotulo}: numeração fora de ordem (esperado {posicao}).")
        if not (item["contexto"] and item["comando"] and item["topicos"]):
            raise ValueError(f"{rotulo}: falta Contexto, Comando ou Tópicos.")
        soma = sum(topico["pontos"] for topico in item["topicos"])
        if abs(soma - pontos_por_questao) > TOLERANCIA_PONTOS:
            raise ValueError(f"{rotulo}: tópicos somam {soma:g} (esperado {pontos_por_questao:g}).")


def ler_fonte(caminho_md):
    """Lê e valida a fonte da avaliação.

    Args:
        caminho_md: Caminho do .md de questões.

    Returns:
        Tupla (metadados, orientações, itens).
    """
    texto = caminho_md.read_text(encoding="utf-8")
    meta = ler_metadados(texto)
    blocos = SEPARADOR_ITEM.split(texto)[1:]
    itens = [ler_item(bloco) for bloco in blocos]
    validar_itens(itens, int(meta["Total de questões"]), ler_pontos_por_questao(meta))
    return meta, ler_orientacoes(texto), itens


def ler_gabarito(caminho_gabarito):
    """Lê o padrão de resposta e os critérios de cada tópico (se o arquivo existir).

    Args:
        caminho_gabarito: Caminho do -GABARITO.md.

    Returns:
        Dicionário (item, letra) → {"resposta": str, "criterios": str}.
    """
    if not caminho_gabarito.exists():
        return {}
    partes = PADRAO_GABARITO.split(caminho_gabarito.read_text(encoding="utf-8"))[1:]
    gabarito = {}
    for indice in range(0, len(partes), 3):
        item, letra, corpo = int(partes[indice]), partes[indice + 1], partes[indice + 2]
        gabarito[(item, letra)] = {
            "resposta": extrair_campo(corpo, "Resposta esperada"),
            "criterios": extrair_campo(corpo, "Critérios"),
        }
    return gabarito


def extrair_campo(corpo, rotulo):
    """Extrai o texto de "**Rótulo:** texto" de um bloco do gabarito.

    Args:
        corpo: Texto do bloco de um tópico.
        rotulo: Rótulo do campo.

    Returns:
        Texto do campo ou None se não existir.
    """
    achado = re.search(rf"\*\*{re.escape(rotulo)}:\*\*\s*(.+)", corpo)
    return achado.group(1).strip() if achado else None


def calcular_linhas_campo(resposta_esperada):
    """Calcula as linhas do campo pela resposta esperada (com folga para a escrita do aluno).

    Args:
        resposta_esperada: Texto do padrão de resposta do tópico ('' se não houver).

    Returns:
        Número de linhas entre LINHAS_CAMPO_PADRAO e LINHAS_CAMPO_MAXIMO.
    """
    if not resposta_esperada:
        return LINHAS_CAMPO_PADRAO
    linhas = math.ceil(len(resposta_esperada) * FOLGA_RESPOSTA_ALUNO / CARACTERES_POR_LINHA)
    return min(LINHAS_CAMPO_MAXIMO, max(LINHAS_CAMPO_PADRAO, linhas))


def aplicar_linhas_campos(meta, itens, gabarito):
    """Grava em cada tópico as linhas do campo (só com "Campo do tamanho da resposta: sim").

    Args:
        meta: Metadados da fonte.
        itens: Itens validados.
        gabarito: Padrão de resposta por (item, letra).

    Returns:
        Itens com "linhas" em cada tópico (padrão quando o campo não está ligado).
    """
    ligado = meta.get(CAMPO_TAMANHO_RESPOSTA, "").strip().lower() == VALOR_SIM
    for item in itens:
        for topico in item["topicos"]:
            padrao = gabarito.get((item["numero"], topico["letra"]), {})
            resposta = padrao.get("resposta", "") if ligado else ""
            topico["linhas"] = calcular_linhas_campo(resposta)
    return itens


def formatar_pontos(pontos):
    """Formata pontos no padrão brasileiro (ex.: 0.5 → "0,5 ponto").

    Args:
        pontos: Valor numérico.

    Returns:
        Texto com o valor e a unidade.
    """
    numero = f"{pontos:g}".replace(".", ",")
    unidade = "ponto" if pontos <= 1 else "pontos"
    return f"{numero} {unidade}"


def paragrafos_html(texto):
    """Converte texto com quebras de linha em HTML (escapado, com negrito Markdown).

    Args:
        texto: Texto da seção.

    Returns:
        HTML com <br> nas quebras.
    """
    linhas = [escapar(linha.strip()) for linha in texto.splitlines() if linha.strip()]
    return PADRAO_NEGRITO.sub(r"<strong>\1</strong>", "<br>".join(linhas))


def html_topico(item, topico):
    """Monta o campo de resposta de um tópico.

    Args:
        item: Item ao qual o tópico pertence.
        topico: Dados do tópico.

    Returns:
        HTML do bloco do tópico.
    """
    numero = f"{item['numero']:02d}"
    ident = f"resposta-{numero}-{topico['letra']}"
    atributos = f'data-item="{item["numero"]}" data-topico="{topico["numero"]}"'
    linhas = topico.get("linhas", LINHAS_CAMPO_PADRAO)
    return f'''                <div class="topico-resposta" {atributos}>
                    <label class="topico-resposta__rotulo" for="{ident}">
                        <span class="topico-resposta__letra">{topico["letra"]})</span>
                        {escapar(topico["enunciado"])}
                        <span class="topico-resposta__pontos">{formatar_pontos(topico["pontos"])}</span>
                    </label>
                    <textarea id="{ident}" class="topico-resposta__campo" {atributos}
                              maxlength="{item['maximo_caracteres']}" rows="{linhas}"
                              placeholder="Escreva aqui a sua resposta do tópico {topico["letra"]})..."></textarea>
                    <div class="topico-resposta__rodape">
                        <span class="topico-resposta__situacao" aria-live="polite"></span>
                        <span class="topico-resposta__contador">0/{item['maximo_caracteres']}</span>
                    </div>
                </div>
'''


def html_item(item):
    """Monta o cartão de uma questão (aula/tópico, contexto, comando e campos).

    Args:
        item: Dados do item.

    Returns:
        HTML do cartão.
    """
    numero = f"{item['numero']:02d}"
    topicos = "".join(html_topico(item, topico) for topico in item["topicos"])
    quadro = item["quadro"] + "\n" if item.get("quadro") else ""
    return f'''            <section class="aula-card questao-discursiva" id="item-{numero}" data-item="{item["numero"]}">
                <span class="aula-badge">ITEM {numero}</span>
                <span class="questao-discursiva__aula">📚 Aula {escapar(item["aula"])}</span>
                <h2 class="aula-title">{escapar(item["titulo"])}</h2>
{quadro}                <div class="content-box">
                    <div class="content-label">🎬 CONTEXTO</div>
                    <div class="content-text">{paragrafos_html(item["contexto"])}</div>
                </div>
                <div class="content-box">
                    <div class="content-label">🎯 COMANDO</div>
                    <div class="content-text">{paragrafos_html(item["comando"])}</div>
                </div>
                <div class="content-label questao-discursiva__rotulo-topicos">✍️ RESPONDA CADA TÓPICO</div>
{topicos}            </section>
'''


def html_orientacoes(orientacoes):
    """Monta as caixas de orientação do cabeçalho (empresa fictícia, como responder).

    Args:
        orientacoes: Lista de pares (rótulo, texto).

    Returns:
        HTML das caixas.
    """
    caixas = []
    for rotulo, texto in orientacoes:
        caixas.append(f'''                <div class="content-box">
                    <div class="content-label">💡 {escapar(rotulo.upper())}</div>
                    <div class="content-text">{paragrafos_html(texto)}</div>
                </div>''')
    return "\n".join(caixas)


def html_aviso(texto):
    """Monta a caixa de aviso em destaque do início da página (campo "Aviso" da fonte).

    Args:
        texto: Texto do aviso ('' quando a fonte não tem o campo).

    Returns:
        HTML da caixa ou ''.
    """
    if not texto:
        return ""
    return f'            <p class="aviso-atividade" role="alert">⚠️ {escapar(texto)}</p>\n'


def aplicar_capacidades(meta, itens, dados, assets):
    """Monta o quadro de capacidades do início e o de cada questão (campo "- **Capacidade:**").

    Sem capacidade nas questões, mantém a caixa de texto "Capacidade avaliada" do cabeçalho.

    Args:
        meta: Metadados da fonte.
        itens: Itens validados (recebem a chave "quadro").
        dados: Dados da matéria (materia.json).
        assets: Caminho relativo até assets/.

    Returns:
        Tupla (HTML do início, tag do CSS de capacidades).
    """
    usados = [item["capacidades"] for item in itens if item["capacidades"]]
    if not usados:
        return CAIXA_CAPACIDADE_TEXTO.format(texto=escapar(meta["Capacidade avaliada"])), ""
    tabela = dados.get(cap.CAMPO_DADOS, {})
    for item in itens:
        cap.validar_codigos(tabela, item["capacidades"], f"ITEM {item['numero']:02d}")
        item["quadro"] = cap.html_caixa_questao(tabela, item["capacidades"], RECUO_QUADRO)
    inicio = cap.html_quadro(tabela, cap.codigos_usados(usados, tabela), RECUO_QUADRO)
    return inicio, f'\n    <link rel="stylesheet" href="{assets}/css/capacidades.css">'


def linha_slides(pasta, nome):
    """Linha "Slides da aula" das instruções (vazia se a fonte não indicar slides existentes).

    Args:
        pasta: Pasta ATIVIDADES (onde a página é gravada).
        nome: Valor do campo "Slides" da fonte (pode vir entre crases).

    Returns:
        Trecho HTML com o link dos slides ou "".
    """
    caminho = (nome or "").strip("`")
    if not caminho or not (pasta / caminho).exists():
        return ""
    rotulo = "📕 Slides (PDF)" if caminho.lower().endswith(".pdf") else "📕 Slides"
    return ('<br>\n                        <strong>Slides da aula:</strong> '
            f'<a href="{quote(caminho)}" target="_blank" rel="noopener">{rotulo}</a>')


def ler_maximo_caracteres(meta):
    """Lê o limite de caracteres de cada resposta (campo opcional da fonte).

    Args:
        meta: Metadados da fonte.

    Returns:
        Limite informado na fonte ou MAXIMO_CARACTERES.

    Raises:
        SystemExit: Se o valor não for um número inteiro positivo.
    """
    valor = meta.get(CAMPO_MAXIMO_CARACTERES, "").strip()
    if not valor:
        return MAXIMO_CARACTERES
    if not valor.isdigit() or int(valor) <= 0:
        raise SystemExit(f'❌ "{CAMPO_MAXIMO_CARACTERES}" inválido: {valor} (use um número inteiro)')
    return int(valor)


def atributos_body(meta):
    """Atributos opcionais do <body> (PDF exportado e bloqueio de colar; campos "... : sim").

    Args:
        meta: Metadados da fonte.

    Returns:
        Atributos ligados (ex.: ' data-pdf-compacto="sim"') ou '' quando nenhum está ligado.
    """
    ligados = [atributo for campo, atributo in ATRIBUTOS_BODY.items()
               if meta.get(campo, "").strip().lower() == VALOR_SIM]
    return "".join(f' {atributo}="{VALOR_SIM}"' for atributo in ligados)


def montar_trocas(meta, itens, contexto):
    """Monta o dicionário de placeholders do template.

    Args:
        meta: Metadados da fonte.
        itens: Itens validados.
        contexto: Dados de apoio (dados da matéria, orientações, caminhos, nome do .md).

    Returns:
        Dicionário placeholder → valor.
    """
    dados = contexto["dados"]
    turma = meta.get("Turma", "")
    maximo = ler_maximo_caracteres(meta)
    itens = [{**item, "maximo_caracteres": maximo} for item in itens]
    capacidades_inicio, capacidades_css = aplicar_capacidades(
        meta, itens, dados, contexto["assets"])
    return {
        "{{ROTULO}}": escapar(meta.get("Rótulo da aula", meta["Aula"])),
        "{{TEMA}}": escapar(meta["Tema"]), "{{ICONE}}": meta.get("Ícone", "✍️"),
        "{{TOTAL}}": str(len(itens)),
        "{{TOPICOS}}": str(sum(len(item["topicos"]) for item in itens)),
        "{{AULA}}": escapar(meta["Aula"]), "{{DURACAO}}": escapar(meta["Duração"]),
        "{{FORMATO}}": escapar(meta["Formato"]), "{{PONTUACAO}}": escapar(meta["Pontuação"]),
        "{{SLIDES}}": linha_slides(contexto["pasta"], meta.get("Slides", "")),
        "{{CAPACIDADES}}": capacidades_inicio, "{{CAPACIDADES_CSS}}": capacidades_css,
        "{{ORIENTACOES}}": html_orientacoes(contexto["orientacoes"]),
        "{{AVISO}}": html_aviso(meta.get(CAMPO_AVISO, "")),
        "{{QUESTOES}}": "".join(html_item(item) for item in itens),
        "{{ARQUIVO_MD}}": escapar(contexto["arquivo_md"]),
        "{{UC}}": escapar(dados["uc"]), "{{UC_CURTA}}": escapar(dados["uc_curta"]),
        "{{CURSO}}": escapar(dados["curso"]), "{{DOCENTE}}": escapar(meta.get("Docente") or dados["docente"]),
        "{{DATA}}": escapar(meta.get("Data", "")),
        "{{TURMA}}": f' data-turma="{escapar(turma)}"' if turma else "",
        "{{ATRIBUTOS_BODY}}": atributos_body(meta),
        "{{MAXIMO_CARACTERES}}": str(maximo),
        "{{ASSETS}}": contexto["assets"],
        "{{PRAZO}}": prazo.tags_meta(meta, TIPO_ATIVIDADE),
    }


def gerar_pagina(pasta, caminho_md, meta, orientacoes, itens):
    """Gera o HTML da avaliação na pasta ATIVIDADES.

    Args:
        pasta: Pasta ATIVIDADES da matéria.
        caminho_md: Caminho da fonte.
        meta: Metadados da fonte.
        orientacoes: Orientações do cabeçalho.
        itens: Itens validados.

    Returns:
        Caminho do HTML gerado.
    """
    meta = prazo.garantir_prazo_na_fonte(caminho_md, meta)
    contexto = {
        "dados": dados_materia.ler_materia(pasta),
        "orientacoes": orientacoes, "arquivo_md": caminho_md.name, "pasta": pasta,
        "assets": caminho_relativo_assets(pasta),
    }
    pagina = TEMPLATE.read_text(encoding="utf-8")
    for chave, valor in montar_trocas(meta, itens, contexto).items():
        pagina = pagina.replace(chave, valor)
    if "{{" in pagina:
        raise ValueError("Placeholder não substituído no template.")
    saida = pasta / meta.get(CAMPO_PAGINA, caminho_md.stem + ".html")
    saida.write_text(pagina, encoding="utf-8")
    return saida


def localizar_fonte(pasta, nome_fonte):
    """Acha a fonte .md em <pasta>/CONTEUDO/ ou na própria pasta ATIVIDADES.

    Args:
        pasta: Pasta ATIVIDADES da matéria.
        nome_fonte: Nome do arquivo .md.

    Returns:
        Caminho da fonte.

    Raises:
        SystemExit: Se a fonte não existir.
    """
    for candidato in (pasta / PASTA_FONTES / nome_fonte, pasta / nome_fonte):
        if candidato.exists():
            return candidato
    raise SystemExit(f"❌ {nome_fonte} não encontrado em {pasta / PASTA_FONTES} nem em {pasta}")


def main(argumentos):
    """Gera a página da atividade discursiva/prática e mostra o resumo.

    Args:
        argumentos: [<pasta ATIVIDADES>] ou [<pasta ATIVIDADES>, <arquivo .md>].
    """
    if not argumentos:
        raise SystemExit(__doc__)
    pasta = Path(argumentos[0]).resolve()
    nome_fonte = argumentos[1] if len(argumentos) > 1 else FONTE_PADRAO
    caminho_md = localizar_fonte(pasta, nome_fonte)
    meta, orientacoes, itens = ler_fonte(caminho_md)
    gabarito = ler_gabarito(caminho_md.with_name(caminho_md.stem + SUFIXO_GABARITO))
    itens = aplicar_linhas_campos(meta, itens, gabarito)
    html_gerado = gerar_pagina(pasta, caminho_md, meta, orientacoes, itens)
    total_topicos = sum(len(item["topicos"]) for item in itens)
    pontos = sum(topico["pontos"] for item in itens for topico in item["topicos"])
    sem_padrao = total_topicos - len(gabarito)
    print(f"{len(itens)} questões, {total_topicos} tópicos, {pontos:g} pontos")
    print(f"Padrão de resposta: {len(gabarito)} tópicos ({sem_padrao} sem padrão)")
    print(f"Página: {html_gerado}")


if __name__ == "__main__":
    main(sys.argv[1:])
