"""Caminhos únicos do repositório gerador-atividades (raiz, assets/ e geradores/).

As páginas geradas usam só a tela deste repositório (assets/css e assets/js), sem login e sem
banco: abrem por duplo clique e exportam o PDF no padrão SENAI.
"""
import os
from pathlib import Path

PASTA_COMUM = Path(__file__).resolve().parent
PASTA_GERADORES = PASTA_COMUM.parent
RAIZ = PASTA_GERADORES.parent
ASSETS = RAIZ / "assets"


def caminho_relativo_assets(pasta):
    """Caminho relativo de uma pasta até assets/, no formato de URL.

    Args:
        pasta: Pasta onde a página HTML é gravada.

    Returns:
        Caminho relativo com barras "/" (ex.: "../../assets").
    """
    return os.path.relpath(ASSETS, pasta).replace(os.sep, "/")
