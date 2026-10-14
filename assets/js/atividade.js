// Exportação em PDF das páginas de atividade (genérico para todas as aulas).
// Dados de cada página: atributos data-aula, data-tema, data-total, data-uc,
// data-uc-curta e data-docente no <body>
// e o gabarito em <script type="application/json" id="gabarito-dados">.
// O docente do PDF é o professor logado; o data-docente só vale quando não há professor logado.
// A turma do PDF vem da lista "Turma" da .export-bar (assets/js/turma-exportacao.js, carregado
// aqui): professor com 1 turma já vem escolhida; com várias, ele escolhe antes de exportar.
// E o assets/js/documento-word.js + assets/js/exportar-word.js (hoje sem botões de Word).
// Toda atividade com folha de respostas no banco (body data-login="sim") ganha o botão
// "🔑 Exportar Gabarito" (assets/js/avaliacao-pdf-professor.js): o aluno só recebe o gabarito
// depois que o professor liberar para a turma (plano docs/liberacao-respostas-por-turma.md).

const ARQUIVO_TURMA_EXPORTACAO = 'turma-exportacao.js';
const ARQUIVO_TURMA_UNIDADE = 'unidade.js';
const ARQUIVO_DOCUMENTO_WORD = 'documento-word.js';
const ARQUIVO_EXPORTAR_WORD = 'exportar-word.js';
const ARQUIVO_EXPORTAR_GABARITO = 'avaliacao-pdf-professor.js';
const ID_BOTAO_EXPORTAR_GABARITO = 'btnExportarGabarito';
const TEXTO_BOTAO_EXPORTAR_GABARITO = '🔑 Exportar Gabarito';
const ORIGEM_ATIVIDADE_JS = document.currentScript?.src || '';
const TURMA_EM_BRANCO_ATIVIDADE_PDF = '___________________';
const MSG_JSPDF_NAO_CARREGADO = 'Erro: jsPDF não carregado (verifique a conexão com a internet).';

/**
 * Carrega um script da barra de exportação que fica em assets/js/, ao lado deste.
 * @param {string} arquivo - Nome do script.
 * @param {boolean} jaCarregado - true quando o script já está na página (não carrega de novo).
 */
function carregarModuloExportacao(arquivo, jaCarregado) {
    if (!ORIGEM_ATIVIDADE_JS || jaCarregado) return;

    const script = document.createElement('script');
    script.src = ORIGEM_ATIVIDADE_JS.replace(/[^/]*$/, arquivo);
    // Mantém a ordem de carregamento (o exportar-word.js depende do documento-word.js)
    script.async = false;
    document.head.append(script);
}

carregarModuloExportacao(ARQUIVO_TURMA_UNIDADE, typeof acrescentarUnidadeTurma === 'function');
carregarModuloExportacao(ARQUIVO_TURMA_EXPORTACAO, typeof obterTurmaParaExportacao === 'function');
carregarModuloExportacao(ARQUIVO_DOCUMENTO_WORD, typeof baixarDocumentoWord === 'function');
carregarModuloExportacao(ARQUIVO_EXPORTAR_WORD, typeof exportarWordAtividade === 'function');

/**
 * Acrescenta o botão "Exportar Gabarito" às atividades com folha de respostas no banco que ainda
 * não o têm e carrega o script que o liga (a liberação para o aluno é decidida no banco).
 */
function incluirBotaoExportarGabarito() {
    const barra = document.querySelector('.export-bar');
    const temFolhaNoBanco = document.body?.dataset.login === 'sim';
    if (!barra || !temFolhaNoBanco || document.getElementById(ID_BOTAO_EXPORTAR_GABARITO)) return;

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-export';
    botao.id = ID_BOTAO_EXPORTAR_GABARITO;
    botao.hidden = true;
    botao.textContent = TEXTO_BOTAO_EXPORTAR_GABARITO;
    barra.append(botao);
    carregarModuloExportacao(ARQUIVO_EXPORTAR_GABARITO,
        typeof exportarGabaritoPorPerfil === 'function');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', incluirBotaoExportarGabarito);
} else {
    incluirBotaoExportarGabarito();
}

