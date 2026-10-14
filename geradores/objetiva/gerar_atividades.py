"""Gera as páginas de atividade objetiva e o index.html a partir dos .md de questões.

Uso: python gerar.py objetiva <pasta ATIVIDADES> [arquivo.md]
Fonte: ATIVIDADES-AULA-NN-50-QUESTOES.md em <pasta ATIVIDADES>/CONTEUDO/ (com a linha
**Gabarito:** de cada questão; o gabarito NUNCA vai para o HTML).
As páginas HTML são gravadas na pasta ATIVIDADES (nunca dentro de CONTEUDO/).
Dados da matéria: <MATERIA>/materia.json com uc, uc_curta, curso, docente e capacidades.
Modo local (cópia do aulasenai, assets/gerador-atividades): sem login, sem banco, sem folha de
respostas; a página exporta o PDF SENAI (assets/js/atividade.js).
"""
import html
import re
import sys
from pathlib import Path
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "comum"))
import capacidades as cap  # noqa: E402
import materia as dados_materia  # noqa: E402
import prazo  # noqa: E402
from configuracao import caminho_relativo_assets  # noqa: E402

GERADOR = Path(__file__).resolve().parent
TEMPLATE = (GERADOR / "template_atividade.html").read_text(encoding="utf-8")
PASTA_FONTES = "CONTEUDO"
PADRAO_FONTES = "ATIVIDADES-AULA-*-50-QUESTOES.md"
CAMPOS_DADOS = ("uc", "uc_curta", "curso", "docente")
CAMPO_TURMA = "Turma"
CAMPO_ROTULO = "Rótulo da aula"
PREFIXOS_SEM_SUFIXO = ("AVALIACAO-", "ATIVIDADE-")
TIPO_ATIVIDADE = "Objetiva"
PADRAO_META_FONTE = re.compile(r"^- \*\*(.+?):\*\*\s*(.+)$", re.MULTILINE)
PADRAO_DATA_NOME = re.compile(r"(\d{2})-(\d{2})-(\d{4})")
ROTULOS_SLIDES = {".pdf": "📕 Slides (PDF)", ".pptx": "📕 Slides (PowerPoint)"}
ROTULO_SLIDES_PADRAO = "📕 Slides"

e = html.escape


def ler_dados_materia(pasta):
    """Lê o materia.json da matéria; os nomes da matéria nunca ficam fixos no gerador.

    Args:
        pasta: Pasta ATIVIDADES da matéria (o materia.json fica na pasta acima).

    Returns:
        Dicionário com os dados da matéria.
    """
    return dados_materia.ler_materia(pasta, CAMPOS_DADOS)


def caminho_assets(pasta):
    """Caminho relativo da pasta de atividades até assets/, no formato de URL."""
    return caminho_relativo_assets(pasta)


def campo(texto, nome):
    m = re.search(rf"\*\*{re.escape(nome)}:\*\*\s*(.+?)\s*$", texto, flags=re.M)
    if not m:
        raise ValueError(f"campo '{nome}' não encontrado")
    return m.group(1).strip().strip("`")


def campo_opcional(texto, nome):
    """Lê um campo de metadados que pode faltar no .md; devolve "" quando ausente."""
    try:
        return campo(texto, nome)
    except ValueError:
        return ""


def ler_metadados_fonte(texto):
    """Campos "- **Campo:** valor" do cabeçalho da fonte (antes do primeiro "## ").

    Args:
        texto: Conteúdo da fonte .md.

    Returns:
        Dicionário campo → valor.
    """
    cabecalho = re.split(r"^## ", texto, flags=re.M)[0]
    return {chave.strip(): valor.strip()
            for chave, valor in PADRAO_META_FONTE.findall(cabecalho)}


