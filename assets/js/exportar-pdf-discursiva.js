// Botão "📥 Exportar PDF" nas avaliações/atividades DISCURSIVAS, no padrão SENAI das atividades
// objetivas (assets/js/atividade.js): cabeçalho SENAI em tabela (ATIVIDADE AVALIATIVA,
// Desempenho, Data, Docente, Unidade Curricular, Turma, Estudante), quadro CAPACIDADES, uma tabela
// por questão (cabeçalho cinza; capacidade, contexto e comando; cada tópico com os pontos e o espaço
// da resposta) e rodapé "Página X de Y". A resposta já digitada pelo aluno logado entra no PDF; sem
// resposta, ficam linhas em branco. A turma vem da lista "Turma" (assets/js/turma-exportacao.js).
// Nada de padrão de resposta no PDF. Carregado pelo assets/js/avaliacao-discursiva.js.
// PDF compacto (<body data-pdf-compacto="sim">, campo "PDF compacto: sim" da fonte): fonte e
// espaços menores, sem a linha "Aula" e a caixa de capacidade de cada questão (ficam no quadro
// CAPACIDADES) e rótulo junto do texto, para caber em menos folhas. PDF sem respostas
// (<body data-pdf-sem-respostas="sim">): o PDF sai sem as caixas de resposta e com a instrução
// de responder no caderno (a página continua com os campos). Sem os atributos, nada muda.

const URL_JSPDF_DISCURSIVA = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const URL_AUTOTABLE_DISCURSIVA =
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
const ARQUIVO_TURMA_DISCURSIVA = 'turma-exportacao.js';
const ARQUIVO_TURMA_UNIDADE_DISCURSIVA = 'unidade.js';
const BASE_SCRIPTS_PDF_DISCURSIVA = document.currentScript?.src.replace(/[^/]*$/, '') || '';
const TURMA_EM_BRANCO_DISCURSIVA = '___________________';
const MARGEM_PDF_DISCURSIVA = 15;
const COR_SENAI_PDF_DISCURSIVA = [0, 51, 153];
const COR_CINZA_PDF_DISCURSIVA = [240, 240, 240];
const COR_QUESTAO_PDF_DISCURSIVA = [220, 220, 220];
const COR_FAIXA_CAPACIDADES_DISCURSIVA = [31, 56, 100];
const COR_AVISO_PDF_DISCURSIVA = [197, 48, 48];
const ALTURA_RESPOSTA_VAZIA_MM = 24;
const ESTILO_TABELA_PDF_DISCURSIVA = { fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0],
    lineWidth: 0.1, textColor: [0, 0, 0] };
const VALOR_SIM_PDF_DISCURSIVA = 'sim';
const INSTRUCAO_CADERNO_DISCURSIVA =
    'RESPONDA TODAS AS QUESTÕES NO CADERNO, indicando o número do item (ex.: ITEM 01).';
const ROTULO_CAPACIDADE_DISCURSIVA = 'CAPACIDADE';
const CONFIG_PDF_NORMAL_DISCURSIVA = { estilo: ESTILO_TABELA_PDF_DISCURSIVA,
    paddingCabecalho: 4, alturaRespostaVazia: ALTURA_RESPOSTA_VAZIA_MM, tamanhoTitulo: 11,
    tamanhoDestaque: 11, espacoBlocos: 8, espacoQuestoes: 6, compacto: false };
const CONFIG_PDF_COMPACTO_DISCURSIVA = {
    estilo: { ...ESTILO_TABELA_PDF_DISCURSIVA, fontSize: 8, cellPadding: 1.2 },
    paddingCabecalho: 1.5, alturaRespostaVazia: 12, tamanhoTitulo: 9, tamanhoDestaque: 9,
    espacoBlocos: 3, espacoQuestoes: 2, compacto: true };

/**
 * Deixa o texto compatível com a fonte padrão do jsPDF (Latin-1): troca símbolos, tira emojis.
 * @param {string} texto - Texto original.
 * @returns {string} Texto limpo.
 */
