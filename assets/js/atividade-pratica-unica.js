// Atividade prática de 1 questão (ATIVIDADE-PRATICA.py): exporta PDF (impressão do navegador,
// igual à tela) e Word (.doc com o mesmo layout, por assets/js/documento-word.js). A resposta
// digitada vai para o PDF e para o Word; sem resposta, saem linhas em branco. Sem banco.

const SELETOR_CAMPO_RESPOSTA = '.resposta__campo';
const SELETOR_IMPRESSAO_RESPOSTA = '.resposta__impressao';
const ALTURA_LINHA_RESPOSTA_MM = 8;
const NOME_LOGO_WORD = 'logo-sesi-senai.png';
const PREFIXO_DATA_URI = /^data:(image\/[a-z]+);base64,/;
const COR_FAIXA_WORD = '#004a99';
const COR_PREENCHER_WORD = '#4a90d9';
const BORDA_WORD = '0.75pt solid #000000';
const FONTE_UC_WORD = "'Times New Roman', serif";
const LINHA_EM_BRANCO_WORD = '_'.repeat(95);
const LARGURAS_CABECALHO_WORD = ['22%', '63%', '15%'];

/**
 * Copia a resposta digitada para o bloco que aparece na impressão (PDF).
 */
function copiarRespostaParaImpressao() {
    const campo = document.querySelector(SELETOR_CAMPO_RESPOSTA);
    const impressao = document.querySelector(SELETOR_IMPRESSAO_RESPOSTA);
    if (!campo || !impressao) return;
    impressao.textContent = campo.value;
    const linhas = Number(impressao.dataset.linhas) || 0;
    impressao.style.minHeight = linhas * ALTURA_LINHA_RESPOSTA_MM + 'mm';
}

/**
 * Exporta o PDF pela impressão do navegador (o aluno escolhe "Salvar como PDF").
 */
function exportarPdf() {
    copiarRespostaParaImpressao();
    window.print();
}

/**
 * Célula do Word com borda e estilo.
 * @param {string} conteudo - HTML da célula.
 * @param {{estilo?: string, atributos?: string, tag?: string}} [opcoes] - Estilo e atributos.
 * @returns {string} HTML da célula.
 */
function celulaWord(conteudo, opcoes = {}) {
    const tag = opcoes.tag || 'td';
    const estilo = `border:${BORDA_WORD};padding:2pt 5pt;vertical-align:top;${opcoes.estilo || ''}`;
    return `<${tag} ${opcoes.atributos || ''} style="${estilo}">${conteudo}</${tag}>`;
}

/**
 * Tabela do Word com largura total e bordas coladas.
 * @param {string} linhasHtml - Linhas <tr>.
 * @returns {string} HTML da tabela.
 */
function tabelaWord(linhasHtml) {
    return '<table style="width:100%;border-collapse:collapse;table-layout:fixed;" ' +
        `cellspacing="0" cellpadding="0">${linhasHtml}</table>`;
}

/**
 * HTML de uma célula da tela, trocando o "preencher" pela cor azul em itálico no Word.
 * @param {HTMLElement} celula - Célula do cabeçalho.
 * @returns {string} HTML para o Word.
 */
function conteudoCampoWord(celula) {
    const copia = celula.cloneNode(true);
    copia.querySelectorAll('.preencher').forEach((marcado) => {
        marcado.setAttribute('style', `color:${COR_PREENCHER_WORD};font-weight:bold;`);
        marcado.removeAttribute('class');
    });
    return copia.innerHTML.trim();
}

/**
 * Cabeçalho SENAI do Word (logo, título, campos e Desempenho), igual à tela.
 * @returns {string} HTML da tabela do cabeçalho.
 */
