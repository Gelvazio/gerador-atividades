// Busca da página atividades.html: esconde as matérias e as atividades que não têm o texto
// digitado (procura no nome da matéria, no curso e no título de cada atividade).

const CLASSE_OCULTO = 'esta-oculto';
const SELETOR_MATERIA = '.materia';
const SELETOR_ATIVIDADE = '.materia__atividade';

/**
 * Mostra ou esconde as atividades de um card conforme a busca.
 * @param {HTMLElement} card - Card da matéria.
 * @param {string} busca - Texto buscado (minúsculas).
 * @returns {boolean} true quando o card deve aparecer.
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
        const deveAparecer = !busca || filtrarCard(card, busca);
        if (!busca) filtrarCard(card, '');
        card.classList.toggle(CLASSE_OCULTO, !deveAparecer);
        if (deveAparecer) visiveis += 1;
    });
    document.getElementById('resultado-atividades').textContent =
        `${visiveis} de ${cards.length} matéria(s)`;
}

/**
 * Liga a busca.
 */
function iniciarPaginaAtividades() {
    document.getElementById('busca-atividades')?.addEventListener('input', aplicarBusca);
    aplicarBusca();
}

document.addEventListener('DOMContentLoaded', iniciarPaginaAtividades);
