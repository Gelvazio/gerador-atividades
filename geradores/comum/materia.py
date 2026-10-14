"""Leitura do arquivo único de dados da matéria: <MATERIA>/materia.json.

O materia.json substitui ATIVIDADES/atividades.json e APOSTILA/apostila.json. Todos os geradores
(atividades, avaliação discursiva, média final, apostila) leem os dados por este módulo.
Copiado do repositório aulasenai (assets/gerador-materia/materia.py).
"""
import json
from pathlib import Path

from configuracao import RAIZ

ARQUIVO_MATERIA = "materia.json"
PASTA_PROJETO = RAIZ
CAMPOS_BASICOS = ("uc", "uc_curta", "curso", "docente")


def localizar_materia(pasta):
    """Procura o materia.json na pasta informada e nas pastas acima (até a raiz do projeto).

    Args:
        pasta: Pasta de partida (ex.: <MATERIA>/ATIVIDADES ou a própria pasta da matéria).

    Returns:
        Caminho do materia.json ou None se não existir.
    """
    atual = Path(pasta).resolve()
    while PASTA_PROJETO in atual.parents or atual == PASTA_PROJETO:
        candidato = atual / ARQUIVO_MATERIA
        if candidato.is_file():
            return candidato
        if atual == PASTA_PROJETO:
            return None
        atual = atual.parent
    return None


def ler_materia(pasta, campos_obrigatorios=CAMPOS_BASICOS):
    """Lê o materia.json da matéria e confere os campos obrigatórios.

    Args:
        pasta: Pasta de partida para localizar o arquivo.
        campos_obrigatorios: Campos que precisam existir e não podem estar vazios.

    Returns:
        Dicionário com os dados da matéria.

    Raises:
        SystemExit: Se o arquivo não existir ou faltar algum campo obrigatório.
    """
    arquivo = localizar_materia(pasta)
    if arquivo is None:
        raise SystemExit(f"❌ não encontrei {ARQUIVO_MATERIA} em {Path(pasta).resolve()} "
                         "nem nas pastas acima (ele fica na raiz da pasta da matéria)")
    dados = json.loads(arquivo.read_text(encoding="utf-8"))
    faltando = [campo for campo in campos_obrigatorios if not dados.get(campo)]
    if faltando:
        raise SystemExit(f"❌ {arquivo}: faltam os campos {', '.join(faltando)}")
    return dados


def pasta_da_materia(pasta):
    """Devolve a pasta da matéria (onde fica o materia.json).

    Args:
        pasta: Pasta de partida.

    Returns:
        Pasta da matéria ou None se o materia.json não for encontrado.
    """
    arquivo = localizar_materia(pasta)
    return arquivo.parent if arquivo else None