def ler_questoes(md_path):
    texto = md_path.read_text(encoding="utf-8")
    meta = {
        "aula": campo(texto, "Aula"),
        "tema": campo(texto, "Tema"),
        "icone": campo(texto, "Ícone"),
        "duracao": campo(texto, "Duração"),
        "total": int(campo(texto, "Total de questões")),
        "capacidade": campo(texto, "Capacidade avaliada"),
        "conteudo": campo(texto, "Conteúdo-base"),
        "pdf": campo(texto, "Slides"),
        "turma": campo_opcional(texto, CAMPO_TURMA),
    }
    metadados = prazo.garantir_prazo_na_fonte(md_path, ler_metadados_fonte(texto))
    meta["prazo"] = prazo.tags_meta(metadados, TIPO_ATIVIDADE)
    meta["letras"] = ""
    meta["rotulo"] = campo_opcional(texto, CAMPO_ROTULO) or f"Aula {meta['aula']}"
    itens = []
    for bloco in re.split(r"^## ", texto, flags=re.M)[1:]:
        linhas = bloco.strip().splitlines()
        m = re.match(r"ITEM (\d+) — (.+)", linhas[0])
        if not m:
            continue
        item = {"num": m.group(1), "titulo": m.group(2).strip(), "contexto": "", "comando": "", "alts": [], "gab": "",
                "capacidades": cap.ler_codigos_questao(bloco.split("\n---", 1)[0])}
        atual = None
        for ln in linhas[1:]:
            s = ln.strip()
            if s.startswith("**Contexto:**"):
                atual = "contexto"
            elif s.startswith("**Comando:**"):
                atual = "comando"
            elif s.startswith("**Alternativas:**"):
                atual = "alts"
            elif s.startswith("**Gabarito:**"):
                item["gab"] = s.split("**Gabarito:**")[1].strip()
                atual = None
            elif s.startswith("---"):
                break
            elif s and atual == "alts" and re.match(r"- [A-E]\)", s):
                item["alts"].append((s[2], s[5:].strip()))
            elif s and atual in ("contexto", "comando"):
                item[atual] = (item[atual] + " " + s).strip()
        itens.append(item)

    meta["letras"] = ", ".join(sorted({letra for it in itens for letra, _ in it["alts"]}))
    nome = md_path.name
    assert len(itens) == meta["total"], f"{nome}: esperava {meta['total']} itens, achei {len(itens)}"
    for it in itens:
        assert len(it["alts"]) in (4, 5), f"{nome} ITEM {it['num']}: precisa de 4 ou 5 alternativas"
        assert it["gab"] in ("A", "B", "C", "D", "E"), f"{nome} ITEM {it['num']}: gabarito inválido"
        assert it["comando"], f"{nome} ITEM {it['num']}: sem comando"
    return meta, itens


def card(it):
    partes = [f'''            <div class="aula-card questao">
                <span class="aula-badge">ITEM {it["num"]}</span>
                <div class="aula-title">{e(it["titulo"])}</div>''']
    if it.get("quadro"):
        partes.append(it["quadro"])
    if it["contexto"]:
        partes.append(f'''                <div class="content-box">
                    <div class="content-label">📋 CONTEXTO</div>
                    <div class="content-text">{e(it["contexto"])}</div>
                </div>''')
    partes.append(f'''                <div class="content-box">
                    <div class="content-label">🎬 COMANDO</div>
                    <div class="content-text">{e(it["comando"])}</div>
                </div>
                <div class="content-box">
                    <div class="content-label">📝 ALTERNATIVAS</div>
                    <ul class="alternativas">''')
    for letra, txt in it["alts"]:
        partes.append(f'                        <li><span class="letra">{letra})</span>{e(txt)}</li>')
    partes.append('''                    </ul>
                </div>
            </div>''')
    return "\n".join(partes)


CAIXA_CAPACIDADE_TEXTO = '''                <div class="content-box">
                    <div class="content-label">🎯 CAPACIDADE AVALIADA</div>
                    <div class="content-text">{texto}</div>
                </div>'''
RECUO_QUADRO = " " * 16


def aplicar_capacidades(meta, itens, dados, assets):
    """Monta o quadro de capacidades do início e o de cada questão (campo "- **Capacidade:**").

    Sem capacidade nas questões, mantém a caixa de texto "Capacidade avaliada" do cabeçalho.

    Returns:
        Tupla (HTML do início, tag do CSS de capacidades).
    """
    usados = [it["capacidades"] for it in itens if it["capacidades"]]
    if not usados:
        return CAIXA_CAPACIDADE_TEXTO.format(texto=e(meta["capacidade"])), ""
    tabela = dados.get(cap.CAMPO_DADOS, {})
    for it in itens:
        cap.validar_codigos(tabela, it["capacidades"], f"ITEM {it['num']}")
        it["quadro"] = cap.html_caixa_questao(tabela, it["capacidades"], RECUO_QUADRO)
    inicio = cap.html_quadro(tabela, cap.codigos_usados(usados, tabela), RECUO_QUADRO)
    return inicio, f'\n    <link rel="stylesheet" href="{assets}/css/capacidades.css">'