function textoPdfDiscursiva(texto) {
    return (texto || '')
        .replace(/→/g, '->').replace(/×/g, 'x').replace(/≥/g, '>=').replace(/≤/g, '<=')
        .replace(/÷/g, '/').replace(/−/g, '-').replace(/≈/g, '~').replace(/³/g, '3')
        .replace(/[^\x00-\xFF—–“”‘’•…\n]/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim();
}

/**
 * Carrega um script externo uma vez.
 * @param {string} endereco - URL do script.
 * @returns {Promise<void>} Resolve quando carregou.
 */
function carregarScriptPdfDiscursiva(endereco) {
    return new Promise((resolver, rejeitar) => {
        const script = document.createElement('script');
        script.src = endereco;
        script.onload = () => resolver();
        script.onerror = () => rejeitar(new Error('Não foi possível carregar ' + endereco));
        document.head.appendChild(script);
    });
}

/**
 * Garante o jsPDF e o autoTable na página.
 * @returns {Promise<Function>} Construtor do jsPDF.
 */
async function garantirJsPdfDiscursiva() {
    if (!(window.jspdf?.jsPDF || window.jsPDF)) await carregarScriptPdfDiscursiva(URL_JSPDF_DISCURSIVA);
    const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
    if (!jsPDF.API.autoTable) await carregarScriptPdfDiscursiva(URL_AUTOTABLE_DISCURSIVA);
    return jsPDF;
}

/**
 * Lê os dados do cabeçalho: título (h1 sem emoji), UC, docente (professor logado ou da página).
 * @returns {Promise<{titulo: string, uc: string, ucCurta: string, docente: string, total: string}>}
 */
async function dadosCabecalhoDiscursiva() {
    const dados = document.body.dataset;
    let docente = dados.docente || '';
    const cliente = typeof obterClienteSupabase === 'function' ? obterClienteSupabase() : null;
    if (cliente) {
        const { data } = await cliente.auth.getSession();
        const usuario = data?.session?.user;
        if (usuario?.app_metadata?.perfil === 'PROFESSOR') {
            docente = usuario.user_metadata?.nome || usuario.email || docente;
        }
    }
    return { titulo: textoPdfDiscursiva(document.querySelector('header h1')?.textContent),
        uc: dados.uc || '', ucCurta: dados.ucCurta || dados.uc || '', docente,
        total: dados.total || '' };
}

/**
 * Turma do PDF: a escolhida na lista "Turma" (professor) ou em branco.
 * @returns {Promise<string|null>} Turma; null = exportação cancelada.
 */
async function turmaPdfDiscursiva() {
    if (typeof obterTurmaParaExportacao !== 'function') return TURMA_EM_BRANCO_DISCURSIVA;
    return obterTurmaParaExportacao();
}

/**
 * Escolhe o layout do PDF: compacto quando a página pede (data-pdf-compacto="sim").
 * @returns {Object} Configuração do layout (estilo, alturas e espaços).
 */
function configuracaoPdfDiscursiva() {
    const dados = document.body.dataset;
    const ehCompacto = dados.pdfCompacto === VALOR_SIM_PDF_DISCURSIVA;
    const base = ehCompacto ? CONFIG_PDF_COMPACTO_DISCURSIVA : CONFIG_PDF_NORMAL_DISCURSIVA;
    return { ...base, semRespostas: dados.pdfSemRespostas === VALOR_SIM_PDF_DISCURSIVA };
}

/**
 * Desenha a instrução de responder no caderno (só no PDF sem caixas de resposta).
 * @param {Object} doc - Documento jsPDF.
 * @param {number} yPos - Posição inicial.
 * @param {Object} config - Layout do PDF.
 * @returns {number} Posição Y depois da instrução.
 */
function desenharInstrucaoCadernoDiscursiva(doc, yPos, config) {
    if (!config.semRespostas) return yPos;

    doc.autoTable({
        body: [[{ content: textoPdfDiscursiva(INSTRUCAO_CADERNO_DISCURSIVA),
            styles: { fontStyle: 'bold', fontSize: config.tamanhoDestaque, halign: 'center' } }]],
        startY: yPos,
        margin: MARGEM_PDF_DISCURSIVA,
        styles: config.estilo,
    });
    return doc.lastAutoTable.finalY + config.espacoBlocos;
}

/**
 * Desenha o cabeçalho SENAI (mesmo layout das atividades objetivas).
 * @param {Object} doc - Documento jsPDF.
 * @param {{cabecalho: Object, turma: string, config: Object}} dados - Cabeçalho, turma e layout.
 * @returns {number} Posição Y depois do cabeçalho.
 */
function desenharCabecalhoDiscursiva(doc, { cabecalho, turma, config }) {
    const cinza = { fontStyle: 'bold', halign: 'center', fillColor: COR_CINZA_PDF_DISCURSIVA };
    doc.autoTable({
        body: [
            [{ content: 'SENAI\nServiço Nacional de Aprendizagem Industrial\nSanta Catarina', colSpan: 2,
                styles: { fontStyle: 'bold', halign: 'center', fillColor: COR_SENAI_PDF_DISCURSIVA,
                    textColor: [255, 255, 255] } },
            { content: 'ATIVIDADE AVALIATIVA', styles: { ...cinza, fontSize: config.tamanhoDestaque } },
            { content: 'Desempenho', styles: cinza }],
            [{ content: (cabecalho.titulo + ' (' + cabecalho.total + ' ITENS)').toUpperCase(),
                colSpan: 4, styles: { fontStyle: 'bold' } }],
            [{ content: 'Data: ___/___/___' }, { content: '' }, { content: '' }, { content: '' }],
            [{ content: textoPdfDiscursiva('Docente: ' + cabecalho.docente.toUpperCase()), colSpan: 2,
                styles: { fontStyle: 'bold' } }, { content: '' }, { content: '' }],
            [{ content: textoPdfDiscursiva('Unidade Curricular: ' + cabecalho.uc), colSpan: 2 },
                { content: textoPdfDiscursiva('Turma: ' + turma), colSpan: 2 }],
            [{ content: 'Estudante: ___________________________________________________', colSpan: 4 }],
        ],
        startY: config.compacto ? MARGEM_PDF_DISCURSIVA : 20,
        margin: MARGEM_PDF_DISCURSIVA,
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 60 }, 2: { cellWidth: 60 },
            3: { cellWidth: 30 } },
        styles: { ...config.estilo, cellPadding: config.paddingCabecalho },
    });
    return doc.lastAutoTable.finalY + config.espacoBlocos;
}

