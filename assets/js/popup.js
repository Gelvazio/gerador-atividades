// Popup (janela modal) no lugar de alert/confirm do navegador. Reutilizável em qualquer página.
// Uso:
//   await mostrarPopup('Texto', { tipo: 'sucesso', titulo: 'Gravado' });   // só "OK"
//   const ok = await confirmarPopup('Texto', { textoConfirmar: 'Entregar' }); // true/false
// Tipos: 'sucesso', 'erro', 'aviso', 'info' e 'pergunta'. O CSS (assets/css/popup.css) é
// carregado sozinho, a partir da pasta deste script. Quebras de linha (\n) são respeitadas.

const CLASSE_POPUP = 'popup';
const ATRASO_FOCO_POPUP_MS = 30;
const TIPOS_POPUP = {
    sucesso: { icone: '✅', titulo: 'Tudo certo' },
    erro: { icone: '❌', titulo: 'Atenção' },
    aviso: { icone: '⚠️', titulo: 'Atenção' },
    info: { icone: 'ℹ️', titulo: 'Aviso' },
    pergunta: { icone: '❓', titulo: 'Confirmação' },
};
const RAIZ_POPUP = document.currentScript ? document.currentScript.src : location.href;

/**
 * Garante que o CSS do popup esteja na página (uma única vez).
 */
function garantirEstiloPopup() {
    if (document.querySelector('link[data-popup]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../css/popup.css', RAIZ_POPUP).href;
    link.dataset.popup = 'sim';
    document.head.appendChild(link);
}

/**
 * Cria um elemento com classe e texto.
 * @param {string} tag - Nome da tag.
 * @param {string} classe - Classe CSS.
 * @param {string} [texto] - Texto do elemento.
 * @returns {HTMLElement} Elemento criado.
 */
function criarElementoPopup(tag, classe, texto) {
    const elemento = document.createElement(tag);
    elemento.className = classe;
    if (texto) elemento.textContent = texto;
    return elemento;
}

/**
 * Monta a estrutura do popup (fundo escuro, caixa, título, mensagem e botões).
 * @param {string} mensagem - Texto do popup.
 * @param {Object} opcoes - tipo, titulo, comCancelar, textoConfirmar e textoCancelar.
 * @returns {{fundo: HTMLElement, confirmar: HTMLButtonElement, cancelar: HTMLButtonElement|null}}
 *     Elementos do popup.
 */
function montarPopup(mensagem, opcoes) {
    const tipo = TIPOS_POPUP[opcoes.tipo] || TIPOS_POPUP.info;
    const fundo = criarElementoPopup('div', CLASSE_POPUP + '__fundo');
    const caixa = criarElementoPopup('div', CLASSE_POPUP + ' ' + CLASSE_POPUP + '--' +
        (opcoes.tipo || 'info'));
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-modal', 'true');
    caixa.appendChild(criarElementoPopup('h2', CLASSE_POPUP + '__titulo',
        tipo.icone + ' ' + (opcoes.titulo || tipo.titulo)));
    caixa.appendChild(criarElementoPopup('p', CLASSE_POPUP + '__mensagem', mensagem));
    const botoes = criarElementoPopup('div', CLASSE_POPUP + '__botoes');
    const cancelar = opcoes.comCancelar
        ? criarElementoPopup('button', CLASSE_POPUP + '__botao ' + CLASSE_POPUP + '__botao--claro',
            opcoes.textoCancelar || 'Cancelar') : null;
    const confirmar = criarElementoPopup('button', CLASSE_POPUP + '__botao',
        opcoes.textoConfirmar || 'OK');
    [cancelar, confirmar].filter(Boolean).forEach((botao) => {
        botao.type = 'button';
        botoes.appendChild(botao);
    });
    caixa.appendChild(botoes);
    fundo.appendChild(caixa);
    return { fundo, confirmar, cancelar };
}

/**
 * Abre o popup e espera a escolha do usuário.
 * @param {string} mensagem - Texto do popup.
 * @param {Object} opcoes - tipo, titulo, comCancelar, textoConfirmar e textoCancelar.
 * @returns {Promise<boolean>} true se confirmou (OK); false se cancelou (botão ou Esc).
 */
function abrirPopup(mensagem, opcoes) {
    garantirEstiloPopup();
    return new Promise((resolver) => {
        const { fundo, confirmar, cancelar } = montarPopup(String(mensagem), opcoes);
        const focoAnterior = document.activeElement;
        const fechar = (resultado) => {
            document.removeEventListener('keydown', aoTeclar, true);
            fundo.remove();
            if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
            resolver(resultado);
        };
        const aoTeclar = (evento) => {
            if (evento.key !== 'Escape') return;
            evento.preventDefault();
            fechar(false);
        };
        confirmar.addEventListener('click', () => fechar(true));
        if (cancelar) cancelar.addEventListener('click', () => fechar(false));
        document.addEventListener('keydown', aoTeclar, true);
        document.body.appendChild(fundo);
        setTimeout(() => confirmar.focus(), ATRASO_FOCO_POPUP_MS);
    });
}

/**
 * Mostra um aviso em popup (só o botão OK), no lugar de alert().
 * @param {string} mensagem - Texto do popup.
 * @param {{tipo?: string, titulo?: string, textoConfirmar?: string}} [opcoes] - Aparência.
 * @returns {Promise<void>} Resolve quando o usuário fecha o popup.
 */
async function mostrarPopup(mensagem, opcoes) {
    await abrirPopup(mensagem, { ...(opcoes || {}), comCancelar: false });
}

/**
 * Pergunta em popup (botões de confirmar e cancelar), no lugar de confirm().
 * @param {string} mensagem - Texto do popup.
 * @param {{tipo?: string, titulo?: string, textoConfirmar?: string, textoCancelar?: string}}
 *     [opcoes] - Aparência e textos dos botões.
 * @returns {Promise<boolean>} true se o usuário confirmou.
 */
function confirmarPopup(mensagem, opcoes) {
    return abrirPopup(mensagem, { tipo: 'pergunta', ...(opcoes || {}), comCancelar: true });
}