def pasta_da_pagina(md_path):
    """Pasta onde fica a página: a fonte em CONTEUDO/ gera o HTML na pasta ATIVIDADES acima dela."""
    if md_path.parent.name == PASTA_FONTES:
        return md_path.parent.parent
    return md_path.parent


def caminho_saida(md_path):
    """HTML da atividade: avaliações e atividades extraídas do Word (AVALIACAO-*, ATIVIDADE-*) perdem o sufixo -QUESTOES; aulas o mantêm."""
    nome = md_path.stem + ".html"
    if md_path.stem.startswith(PREFIXOS_SEM_SUFIXO):
        nome = md_path.stem.removesuffix("-QUESTOES") + ".html"
    return pasta_da_pagina(md_path) / nome


def localizar_fontes(pasta):
    """Fontes .md da pasta ATIVIDADES: em CONTEUDO/ e, por compatibilidade, na raiz da pasta."""
    encontradas = list((pasta / PASTA_FONTES).glob(PADRAO_FONTES)) + list(pasta.glob(PADRAO_FONTES))
    return sorted(encontradas, key=chave_ordem_data)


def localizar_fonte(pasta, nome):
    """Acha um .md pelo nome em CONTEUDO/ ou na raiz da pasta ATIVIDADES."""
    for candidato in (pasta / PASTA_FONTES / nome, pasta / nome):
        if candidato.exists():
            return candidato
    raise SystemExit(f"{nome} não encontrado em {pasta / PASTA_FONTES} nem em {pasta}")


def gerar_atividade(md_path, dados):
    """Gera a página HTML de uma atividade objetiva (sem gabarito no HTML).

    Args:
        md_path: Fonte .md da atividade.
        dados: Dados da matéria (materia.json).

    Returns:
        Metadados da atividade, com os nomes do HTML e do .md e os títulos dos itens.
    """
    meta, itens = ler_questoes(md_path)
    pasta_pagina = pasta_da_pagina(md_path)
    assets = caminho_assets(pasta_pagina)
    capacidades_inicio, capacidades_css = aplicar_capacidades(meta, itens, dados, assets)
    pagina = TEMPLATE
    trocas = {
        "{{CARDS}}": "\n\n".join(card(it) for it in itens),
        "{{TOTAL}}": str(meta["total"]),
        "{{PRAZO}}": meta["prazo"],
        "{{AULA}}": e(meta["aula"]),
        "{{ROTULO_AULA}}": e(meta["rotulo"]),
        "{{LETRAS}}": e(meta["letras"]),
        "{{TEMA}}": e(meta["tema"]),
        "{{ICONE}}": meta["icone"],
        "{{DURACAO}}": e(meta["duracao"]),
        "{{SLIDES}}": linha_slides(pasta_pagina, meta["pdf"]),
        "{{CAPACIDADES}}": capacidades_inicio,
        "{{CAPACIDADES_CSS}}": capacidades_css,
        "{{ARQUIVO_MD}}": e(md_path.name),
        "{{UC}}": e(dados["uc"]),
        "{{UC_CURTA}}": e(dados["uc_curta"]),
        "{{CURSO}}": e(dados["curso"]),
        "{{DOCENTE}}": e(dados["docente"]),
        "{{TURMA}}": f' data-turma="{e(meta["turma"])}"' if meta["turma"] else "",
        "{{ASSETS}}": assets,
    }
    for chave, valor in trocas.items():
        pagina = pagina.replace(chave, valor)
    assert "{{" not in pagina, f"{md_path.name}: placeholder não substituído"
    saida = caminho_saida(md_path)
    saida.write_text(pagina, encoding="utf-8")
    meta["html"] = saida.name
    meta["md"] = md_path.name
    meta["titulos"] = [it["titulo"] for it in itens]
    return meta


def link(pasta, nome, rotulo, classe):
    if not (pasta / nome).exists():
        return f'<span class="btn off" title="Arquivo não encontrado">{rotulo}</span>'
    return f'<a class="btn {classe}" href="{quote(nome)}">{rotulo}</a>'


def linha_slides(pasta_pagina, nome):
    """Linha "Slides da aula" das instruções da atividade (vazia se não houver arquivo).

    Args:
        pasta_pagina: Pasta onde a página HTML é gravada (o caminho do slide é relativo a ela).
        nome: Valor do campo "Slides" da fonte.

    Returns:
        Trecho HTML com o link dos slides ou "" quando o arquivo não existe.
    """
    if not nome or not (pasta_pagina / nome).exists():
        return ""
    return ('<br>\n                        <strong>Slides da aula:</strong> '
            f'<a href="{quote(nome)}" target="_blank" rel="noopener">{rotulo_slides(nome)}</a>')