/**
 * Desenha o aviso em destaque da página (caixa .aviso-atividade), quando existir.
 * @param {Object} doc - Documento jsPDF.
 * @param {number} yPos - Posição inicial.
 * @param {Object} config - Layout do PDF.
 * @returns {number} Posição Y depois do aviso.
 */
function desenharAvisoDiscursiva(doc, yPos, config) {
    const aviso = textoPdfDiscursiva(document.querySelector('.aviso-atividade')?.textContent);
    if (!aviso) return yPos;

    doc.autoTable({
        body: [[{ content: aviso, styles: { fontStyle: 'bold', fontSize: config.tamanhoDestaque,
            halign: 'center', textColor: COR_AVISO_PDF_DISCURSIVA, lineColor: COR_AVISO_PDF_DISCURSIVA,
            lineWidth: 0.6 } }]],
        startY: yPos,
        margin: MARGEM_PDF_DISCURSIVA,
        styles: config.estilo,
    });
    return doc.lastAutoTable.finalY + config.espacoBlocos;
}

/**
 * Desenha o quadro CAPACIDADES (linhas do quadro da página).
 * @param {Object} doc - Documento jsPDF.
 * @param {number} yPos - Posição inicial.
 * @param {Object} config - Layout do PDF.
 * @returns {number} Posição Y depois do quadro.
 */
