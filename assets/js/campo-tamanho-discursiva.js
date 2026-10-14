// Campo do tamanho da resposta nas avaliações discursivas: o campo cresce enquanto o aluno
// digita, para a resposta inteira ficar sempre à vista (sem rolagem dentro do campo).
// Só liga quando o <body> tem data-campo-tamanho-resposta="sim" (campo "- **Campo do tamanho da
// resposta:** sim" da fonte .md); a altura inicial (rows) vem do gerador, pela resposta esperada.
// Regra: docs/regras/atividades.md

const ATRIBUTO_CAMPO_TAMANHO = 'campoTamanhoResposta';
const VALOR_CAMPO_TAMANHO_LIGADO = 'sim';
const SELETOR_CAMPO_TAMANHO = '.topico-resposta__campo';
const EVENTO_RESPOSTAS_PREENCHIDAS = 'discursiva:campos-preenchidos';
const ALTURA_AUTOMATICA = 'auto';

/**
 * Indica se a página pediu o campo do tamanho da resposta.
 * @returns {boolean} true quando o atributo está ligado no <body>.
 */
function estaCampoTamanhoLigado() {
    return document.body?.dataset[ATRIBUTO_CAMPO_TAMANHO] === VALOR_CAMPO_TAMANHO_LIGADO;
}

/**
 * Ajusta a altura do campo ao texto (nunca menor que as linhas definidas pelo gerador).
 * @param {HTMLTextAreaElement} campo - Campo de resposta.
 */
function ajustarAlturaDoCampo(campo) {
    campo.style.height = ALTURA_AUTOMATICA;
    campo.style.height = campo.scrollHeight + 'px';
}

/**
 * Ajusta todos os campos (ex.: depois de carregar as respostas gravadas no banco).
 */
function ajustarTodosOsCampos() {
    document.querySelectorAll(SELETOR_CAMPO_TAMANHO).forEach(ajustarAlturaDoCampo);
}

/**
 * Ajusta o campo em que o aluno está digitando.
 * @param {InputEvent} evento - Evento input.
 */
function ajustarCampoDigitado(evento) {
    const campo = evento.target?.closest?.(SELETOR_CAMPO_TAMANHO);
    if (!campo) return;

    ajustarAlturaDoCampo(campo);
}

/**
 * Liga o ajuste automático, se a página pediu.
 */
function iniciarCampoTamanho() {
    if (!estaCampoTamanhoLigado()) return;

    document.addEventListener('input', ajustarCampoDigitado);
    document.addEventListener(EVENTO_RESPOSTAS_PREENCHIDAS, ajustarTodosOsCampos);
    window.addEventListener('resize', ajustarTodosOsCampos);
}

document.addEventListener('DOMContentLoaded', iniciarCampoTamanho);
