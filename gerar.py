"""Ponto de entrada único dos geradores de atividades (modo local, sem login e sem banco).

Uso:
    python gerar.py objetiva   <pasta ATIVIDADES> [arquivo.md]
    python gerar.py pratica    <pasta ATIVIDADES> [arquivo.md]
    python gerar.py discursiva <pasta ATIVIDADES> [arquivo.md]

Exemplo:
    python gerar.py discursiva TESTES-DE-FRONTEND/ATIVIDADES DESAFIO-01-CASOS-DE-TESTE-LOGIN.md
"""
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
PASTAS_GERADORES = ("objetiva", "discursiva", "comum")
for _nome_pasta in PASTAS_GERADORES:
    sys.path.insert(0, str(RAIZ / "geradores" / _nome_pasta))

import gerar_atividades  # noqa: E402
import gerar_avaliacao_discursiva  # noqa: E402

# Prática (10 questões × 3 tópicos) e discursiva usam o mesmo gerador: muda só a fonte .md.
GERADORES = {
    "objetiva": gerar_atividades.main,
    "pratica": gerar_avaliacao_discursiva.main,
    "discursiva": gerar_avaliacao_discursiva.main,
}


def executar(argumentos):
    """Escolhe o gerador pelo tipo e repassa os demais argumentos.

    Args:
        argumentos: [tipo, pasta ATIVIDADES, arquivo .md opcional].

    Raises:
        SystemExit: Se o tipo não for informado ou não existir.
    """
    if not argumentos or argumentos[0] not in GERADORES:
        raise SystemExit(__doc__)
    GERADORES[argumentos[0]](argumentos[1:])


if __name__ == "__main__":
    executar(sys.argv[1:])
