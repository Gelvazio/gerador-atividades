// Modo local das atividades discursivas e práticas (sem login e sem banco): libera os campos,
// atualiza o contador "n/máximo", mostra o aviso de que nada é gravado, liga o botão
// "📥 Exportar PDF" (assets/js/exportar-pdf-discursiva.js) e avisa antes de fechar a página com
// respostas digitadas. A turma do PDF vem do atributo data-turma do <body> (ou fica em branco).

const SELETOR_CAMPO_LOCAL = '.topico-resposta__campo';
const SELETOR_TOPICO_LOCAL = '.topico-resposta';
const SELETOR_CONTADOR_LOCAL = '.topico-resposta__contador';
const SELETOR_PAINEL_LOCAL = '#painel-discursivo .painel-discursivo__texto';
const TURMA_EM_BRANCO_LOCAL = '___________________';
const TEXTO_PAINEL_LOCAL = 'Modo local: as respostas NÃO são gravadas. Digite as respostas, ' +
    'confira e clique em "📥 Exportar PDF" para entregar o arquivo ao professor. ' +
    'Se fechar ou recarregar a página antes de exportar, as respostas se perdem.';

/**
 * Turma usada no cabeçalho do PDF (substitui a lista "Turma" do aulasenai, que depende do banco).
 * @returns {Promise<string>} Turma do atributo data-turma ou a linha em branco.
 */
async function obterTurmaParaExportacao() {
    return document.body.dataset.turma || TURMA_EM_BRANCO_LOCAL;
}

/**
 * Atualiza o contador "n/máximo" de caracteres do campo.
 * @param {HTMLTextAreaElement} campo - Campo de resposta.
 */
function atualizarContadorLocal(campo) {
    const contador = campo.closest(SELETOR_TOPICO_LOCAL)?.querySelector(SELETOR_CONTADOR_LOCAL);
    if (!contador) return;
    contador.textContent = campo.value.length + '/' + campo.maxLength;
}

/**
 * Atualiza o contador quando o aluno digita em um campo de resposta.
 * @param {Event} evento - Evento "input".
 */
function tratarDigitacaoLocal(evento) {
    const ehCampoDeResposta = evento.target.matches?.(SELETOR_CAMPO_LOCAL);
    if (!ehCampoDeResposta) return;
    atualizarContadorLocal(evento.target);
}

/**
 * Indica se algum campo de resposta já tem texto.
 * @returns {boolean} true quando há resposta digitada.
 */
function temRespostaDigitada() {
    return [...document.querySelectorAll(SELETOR_CAMPO_LOCAL)]
        .some((campo) => campo.value.trim() !== '');
}

/**
 * Pede confirmação ao fechar a página quando há respostas (elas não são gravadas).
 * @param {BeforeUnloadEvent} evento - Evento "beforeunload".
 */
function avisarAntesDeSair(evento) {
    if (!temRespostaDigitada()) return;
    evento.preventDefault();
    evento.returnValue = '';
}

/**
 * Prepara a página: libera os campos, mostra o aviso e monta a barra do PDF.
 */
function iniciarDiscursivaLocal() {
    document.querySelectorAll(SELETOR_CAMPO_LOCAL).forEach((campo) => {
        campo.readOnly = false;
        atualizarContadorLocal(campo);
    });
    const painel = document.querySelector(SELETOR_PAINEL_LOCAL);
    if (painel) painel.textContent = TEXTO_PAINEL_LOCAL;
    if (typeof window.montarBarraPdfDiscursiva === 'function') window.montarBarraPdfDiscursiva();
    document.addEventListener('input', tratarDigitacaoLocal);
    window.addEventListener('beforeunload', avisarAntesDeSair);
}

window.obterTurmaParaExportacao = obterTurmaParaExportacao;
document.addEventListener('DOMContentLoaded', iniciarDiscursivaLocal);
