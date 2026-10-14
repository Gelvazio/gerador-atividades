"""Gera o index.html (quadro de tarefas em cards, com filtros) a partir do tasks/STATUS.md.

Uso (na raiz do repositório): python scripts/gerar_quadro.py
Rodar de novo ao encerrar cada tarefa (o index.html vai no mesmo commit). Não editar o
index.html à mão: ele é sobrescrito. Tela: scripts/quadro/ (modelo.html, quadro.css, quadro.js).
"""
import html
import json
import sys
from datetime import datetime
from pathlib import Path

PASTA_SCRIPTS = Path(__file__).resolve().parent
RAIZ = PASTA_SCRIPTS.parent
sys.path.insert(0, str(PASTA_SCRIPTS / "quadro"))
from leitor_quadro import ler_quadro  # noqa: E402

MODELO = PASTA_SCRIPTS / "quadro" / "modelo.html"
SAIDA = RAIZ / "index.html"
FORMATO_DATA_HORA = "%Y-%m-%d %H:%M"


def dados_em_json(quadro):
    """Converte os dados do quadro em JSON seguro para dentro de <script type="application/json">.

    Args:
        quadro: Dados lidos do STATUS.md.

    Returns:
        Texto JSON sem "</" (não fecha a tag script por engano).
    """
    return json.dumps(quadro, ensure_ascii=False).replace("</", "<\\/")


def gerar_index(raiz=RAIZ, saida=SAIDA):
    """Gera o index.html do quadro.

    Args:
        raiz: Raiz do repositório (com a pasta tasks/).
        saida: Arquivo HTML de saída.

    Returns:
        Quantidade de tarefas escritas.
    """
    quadro = ler_quadro(raiz)
    trocas = {
        "{{TITULO}}": html.escape(quadro["titulo"]),
        "{{GERADO_EM}}": datetime.now().strftime(FORMATO_DATA_HORA),
        "{{DADOS}}": dados_em_json(quadro),
    }
    pagina = MODELO.read_text(encoding="utf-8")
    for chave, valor in trocas.items():
        pagina = pagina.replace(chave, valor)
    saida.write_text(pagina, encoding="utf-8")
    return len(quadro["tarefas"])


if __name__ == "__main__":
    print(f"index.html gerado com {gerar_index()} tarefas")