function montarCabecalhoWord() {
    const titulo = document.querySelector('.cabecalho-senai__titulo').textContent.trim();
    const campos = [...document.querySelectorAll('.cabecalho-senai__campo')];
    const logo = `<img src="${NOME_LOGO_WORD}" width="150" alt="SESI SENAI"><br><br>` +
        '<b>Serviço Nacional de Aprendizagem Industrial</b><br><br>Santa Catarina';
    const colunas = LARGURAS_CABECALHO_WORD.map((largura) => `<col style="width:${largura}">`);
    const linhaTitulo = '<tr>' +
        celulaWord(logo, { atributos: `rowspan="${campos.length + 1}"`,
            estilo: 'text-align:center;vertical-align:middle;' }) +
        celulaWord(`<b>${titulo}</b>`, { estilo: 'text-align:center;font-size:13pt;' }) +
        celulaWord('<b>Desempenho</b>', { estilo: 'text-align:center;' }) + '</tr>';
    const linhasCampos = campos.map((celula, indice) => {
        const ehUc = celula.classList.contains('cabecalho-senai__campo--uc');
        const estilo = ehUc ? `font-family:${FONTE_UC_WORD};font-size:13pt;` : 'font-size:11pt;';
        const celulaNota = celulaWord('', { atributos: `rowspan="${campos.length}"` });
        const nota = indice === 0 ? celulaNota : '';
        return '<tr>' + celulaWord(conteudoCampoWord(celula), { estilo }) + nota + '</tr>';
    });
    return tabelaWord(`<colgroup>${colunas.join('')}</colgroup>` + linhaTitulo +
        linhasCampos.join(''));
}

/**
 * Resposta para o Word: o texto digitado ou linhas em branco.
 * @returns {string} HTML da resposta.
 */
function respostaWord() {
    const campo = document.querySelector(SELETOR_CAMPO_RESPOSTA);
    const texto = campo?.value.trim() || '';
    if (texto) return escaparHtmlWord(texto).replace(/\n/g, '<br>');
    const linhas = Number(document.querySelector(SELETOR_IMPRESSAO_RESPOSTA)?.dataset.linhas) || 0;
    return Array(linhas).fill(LINHA_EM_BRANCO_WORD).join('<br>');
}

/**
 * Questão do Word: faixa ITEM 1, capacidades e Contexto/Comando/resposta.
 * @returns {string} HTML da tabela da questão.
 */
function montarQuestaoWord() {
    const faixa = document.querySelector('.questao__faixa').textContent.trim();
    const capacidades = document.querySelector('.questao__capacidade').innerHTML.trim();
    const corpo = document.querySelector('.questao__corpo').cloneNode(true);
    corpo.querySelectorAll('label, textarea, .resposta__impressao').forEach((el) => el.remove());
    const resposta = `<p><b>Resposta:</b><br>${respostaWord()}</p>`;
    return tabelaWord(
        '<tr>' + celulaWord(faixa, { estilo: `background:${COR_FAIXA_WORD};color:#ffffff;` +
            'font-size:11pt;padding:3pt 6pt;' }) + '</tr>' +
        '<tr>' + celulaWord(capacidades, { estilo: 'font-size:11pt;padding:4pt 6pt 8pt;' }) +
        '</tr>' +
        '<tr>' + celulaWord(corpo.innerHTML.trim() + resposta,
            { estilo: 'font-size:11pt;padding:4pt 6pt 8pt;' }) + '</tr>');
}

/**
 * Logo embutido na página (data URI) como imagem do documento do Word.
 * @returns {{nome: string, tipo: string, base64: string}[]} Imagem do logo ou lista vazia.
 */
function imagensWord() {
    const origem = document.querySelector('.cabecalho-senai__imagem')?.getAttribute('src') || '';
    const tipo = origem.match(PREFIXO_DATA_URI);
    if (!tipo) return [];
    const base64 = origem.replace(PREFIXO_DATA_URI, '');
    return [{ nome: NOME_LOGO_WORD, tipo: tipo[1], base64: quebrarBase64Word(base64) }];
}

/**
 * Exporta o Word (.doc) com o mesmo layout da página.
 */
function exportarWord() {
    const dados = document.body.dataset;
    baixarDocumentoWord({
        titulo: document.title,
        corpoHtml: montarCabecalhoWord() + montarQuestaoWord(),
        rodape: dados.rodape || document.title,
        nomeArquivo: (dados.nomeArquivo || 'atividade-pratica') + '.doc',
        imagens: imagensWord(),
    });
}

/**
 * Liga os botões e mantém a impressão (Ctrl+P) com a resposta atualizada.
 */
function iniciarAtividadePratica() {
    document.getElementById('botao-pdf')?.addEventListener('click', exportarPdf);
    document.getElementById('botao-word')?.addEventListener('click', exportarWord);
    window.addEventListener('beforeprint', copiarRespostaParaImpressao);
    copiarRespostaParaImpressao();
}

document.addEventListener('DOMContentLoaded', iniciarAtividadePratica);
