// Página atividades.html: calcula a situação de cada atividade pelo prazo (ao abrir a página:
// ⏳ ainda não abriu · 🟢 aberta · 🔴 encerrada) e faz a busca, que esconde as matérias e os
// cards que não têm o texto digitado (nome da matéria, curso, tipo e título da atividade).

const CLASSE_OCULTO = 'esta-oculto';
const SELETOR_MATERIA = '.materia';
const SELETOR_ATIVIDADE = '.atividade';
const SELETOR_SITUACAO = '.atividade__situacao';
const SITUACOES = {
    futura: { classe: 'atividade--futura', texto: '⏳ Ainda não abriu' },
    aberta: { classe: 'atividade--aberta', texto: '🟢 Aberta para entrega' },
    encerrada: { classe: 'atividade--encerrada', texto: '🔴 Prazo encerrado' },
};

/**
 * Situação da atividade agora, pelo prazo do card (data-inicio e data-fim).
 * @param {HTMLElement} card - Card da atividade.
 * @param {Date} agora - Momento de referência.
 * @returns {string|null} Chave da situação, ou null quando não há prazo.
 */
function calcularSituacao(card, agora) {
    const { inicio, fim } = card.dataset;
    if (!inicio && !fim) return null;
    const naoAbriuAinda = inicio && agora < new Date(inicio);
    if (naoAbriuAinda) return 'futura';
    const jaEncerrou = fim && agora > new Date(fim);
    if (jaEncerrou) return 'encerrada';
    return 'aberta';
}

/**
 * Marca a situação em todos os cards de atividade.
 */
function marcarSituacoes() {
    const agora = new Date();
    document.querySelectorAll(SELETOR_ATIVIDADE).forEach((card) => {
        const situacao = SITUACOES[calcularSituacao(card, agora)];
        const campo = card.querySelector(SELETOR_SITUACAO);
        if (!situacao || !campo) return;
        card.classList.add(situacao.classe);
        campo.textContent = situacao.texto;
    });
}

/**
 * Mostra ou esconde as atividades de um card de matéria conforme a busca.
 * @param {HTMLElement} card - Card da matéria.
 * @param {string} busca - Texto buscado (minúsculas; vazio mostra tudo).
 * @returns {boolean} true quando o card da matéria deve aparecer.
 */
function filtrarCard(card, busca) {
    const cabecalho = (card.querySelector('.materia__titulo')?.textContent + ' ' +
        card.querySelector('.materia__curso')?.textContent).toLowerCase();
    const casaCabecalho = cabecalho.includes(busca);
    let quantidadeVisiveis = 0;
    card.querySelectorAll(SELETOR_ATIVIDADE).forEach((atividade) => {
        const casaAtividade = casaCabecalho || atividade.textContent.toLowerCase().includes(busca);
        atividade.classList.toggle(CLASSE_OCULTO, !casaAtividade);
        if (casaAtividade) quantidadeVisiveis += 1;
    });
    return casaCabecalho || quantidadeVisiveis > 0;
}

/**
 * Aplica a busca em todos os cards e mostra quantas matérias aparecem.
 */
function aplicarBusca() {
    const busca = document.getElementById('busca-atividades').value.trim().toLowerCase();
    const cards = [...document.querySelectorAll(SELETOR_MATERIA)];
    let visiveis = 0;
    cards.forEach((card) => {
        const deveAparecer = filtrarCard(card, busca);
        card.classList.toggle(CLASSE_OCULTO, !deveAparecer);
        if (deveAparecer) visiveis += 1;
    });
    document.getElementById('resultado-atividades').textContent =
        `${visiveis} de ${cards.length} matéria(s)`;
}

/**
 * Inicia a página: situação dos prazos e busca.
 */
function iniciarPaginaAtividades() {
    marcarSituacoes();
    document.getElementById('busca-atividades')?.addEventListener('input', aplicarBusca);
    aplicarBusca();
}

document.addEventListener('DOMContentLoaded', iniciarPaginaAtividades);