/**
 * Avisa um erro da exportação em popup (popup.js); sem ele, registra no console.
 * @param {string} texto - Mensagem.
 */
async function avisarErroExportacaoAtividade(texto) {
    if (typeof window.mostrarPopup === 'function') {
        await window.mostrarPopup(texto, { tipo: 'erro' });
        return;
    }
    console.warn(texto);
}

/**
 * Turma do PDF; sem o módulo de turmas carregado, o campo fica em branco.
 * @returns {Promise<string|null>} Texto da turma, linha em branco ou null (exportação cancelada).
 */
async function turmaDoPDF() {
    if (typeof obterTurmaParaExportacao !== 'function') return TURMA_EM_BRANCO_ATIVIDADE_PDF;
    return obterTurmaParaExportacao();
}

function textoPDF(txt) {
    // A fonte padrão do jsPDF só aceita Latin-1/WinAnsi: troca símbolos e remove emojis
    return (txt || '')
        .replace(/→/g, '->').replace(/⇄/g, '<->').replace(/×/g, 'x').replace(/≥/g, '>=').replace(/≤/g, '<=')
        .replace(/[^\x00-\xFF—–“”‘’•…]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function dadosDaPagina() {
    const d = document.body.dataset;
    const gabaritoEl = document.getElementById('gabarito-dados');
    return {
        aula: d.aula || '',
        tema: d.tema || '',
        total: d.total || '',
        uc: d.uc || '',
        ucCurta: d.ucCurta || d.uc || '',
        docente: d.docente || '',
        gabarito: gabaritoEl ? JSON.parse(gabaritoEl.textContent) : []
    };
}

const PERFIL_DOCENTE_LOGADO_PDF = 'PROFESSOR';

/**
 * Nome do docente logado (perfil PROFESSOR no app_metadata) para o cabeçalho do PDF.
 * Usa o cliente de js/supabase.js (carregado pela página ou pelo js/header-usuario.js).
 * @returns {Promise<string|null>} Nome (ou e-mail) do professor logado; null se não houver.
 */
async function obterDocenteLogadoPDF() {
    if (typeof obterClienteSupabase !== 'function') return null;
    try {
        const cliente = await obterClienteSupabase();
        const { data } = await cliente.auth.getSession();
        const usuario = data?.session?.user;
        if (usuario?.app_metadata?.perfil !== PERFIL_DOCENTE_LOGADO_PDF) return null;
        return usuario.user_metadata?.nome || usuario.email || null;
    } catch (erro) {
        console.warn('Não foi possível ler o docente logado:', erro);
        return null;
    }
}

/**
 * Dados da página com o docente do PDF: o professor logado ou, sem ele, o data-docente da página.
 * @returns {Promise<Object>} Mesmo formato de dadosDaPagina().
 */
async function dadosDaPaginaParaPDF() {
    const pagina = dadosDaPagina();
    pagina.docente = (await obterDocenteLogadoPDF()) || pagina.docente;
    return pagina;
}

const COR_FAIXA_CAPACIDADES_PDF = [31, 56, 100];
const COR_TEXTO_FAIXA_CAPACIDADES_PDF = [255, 255, 255];

/**
 * Lê as linhas "C1 — texto" de um quadro de capacidades (assets/css/capacidades.css).
 * @param {Element|null} quadro - Elemento .quadro-capacidades ou null.
 * @returns {string[]} Linhas prontas para o PDF (vazia se não houver quadro).
 */
function lerLinhasCapacidadesPDF(quadro) {
    if (!quadro) return [];
    return [...quadro.querySelectorAll('.quadro-capacidades__linha')]
        .map((linha) => textoPDF(linha.textContent));
}

/**
 * Desenha no PDF o quadro "CAPACIDADES" do início da avaliação (faixa azul e uma linha por
 * capacidade), como na página. Sem quadro na página, não desenha nada.
 * @param {Object} doc - Documento jsPDF.
 * @param {number} yPos - Posição vertical atual.
 * @param {number} margin - Margem da página.
 * @returns {number} Nova posição vertical.
 */
function desenharCapacidadesPDF(doc, yPos, margin) {
    const quadro = [...document.querySelectorAll('.quadro-capacidades')]
        .find((elemento) => !elemento.closest('.questao'));
    const linhas = lerLinhasCapacidadesPDF(quadro);
    if (!linhas.length) return yPos;

    doc.autoTable({
        head: [['CAPACIDADES']],
        body: linhas.map((linha) => [linha]),
        startY: yPos,
        margin: margin,
        headStyles: { fillColor: COR_FAIXA_CAPACIDADES_PDF, textColor: COR_TEXTO_FAIXA_CAPACIDADES_PDF,
            fontStyle: 'bold', fontSize: 12 },
        styles: { fontSize: 10, cellPadding: 2.5, textColor: [0, 0, 0] }
    });
    return doc.lastAutoTable.finalY + 10;
}

const TAMANHO_FONTE_QUESTAO_PDF = 10;
const ALTURA_LINHA_PDF = 1.15;
const ESPACO_INTERNO_QUESTAO_PDF = 3;

/**
 * Quebra o texto em linhas: a primeira divide espaço com o rótulo em negrito.
 * @param {Object} doc - Documento jsPDF.
 * @param {{rotulo: string, texto: string}} celula - Rótulo e texto da célula.
 * @param {number} largura - Largura útil da célula (mm).
 * @returns {string[]} Linhas do texto (sem o rótulo).
 */
function quebrarTextoComRotuloPDF(doc, { rotulo, texto }, largura) {
    doc.setFontSize(TAMANHO_FONTE_QUESTAO_PDF);
    doc.setFont(undefined, 'bold');
    let usado = doc.getTextWidth(rotulo + ' ');
    doc.setFont(undefined, 'normal');
    const linhas = [];
    let atual = '';
    texto.split(' ').forEach((palavra) => {
        const tentativa = atual ? atual + ' ' + palavra : palavra;
        const passou = usado + doc.getTextWidth(tentativa) > largura;
        if (!passou || !atual) {
            atual = tentativa;
            return;
        }
        linhas.push(atual);
        atual = palavra;
        usado = 0;
    });
    linhas.push(atual);
    return linhas;
}

/**
 * Escreve na célula o rótulo em negrito e, na mesma linha, o texto normal (com quebras).
 * @param {Object} doc - Documento jsPDF.
 * @param {Object} celula - Célula do jspdf-autotable (raw com rotulo e linhasPDF).
 */
function escreverRotuloNegritoPDF(doc, celula) {
    const { rotulo, linhasPDF } = celula.raw;
    const x = celula.x + celula.padding('left');
    let y = celula.y + celula.padding('top');
    const passo = (TAMANHO_FONTE_QUESTAO_PDF * ALTURA_LINHA_PDF) / doc.internal.scaleFactor;
    doc.setFontSize(TAMANHO_FONTE_QUESTAO_PDF);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(rotulo, x, y, { baseline: 'top' });
    const recuo = doc.getTextWidth(rotulo + ' ');
    doc.setFont(undefined, 'normal');
    linhasPDF.forEach((linha, indice) => {
        doc.text(linha, indice === 0 ? x + recuo : x, y, { baseline: 'top' });
        y += passo;
    });
}

/**
 * Ganchos do jspdf-autotable para as células "RÓTULO: texto" (rótulo em negrito na mesma linha).
 * @param {Object} doc - Documento jsPDF.
 * @param {number} margin - Margem da página (mm).
 * @returns {Object} didParseCell, willDrawCell e didDrawCell.
 */
function ganchosRotuloNegritoPDF(doc, margin) {
    const largura = doc.internal.pageSize.getWidth() - 2 * margin - 2 * ESPACO_INTERNO_QUESTAO_PDF;
    return {
        didParseCell: (dados) => {
            const raw = dados.cell.raw;
            if (!raw?.rotulo) return;
            raw.linhasPDF = quebrarTextoComRotuloPDF(doc, raw, largura);
            dados.cell.text = raw.linhasPDF.map((linha, i) => (i === 0 ? raw.rotulo + ' ' + linha : linha));
        },
        willDrawCell: (dados) => { if (dados.cell.raw?.rotulo) dados.cell.text = []; },
        didDrawCell: (dados) => { if (dados.cell.raw?.rotulo) escreverRotuloNegritoPDF(doc, dados.cell); }
    };
}

function coletarQuestoes() {
    const questoes = [];
    document.querySelectorAll('.aula-card.questao').forEach(card => {
        const linhas = [];
        card.querySelectorAll('.content-box').forEach(box => {
            const rotulo = textoPDF(box.querySelector('.content-label')?.textContent);
            const itens = box.querySelectorAll('.alternativas li');
            if (itens.length) {
                linhas.push({ texto: rotulo + ':', negrito: true });
                itens.forEach(li => linhas.push({ texto: textoPDF(li.textContent), negrito: false }));
            } else {
                // Subtítulo (CAPACIDADE, CONTEXTO, COMANDO) em negrito na mesma linha do texto
                linhas.push({ rotulo: rotulo + ':', texto: textoPDF(box.querySelector('.content-text')?.textContent) });
            }
        });
        questoes.push({
            cabecalho: textoPDF(card.querySelector('.aula-badge')?.textContent) + ' — ' +
                       textoPDF(card.querySelector('.aula-title')?.textContent),
            linhas: linhas
        });
    });
    return questoes;
}

/**
 * Rótulo da aula ou avaliação para o PDF ("AULA 05" ou "AVALIAÇÃO 01").
 * @param {string} aula - Valor de data-aula ("05" ou "AV-01").
 * @returns {string} Rótulo em maiúsculas.
 */
function rotuloDaAula(aula) {
    return /^AV-/.test(aula) ? 'AVALIAÇÃO ' + aula.slice(3) : 'AULA ' + aula;
}

/**
 * Exporta a atividade em PDF.
 * @param {string[][]} [gabaritoExterno] - Linhas [item, título, letra] vindas do banco (só
 *     professor); quando informado, o PDF inclui o gabarito.
 */
async function exportarPDFAtividade(gabaritoExterno) {
    const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
    if (!jsPDF) {
        await avisarErroExportacaoAtividade(MSG_JSPDF_NAO_CARREGADO);
        return;
    }

    const turma = await turmaDoPDF();
    if (turma === null) return;

    const pagina = await dadosDaPaginaParaPDF();
    const questoes = coletarQuestoes();
    if (gabaritoExterno) pagina.gabarito = gabaritoExterno;
    const incluirGabarito = Boolean(gabaritoExterno) || document.getElementById('incluirGabarito')?.checked;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    let yPos = 20;

    const headerData = [
        [
            { content: 'SENAI\nServiço Nacional de Aprendizagem Industrial\nSanta Catarina',
              styles: { fontStyle: 'bold', fontSize: 10, halign: 'center', fillColor: [0, 51, 153], textColor: [255, 255, 255] }, colSpan: 2 },
            { content: 'ATIVIDADE AVALIATIVA', styles: { fontStyle: 'bold', fontSize: 11, halign: 'center', fillColor: [240, 240, 240] } },
            { content: 'Desempenho', styles: { fontStyle: 'bold', fontSize: 10, halign: 'center', fillColor: [240, 240, 240] } }
        ],
        [ { content: textoPDF(rotuloDaAula(pagina.aula) + ' — ' + pagina.tema.toUpperCase() + ' (' + pagina.total + ' ITENS)'), styles: { fontSize: 10, fontStyle: 'bold' }, colSpan: 4 } ],
        [ { content: 'Data: ___/___/___', styles: { fontSize: 10 } }, { content: '' }, { content: '' }, { content: '' } ],
        [ { content: 'Docente: ' + pagina.docente.toUpperCase(), styles: { fontSize: 10, fontStyle: 'bold' }, colSpan: 2 }, { content: '' }, { content: '' } ],
        [ { content: 'Unidade Curricular: ' + pagina.uc, styles: { fontSize: 10 }, colSpan: 2 },
          { content: textoPDF('Turma: ' + turma), styles: { fontSize: 10 }, colSpan: 2 } ],
        [ { content: 'Estudante: ___________________________________________________', styles: { fontSize: 10 }, colSpan: 4 } ]
    ];

    doc.autoTable({
        body: headerData,
        startY: yPos,
        margin: margin,
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 60 }, 2: { cellWidth: 60 }, 3: { cellWidth: 30 } },
        styles: { fontSize: 10, cellPadding: 4, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] }
    });
    yPos = desenharCapacidadesPDF(doc, doc.lastAutoTable.finalY + 10, margin);

    questoes.forEach(q => {
        const tableData = [[{ content: q.cabecalho, styles: { fontStyle: 'bold', fontSize: 11, halign: 'left', fillColor: [220, 220, 220] } }]];
        q.linhas.forEach(l => {
            tableData.push([{ content: l.rotulo ? l.rotulo + ' ' + l.texto : l.texto, rotulo: l.rotulo, texto: l.texto,
                              styles: { fontSize: 10, halign: 'left', fontStyle: l.negrito ? 'bold' : 'normal' } }]);
        });
        doc.autoTable({
            body: tableData,
            startY: yPos,
            margin: margin,
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
            styles: { fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
            ...ganchosRotuloNegritoPDF(doc, margin)
        });
        yPos = doc.lastAutoTable.finalY + 6;
    });

    if (incluirGabarito) {
        doc.addPage();
        doc.autoTable({
            head: [['Item', 'Questão', 'Resposta']],
            body: pagina.gabarito.map(l => l.map(textoPDF)),
            startY: 20,
            margin: { top: 20, left: margin, right: margin },
            headStyles: { fillColor: [118, 75, 162], textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 128 }, 2: { cellWidth: 30, fontStyle: 'bold', halign: 'center' } },
            styles: { fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.1, valign: 'top' },
            didDrawPage: () => {
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('GABARITO — USO DO PROFESSOR', margin, 14);
            }
        });
    }

    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(textoPDF(rotuloDaAula(pagina.aula) + ' — ' + pagina.tema + ' · ' + pagina.ucCurta + ' · SENAI · Página ' + i + ' de ' + total), 105, 290, { align: 'center' });
    }

    doc.save('Atividade-' + rotuloDaAula(pagina.aula).replace(/\s+/g, '-') + '-' + pagina.total + '-Questoes' + (incluirGabarito ? '-COM-GABARITO' : '') + '.pdf');
}