function desenharCapacidadesDiscursiva(doc, yPos, config) {
    const linhas = [...document.querySelectorAll('.quadro-capacidades__linha')]
        .map((linha) => textoPdfDiscursiva(linha.textContent));
    if (!linhas.length) return yPos;

    doc.autoTable({
        body: [[{ content: 'CAPACIDADES', styles: { fontStyle: 'bold',
            fontSize: config.tamanhoTitulo + 1, halign: 'center',
            fillColor: COR_FAIXA_CAPACIDADES_DISCURSIVA, textColor: [255, 255, 255] } }],
        ...linhas.map((linha) => [linha])],
        startY: yPos,
        margin: MARGEM_PDF_DISCURSIVA,
        styles: config.estilo,
    });
    return doc.lastAutoTable.finalY + config.espacoBlocos;
}

/**
 * Diz se a caixa é a da capacidade da questão (no PDF compacto ela sai: o quadro CAPACIDADES
 * do início já lista todas).
 * @param {HTMLElement} caixa - Caixa .content-box.
 * @returns {boolean} true quando o rótulo começa por "CAPACIDADE".
 */
function ehCaixaCapacidadeDiscursiva(caixa) {
    const rotulo = textoPdfDiscursiva(caixa.querySelector('.content-label')?.textContent);
    return rotulo.toUpperCase().startsWith(ROTULO_CAPACIDADE_DISCURSIVA);
}

/**
 * Linhas de uma caixa da questão (capacidade, contexto ou comando): rótulo e texto.
 * @param {HTMLElement} caixa - Caixa .content-box.
 * @param {Object} config - Layout do PDF (no compacto, rótulo e texto ficam na mesma linha).
 * @returns {Array<Array<Object>>} Linhas da tabela.
 */
function linhasDaCaixaDiscursiva(caixa, config) {
    const rotulo = textoPdfDiscursiva(caixa.querySelector('.content-label')?.textContent);
    const texto = textoPdfDiscursiva(caixa.querySelector('.content-text')?.textContent);
    if (config.compacto) return [[rotulo + ': ' + texto]];
    return [[{ content: rotulo + ':', styles: { fontStyle: 'bold' } }], [texto]];
}

/**
 * Lê uma questão da página: cabeçalho, caixas (capacidade, contexto, comando) e tópicos.
 * @param {HTMLElement} secao - Seção da questão.
 * @param {Object} config - Layout do PDF.
 * @returns {Array<Array<Object>>} Linhas da tabela da questão.
 */
function linhasDaQuestaoDiscursiva(secao, config) {
    const titulo = textoPdfDiscursiva(secao.querySelector('.aula-badge')?.textContent) + ' — ' +
        textoPdfDiscursiva(secao.querySelector('.aula-title')?.textContent);
    const linhas = [[{ content: titulo, styles: { fontStyle: 'bold', fontSize: config.tamanhoTitulo,
        fillColor: COR_QUESTAO_PDF_DISCURSIVA } }]];
    const aula = textoPdfDiscursiva(secao.querySelector('.questao-discursiva__aula')?.textContent);
    if (aula && !config.compacto) linhas.push([{ content: aula, styles: { fontStyle: 'italic' } }]);
    secao.querySelectorAll(':scope > .content-box').forEach((caixa) => {
        if (config.compacto && ehCaixaCapacidadeDiscursiva(caixa)) return;
        linhas.push(...linhasDaCaixaDiscursiva(caixa, config));
    });
    secao.querySelectorAll('.topico-resposta').forEach((topico) => {
        linhas.push(...linhasDoTopicoDiscursiva(topico, config));
    });
    return linhas;
}

/**
 * Linhas de um tópico: enunciado com os pontos e a resposta (ou espaço em branco).
 * @param {HTMLElement} topico - Bloco do tópico.
 * @param {Object} config - Layout do PDF.
 * @returns {Array<Array<Object>>} Linhas da tabela (sem a resposta no PDF sem respostas).
 */