def rotulo_slides(nome):
    """Rótulo do botão de slides conforme a extensão real do arquivo (PDF ou PowerPoint)."""
    return ROTULOS_SLIDES.get(Path(nome or "").suffix.lower(), ROTULO_SLIDES_PADRAO)


def chave_ordem_data(md_path):
    """Ordena pela data DD-MM-AAAA do nome (cronológica); arquivos sem data vão para o fim."""
    achado = PADRAO_DATA_NOME.search(md_path.name)
    if not achado:
        return (1, "", md_path.name)
    dia, mes, ano = achado.groups()
    return (0, f"{ano}{mes}{dia}", md_path.name)


def gerar_index(pasta, aulas, dados):
    cards = []
    for a in aulas:
        topicos = "".join(f"<li>{e(t)}</li>" for t in a["titulos"])
        cards.append(f'''        <article class="aula">
            <div class="topo">
                <span class="icone">{a["icone"]}</span>
                <div>
                    <div class="num">AULA {e(a["aula"])}</div>
                    <h2>{e(a["tema"])}</h2>
                </div>
            </div>
            <p class="meta">{a["total"]} questões · múltipla escolha · {e(a["duracao"])}</p>
            <div class="acoes">
                {link(pasta, a["html"], "📝 Atividade", "principal")}
                {link(pasta, a["conteudo"], "📚 Conteúdo (.md)", "")}
                {link(pasta, a["pdf"], rotulo_slides(a["pdf"]), "")}
            </div>
            <details>
                <summary>Ver os {a["total"]} itens</summary>
                <ol>{topicos}</ol>
            </details>
        </article>''')

    total_q = sum(a["total"] for a in aulas)
    uc_curta = e(dados["uc_curta"])
    pagina = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Índice de Atividades — {uc_curta}</title>
    <link rel="stylesheet" href="{caminho_assets(pasta)}/css/indice-atividades.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>📚 Índice de Atividades — {uc_curta}</h1>
            <p>{e(dados["curso"])} — SENAI</p>
        </header>
        <div class="resumo">
            <span>{len(aulas)} aulas</span><span>·</span><span>{total_q} questões</span><span>·</span><span>50 questões por aula, múltipla escolha (A–D), com exportação em PDF</span>
        </div>
        <section class="grade">
{chr(10).join(cards)}
        </section>
    </div>
    <footer>
        <p>Páginas geradas a partir dos arquivos CONTEUDO/ATIVIDADES-AULA-NN-50-QUESTOES.md — edite o .md e rode python gerar.py objetiva.</p>
    </footer>
</body>
</html>
'''
    (pasta / "index.html").write_text(pagina, encoding="utf-8")


def main(argumentos):
    """Gera uma atividade (com o nome do .md) ou todas as da pasta e o index.html.

    Args:
        argumentos: [<pasta ATIVIDADES>] ou [<pasta ATIVIDADES>, <arquivo .md>].
    """
    if len(argumentos) not in (1, 2):
        raise SystemExit("Uso: python gerar.py objetiva <pasta ATIVIDADES> [arquivo.md]")
    pasta = Path(argumentos[0]).resolve()
    if not pasta.is_dir():
        raise SystemExit(f"Pasta não encontrada: {pasta}")
    dados = ler_dados_materia(pasta)
    if len(argumentos) == 2:
        md = localizar_fonte(pasta, argumentos[1])
        meta = gerar_atividade(md, dados)
        print(f"{meta['rotulo']}: {meta['total']} itens -> {meta['html']} (index.html não alterado)")
        return
    arquivos = localizar_fontes(pasta)
    if not arquivos:
        raise SystemExit(f"Nenhum {PADRAO_FONTES} em {pasta / PASTA_FONTES} nem em {pasta}; "
                         "index.html não alterado")
    aulas = [gerar_atividade(md, dados) for md in arquivos]
    gerar_index(pasta, aulas, dados)
    for a in aulas:
        print(f"Aula {a['aula']}: {a['total']} itens -> {a['html']}")
    print("index.html gerado com", len(aulas), "aulas")


if __name__ == "__main__":
    main(sys.argv[1:])
