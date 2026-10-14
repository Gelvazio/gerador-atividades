// Bloqueio de colar nas avaliações discursivas: obriga o aluno a digitar cada resposta.
// Só liga quando o <body> tem data-bloquear-colar="sim" (campo "- **Bloquear colar:** sim" da
// fonte .md, lido pelo gerador assets/gerador-avaliacao-discursiva/). Bloqueia colar, arrastar
// texto para dentro, copiar e recortar nos campos de resposta e avisa com o popup.
// Não é 100%: extensões e ditado por voz ainda inserem texto. Regra: docs/regras/atividades.md

const ATRIBUTO_BLOQUEAR_COLAR = 'bloquearColar';
const VALOR_BLOQUEIO_LIGADO = 'sim';
const SELETOR_CAMPO_BLOQUEADO = '.topico-resposta__campo';
const EVENTOS_BLOQUEADOS = ['paste', 'drop', 'copy', 'cut'];
const TIPOS_ENTRADA_BLOQUEADOS = [
    'insertFromPaste', 'insertFromDrop', 'insertFromPasteAsQuotation',
];
const MSG_COLAR_BLOQUEADO = 'Nesta prova não é permitido colar, arrastar, copiar ou recortar ' +
    'texto nas respostas. Digite a sua resposta com as suas palavras.';
const TITULO_COLAR_BLOQUEADO = 'Digite a sua resposta';

const estadoBloqueioColar = { avisoAberto: false };

/**
 * Indica se a página pediu o bloqueio de colar (atributo data-bloquear-colar="sim" no <body>).
 * @returns {boolean} true quando o bloqueio está ligado.
 */
function estaBloqueioColarLigado() {
    return document.body?.dataset[ATRIBUTO_BLOQUEAR_COLAR] === VALOR_BLOQUEIO_LIGADO;
}

/**
 * Indica se o evento aconteceu dentro de um campo de resposta.
 * @param {Event} evento - Evento do navegador.
 * @returns {boolean} true quando o alvo é um campo de resposta.
 */
function ehCampoDeResposta(evento) {
    return Boolean(evento.target?.closest?.(SELETOR_CAMPO_BLOQUEADO));
}

/**
 * Mostra o aviso de bloqueio uma vez por tentativa (sem empilhar popups).
 */
async function avisarColarBloqueado() {
    if (estadoBloqueioColar.avisoAberto) return;
    if (typeof mostrarPopup !== 'function') return;

    estadoBloqueioColar.avisoAberto = true;
    try {
        await mostrarPopup(MSG_COLAR_BLOQUEADO, { tipo: 'aviso', titulo: TITULO_COLAR_BLOQUEADO });
    } finally {
        estadoBloqueioColar.avisoAberto = false;
    }
}

/**
 * Cancela colar, arrastar, copiar ou recortar quando o alvo é um campo de resposta.
 * @param {Event} evento - Evento paste, drop, copy ou cut.
 */
function bloquearEventoDeTexto(evento) {
    if (!ehCampoDeResposta(evento)) return;

    evento.preventDefault();
    avisarColarBloqueado();
}

/**
 * Cancela texto colado ou arrastado que chegue por outro caminho (ex.: menu do navegador).
 * @param {InputEvent} evento - Evento beforeinput.
 */
function bloquearEntradaColada(evento) {
    const ehEntradaColada = TIPOS_ENTRADA_BLOQUEADOS.includes(evento.inputType);
    if (!ehEntradaColada || !ehCampoDeResposta(evento)) return;

    evento.preventDefault();
    avisarColarBloqueado();
}

/**
 * Liga o bloqueio na página, se ela pediu (os eventos são capturados no documento inteiro).
 */
function iniciarBloqueioColar() {
    if (!estaBloqueioColarLigado()) return;

    EVENTOS_BLOQUEADOS.forEach((nome) => {
        document.addEventListener(nome, bloquearEventoDeTexto, true);
    });
    document.addEventListener('beforeinput', bloquearEntradaColada, true);
}

document.addEventListener('DOMContentLoaded', iniciarBloqueioColar);