/**
 * Exporta um PDF só com o gabarito da atividade atual (uso do professor).
 * @param {string[][]} gabarito - Linhas [item, título, letra] vindas do banco.
 * @param {{titulo?: string, subtitulo?: string, coluna?: string, arquivo?: string}} [opcoes] -
 *     Textos do PDF: padrão é o gabarito real (professor); o aluno recebe as próprias respostas.
 */
async function exportarSomenteGabaritoPDF(gabarito, opcoes = {}) {
    const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
    if (!jsPDF) {
        console.warn('jsPDF não carregado (verifique a conexão com a internet).');
        return;
    }

    const turma = await turmaDoPDF();
    if (turma === null) return;

    const pagina = await dadosDaPaginaParaPDF();
    const rotulo = rotuloDaAula(pagina.aula);
    const textoTurma = turma === TURMA_EM_BRANCO_ATIVIDADE_PDF ? '' : ' · Turma: ' + turma;
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(textoPDF((opcoes.titulo || 'GABARITO') + ' — ' + rotulo + ': ' + pagina.tema + ' (' + pagina.total + ' itens)'), 15, 16);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(textoPDF(pagina.uc + ' · Docente: ' + pagina.docente + textoTurma + ' · ' + (opcoes.subtitulo || 'USO DO PROFESSOR')), 15, 22);
    doc.autoTable({
        head: [['Item', 'Questão', opcoes.coluna || 'Resposta']],
        body: gabarito.map(l => l.map(textoPDF)),
        startY: 27,
        margin: { top: 20, left: 15, right: 15 },
        headStyles: { fillColor: [118, 75, 162], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 128 }, 2: { cellWidth: 30, fontStyle: 'bold', halign: 'center' } },
        styles: { fontSize: 9, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.1, valign: 'top' }
    });
    doc.save((opcoes.arquivo || 'Gabarito') + '-' + rotulo.replace(/\s+/g, '-') + '-' + pagina.total + '-Questoes.pdf');
}

document.getElementById('btnExportarPDF')?.addEventListener('click', () => exportarPDFAtividade());