function linhasDoTopicoDiscursiva(topico, config) {
    const rotulo = textoPdfDiscursiva(topico.querySelector('.topico-resposta__rotulo')?.textContent);
    const linhaRotulo = [{ content: rotulo, styles: { fontStyle: 'bold' } }];
    if (config.semRespostas) return [linhaRotulo];
    const resposta = textoPdfDiscursiva(topico.querySelector('.topico-resposta__campo')?.value);
    const celulaResposta = resposta
        ? { content: 'Resposta: ' + resposta }
        : { content: 'Resposta:', styles: { minCellHeight: config.alturaRespostaVazia } };
    return [linhaRotulo, [celulaResposta]];
}

/**
 * Escreve o rodapé "Página X de Y" em todas as páginas.
 * @param {Object} doc - Documento jsPDF.
 * @param {Object} cabecalho - Dados do cabeçalho.
 */
function escreverRodapeDiscursiva(doc, cabecalho) {
    const total = doc.getNumberOfPages();
    for (let pagina = 1; pagina <= total; pagina++) {
        doc.setPage(pagina);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(textoPdfDiscursiva(cabecalho.titulo + ' · ' + cabecalho.ucCurta + ' · SENAI · Página ' +
            pagina + ' de ' + total), 105, 290, { align: 'center' });
    }
}

/**
 * Gera e baixa o PDF da avaliação discursiva.
 */
async function exportarPdfDiscursiva() {
    try {
        const jsPDF = await garantirJsPdfDiscursiva();
        const turma = await turmaPdfDiscursiva();
        if (turma === null) return;

        const cabecalho = await dadosCabecalhoDiscursiva();
        const config = configuracaoPdfDiscursiva();
        const doc = new jsPDF('p', 'mm', 'a4');
        let yPos = desenharCabecalhoDiscursiva(doc, { cabecalho, turma, config });
        yPos = desenharAvisoDiscursiva(doc, yPos, config);
        yPos = desenharInstrucaoCadernoDiscursiva(doc, yPos, config);
        yPos = desenharCapacidadesDiscursiva(doc, yPos, config);
        document.querySelectorAll('.questao-discursiva').forEach((secao) => {
            doc.autoTable({ body: linhasDaQuestaoDiscursiva(secao, config), startY: yPos,
                margin: MARGEM_PDF_DISCURSIVA, pageBreak: 'auto', rowPageBreak: 'avoid',
                styles: config.estilo });
            yPos = doc.lastAutoTable.finalY + config.espacoQuestoes;
        });
        escreverRodapeDiscursiva(doc, cabecalho);
        doc.save(cabecalho.titulo.replace(/[^\w-]+/g, '-').replace(/-+/g, '-') + '.pdf');
    } catch (erro) {
        const aviso = 'Não foi possível gerar o PDF: ' + erro.message;
        if (typeof window.mostrarPopup === 'function') await mostrarPopup(aviso, { tipo: 'erro' });
        else console.warn(aviso);
    }
}

/**
 * Coloca a barra de exportação (com o botão) no início do conteúdo e carrega a lista "Turma".
 */
function montarBarraPdfDiscursiva() {
    const conteudo = document.querySelector('main');
    if (!conteudo || document.querySelector('.export-bar')) return;

    const barra = document.createElement('div');
    barra.className = 'export-bar';
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-export';
    botao.textContent = '📥 Exportar PDF';
    botao.addEventListener('click', exportarPdfDiscursiva);
    barra.append(botao);
    conteudo.prepend(barra);
    if (typeof obterTurmaParaExportacao !== 'function' && BASE_SCRIPTS_PDF_DISCURSIVA) {
        carregarScriptPdfDiscursiva(BASE_SCRIPTS_PDF_DISCURSIVA + ARQUIVO_TURMA_UNIDADE_DISCURSIVA)
            .then(() => carregarScriptPdfDiscursiva(
                BASE_SCRIPTS_PDF_DISCURSIVA + ARQUIVO_TURMA_DISCURSIVA))
            .catch((erro) => console.warn(erro.message));
    }
}

window.montarBarraPdfDiscursiva = montarBarraPdfDiscursiva;
