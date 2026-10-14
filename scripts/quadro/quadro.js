// Quadro de tarefas (index.html): lê os dados embutidos (<script id="dados-quadro">), monta os
// contadores por status, os filtros, os cards das tarefas e a faixa das frentes. Só leitura:
// a fonte é o tasks/STATUS.md (python scripts/gerar_quadro.py gera o index.html).

const ROTULOS_STATUS = {
    pendente: '⬜ Pendente',
    andamento: '🔄 Em progresso',
    aguardando: '👀 Aguardando o usuário',
    bloqueado: '⛔ Bloqueado / cancelado',
    concluido: '✅ Concluído',
};
const SEM_VALOR = '—';
const ID_DADOS = 'dados-quadro';
const IDS_FILTROS = { status: 'filtro-status', prioridade: 'filtro-prioridade',
    agente: 'filtro-agente', busca: 'filtro-busca' };

/**
 * Lê os dados do quadro embutidos na página.
 * @returns {{titulo: string, tarefas: Object[], frentes: Object[]}} Dados do quadro.
 */
function lerDadosQuadro() {
    const elemento = document.getElementById(ID_DADOS);
    if (!elemento) return { titulo: '', tarefas: [], frentes: [] };
    return JSON.parse(elemento.textContent);
}

/**
 * Cria um elemento com classe e texto.
 * @param {string} tag - Tag HTML.
 * @param {string} [classe] - Classes CSS.
 * @param {string} [texto] - Texto (sempre como texto, nunca HTML).
 * @returns {HTMLElement} Elemento criado.
 */
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

/**
 * Valores distintos de um campo das tarefas, em ordem alfabética.
 * @param {Object[]} tarefas - Tarefas.
 * @param {string} campo - Campo a listar.
 * @returns {string[]} Valores sem repetição e sem vazios.
 */
function valoresDistintos(tarefas, campo) {
    const valores = tarefas.map((tarefa) => tarefa[campo])
        .filter((valor) => valor && valor !== SEM_VALOR);
    return [...new Set(valores)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Preenche uma lista de filtro com opções.
 * @param {string} id - Id do <select>.
 * @param {Array<{valor: string, rotulo: string}>} opcoes - Opções.
 */
function preencherFiltro(id, opcoes) {
    const lista = document.getElementById(id);
    opcoes.forEach(({ valor, rotulo }) => {
        const opcao = criarElemento('option', '', rotulo);
        opcao.value = valor;
        lista.append(opcao);
    });
}

/**
 * Monta as opções dos filtros a partir das tarefas.
 * @param {Object[]} tarefas - Tarefas.
 */
function montarFiltros(tarefas) {
    preencherFiltro(IDS_FILTROS.status, Object.entries(ROTULOS_STATUS)
        .map(([valor, rotulo]) => ({ valor, rotulo })));
    preencherFiltro(IDS_FILTROS.prioridade, valoresDistintos(tarefas, 'prioridade')
        .map((valor) => ({ valor, rotulo: valor })));
    preencherFiltro(IDS_FILTROS.agente, valoresDistintos(tarefas, 'agente')
        .map((valor) => ({ valor, rotulo: valor })));
}

/**
 * Lê os valores atuais dos filtros.
 * @returns {{status: string, prioridade: string, agente: string, busca: string}} Filtros.
 */
function lerFiltros() {
    const valor = (id) => document.getElementById(id).value;
    return { status: valor(IDS_FILTROS.status), prioridade: valor(IDS_FILTROS.prioridade),
        agente: valor(IDS_FILTROS.agente), busca: valor(IDS_FILTROS.busca).trim().toLowerCase() };
}

/**
 * Texto da tarefa usado pela busca (número, título, agente, próximo passo e itens).
 * @param {Object} tarefa - Tarefa.
 * @returns {string} Texto em minúsculas.
 */
function textoDeBusca(tarefa) {
    const itens = (tarefa.itens || []).map((item) => item.numero + ' ' + item.descricao);
    return [tarefa.numero, tarefa.titulo, tarefa.agente, tarefa.proximo_passo, ...itens]
        .join(' ').toLowerCase();
}

/**
 * Indica se a tarefa passa em todos os filtros.
 * @param {Object} tarefa - Tarefa.
 * @param {Object} filtros - Filtros atuais.
 * @returns {boolean} true quando a tarefa deve aparecer.
 */
function passaNosFiltros(tarefa, filtros) {
    const passaStatus = !filtros.status || tarefa.classe === filtros.status;
    const passaPrioridade = !filtros.prioridade || tarefa.prioridade === filtros.prioridade;
    const passaAgente = !filtros.agente || tarefa.agente === filtros.agente;
    const passaBusca = !filtros.busca || textoDeBusca(tarefa).includes(filtros.busca);
    return passaStatus && passaPrioridade && passaAgente && passaBusca;
}

/**
 * Lista de dados do card (rótulo → valor).
 * @param {Object} tarefa - Tarefa.
 * @returns {HTMLElement} Elemento <dl>.
 */
function criarDadosDoCard(tarefa) {
    const dados = criarElemento('dl', 'cartao__dados');
    const linhas = [
        ['Agente', tarefa.agente || SEM_VALOR],
        ['Reservada por', tarefa.em_uso_por || SEM_VALOR],
        ['Pedida em', tarefa.pedido_em || SEM_VALOR],
        ['Terminou em', tarefa.terminou_em || 'em aberto'],
        ['Prioridade', tarefa.prioridade || SEM_VALOR],
    ];
    linhas.forEach(([rotulo, valor]) => {
        dados.append(criarElemento('dt', '', rotulo), criarElemento('dd', '', valor));
    });
    return dados;
}

/**
 * Barra de progresso e lista de itens da etapa (dentro de um <details>).
 * @param {Object[]} itens - Itens da etapa.
 * @returns {HTMLElement[]} Elementos da barra e dos itens.
 */
function criarItensDoCard(itens) {
    const concluidos = itens.filter((item) => item.classe === 'concluido').length;
    const progresso = criarElemento('div', 'progresso');
    const barra = criarElemento('div', 'progresso__barra');
    barra.style.width = (itens.length ? (concluidos / itens.length) * 100 : 0) + '%';
    progresso.append(barra);
    const detalhes = criarElemento('details');
    const resumo = `Itens: ${concluidos}/${itens.length} concluídos`;
    detalhes.append(criarElemento('summary', '', resumo));
    const lista = criarElemento('ul', 'cartao__itens');
    itens.forEach((item) => {
        const temData = item.concluido_em && item.concluido_em !== SEM_VALOR;
        const data = temData ? ` · ${item.concluido_em}` : '';
        const texto = `${item.status} — ${item.numero} ${item.descricao}${data}`;
        lista.append(criarElemento('li', '', texto));
    });
    detalhes.append(lista);
    return [progresso, detalhes];
}

/**
 * Monta o card de uma tarefa.
 * @param {Object} tarefa - Tarefa.
 * @returns {HTMLElement} Card.
 */
function criarCard(tarefa) {
    const card = criarElemento('article', `cartao status--${tarefa.classe}`);
    const topo = criarElemento('div', 'cartao__topo');
    topo.append(criarElemento('span', 'cartao__numero', tarefa.numero),
        criarElemento('span', 'etiqueta', tarefa.status || ROTULOS_STATUS[tarefa.classe]));
    card.append(topo, criarElemento('h2', 'cartao__titulo', tarefa.titulo),
        criarDadosDoCard(tarefa));
    if (tarefa.proximo_passo) {
        const texto = '➡️ Próximo passo: ' + tarefa.proximo_passo;
        card.append(criarElemento('p', 'cartao__proximo', texto));
    }
    if (tarefa.itens?.length) card.append(...criarItensDoCard(tarefa.itens));
    return card;
}

/**
 * Mostra os cards que passam nos filtros.
 * @param {Object[]} tarefas - Todas as tarefas.
 */
function mostrarTarefas(tarefas) {
    const filtros = lerFiltros();
    const visiveis = tarefas.filter((tarefa) => passaNosFiltros(tarefa, filtros));
    const grade = document.getElementById('grade-tarefas');
    grade.replaceChildren(...visiveis.map(criarCard));
    if (!visiveis.length) {
        grade.append(criarElemento('p', 'vazio', 'Nenhuma tarefa com esses filtros.'));
    }
    document.getElementById('resultado').textContent =
        `${visiveis.length} de ${tarefas.length} tarefas`;
    document.querySelectorAll('.contador').forEach((contador) => {
        contador.classList.toggle('contador--ativo', contador.dataset.status === filtros.status);
    });
}

/**
 * Monta os contadores por status (clicar filtra pelo status).
 * @param {Object[]} tarefas - Tarefas.
 * @param {Function} aoMudar - Chamado depois de mudar o filtro.
 */
function montarContadores(tarefas, aoMudar) {
    const area = document.getElementById('contadores');
    Object.entries(ROTULOS_STATUS).forEach(([status, rotulo]) => {
        const botao = criarElemento('button', `contador status--${status}`);
        botao.type = 'button';
        botao.dataset.status = status;
        const quantidade = tarefas.filter((tarefa) => tarefa.classe === status).length;
        botao.append(criarElemento('span', 'contador__numero', String(quantidade)),
            criarElemento('span', 'contador__rotulo', rotulo));
        botao.addEventListener('click', () => {
            const filtro = document.getElementById(IDS_FILTROS.status);
            filtro.value = filtro.value === status ? '' : status;
            aoMudar();
        });
        area.append(botao);
    });
}

/**
 * Classe de status de uma frente pelo emoji da coluna "Situação".
 * @param {string} situacao - Texto da situação.
 * @returns {string} Classe do status.
 */
function classeDaFrente(situacao) {
    if (situacao.startsWith('🔄')) return 'andamento';
    if (situacao.startsWith('👀')) return 'aguardando';
    if (situacao.startsWith('⏹') || situacao.startsWith('✅')) return 'concluido';
    return 'pendente';
}

/**
 * Monta a faixa das frentes de trabalho.
 * @param {Object[]} frentes - Linhas da tabela "🧭 Frentes".
 */
function montarFrentes(frentes) {
    const lista = document.getElementById('lista-frentes');
    if (!frentes.length) lista.append(criarElemento('p', 'vazio', 'Nenhuma frente registrada.'));
    frentes.forEach((frente) => {
        const situacao = frente['Situação'] || '';
        const cartao = criarElemento('div', `frente status--${classeDaFrente(situacao)}`);
        cartao.append(criarElemento('span', 'frente__nome', frente['Frente'] || SEM_VALOR),
            criarElemento('div', '', frente['Tarefa (etapa)'] || ''),
            criarElemento('div', '', `${situacao} · ${frente['Atualizado em'] || ''}`));
        lista.append(cartao);
    });
}

/**
 * Liga os filtros e o botão "Limpar filtros".
 * @param {Function} aoMudar - Chamado a cada mudança.
 */
function ligarFiltros(aoMudar) {
    Object.values(IDS_FILTROS).forEach((id) => {
        document.getElementById(id).addEventListener('input', aoMudar);
    });
    document.getElementById('botao-limpar').addEventListener('click', () => {
        Object.values(IDS_FILTROS).forEach((id) => { document.getElementById(id).value = ''; });
        aoMudar();
    });
}

/**
 * Inicia o quadro.
 */
function iniciarQuadro() {
    const { tarefas, frentes } = lerDadosQuadro();
    const atualizar = () => mostrarTarefas(tarefas);
    montarFiltros(tarefas);
    montarContadores(tarefas, atualizar);
    montarFrentes(frentes);
    ligarFiltros(atualizar);
    atualizar();
}

document.addEventListener('DOMContentLoaded', iniciarQuadro);
