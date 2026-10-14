// Monta e baixa documentos do Word (.doc no formato MHTML: o HTML do documento + as imagens
// embutidas), em folha A4 com margem de 15 mm e rodapé "Página X de Y", como os PDFs.
// Usado por assets/js/exportar-word.js (atividades e avaliações objetivas) e por
// assets/js/exportar-word-pratica.js (atividades práticas). Abre no Word e no LibreOffice Writer.

const LIMITE_PARTES_WORD = '----=_LIMITE_DOCUMENTO_WORD';
const TIPO_ARQUIVO_WORD = 'application/msword';
const ENDERECO_BASE_WORD = 'file:///C:/documento-word/';
const FONTE_WORD = 'Arial, Helvetica, sans-serif';
const TAMANHO_BLOCO_BASE64_WORD = 0x8000;
const LARGURA_LINHA_BASE64_WORD = 76;

/**
 * Escapa o texto para entrar no HTML do Word.
 * @param {string} texto - Texto livre.
 * @returns {string} Texto seguro para HTML.
 */
function escaparHtmlWord(texto) {
    return String(texto || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Converte bytes em base64, com quebras de linha de 76 caracteres (padrão MIME).
 * @param {Uint8Array} bytes - Conteúdo binário.
 * @returns {string} Base64 em linhas.
 */
function bytesParaBase64Word(bytes) {
    let binario = '';
    for (let i = 0; i < bytes.length; i += TAMANHO_BLOCO_BASE64_WORD) {
        binario += String.fromCharCode(...bytes.subarray(i, i + TAMANHO_BLOCO_BASE64_WORD));
    }
    return quebrarBase64Word(btoa(binario));
}

/**
 * Quebra um texto base64 em linhas de 76 caracteres (padrão MIME).
 * @param {string} base64 - Base64 numa linha só.
 * @returns {string} Base64 em linhas.
 */
function quebrarBase64Word(base64) {
    const linhas = base64.match(new RegExp(`.{1,${LARGURA_LINHA_BASE64_WORD}}`, 'g'));
    return (linhas || []).join('\r\n');
}

/**
 * Rodapé do Word com os campos de página; a tabela fica fora da folha (técnica do próprio Word)
 * e o texto aparece só no rodapé de cada página.
 * @param {string} texto - Texto do rodapé.
 * @returns {string} HTML do rodapé.
 */
function montarRodapeWord(texto) {
    const campo = (codigo) => `<span style="mso-field-code:' ${codigo} '"></span>`;
    return '<table style="margin-left:50in;"><tr><td>' +
        '<div style="mso-element:footer" id="f1"><p class="MsoFooter" ' +
        'style="text-align:center;font-size:8pt;margin:0;">' + escaparHtmlWord(texto) +
        ' · Página ' + campo('PAGE') + ' de ' + campo('NUMPAGES') + '</p></div></td></tr></table>';
}

/**
 * HTML completo do documento (página A4, margem de 15 mm e rodapé).
 * @param {{titulo: string, corpoHtml: string, rodape: string}} dados - Conteúdo do documento.
 * @returns {string} HTML pronto para o Word.
 */
function montarHtmlWord({ titulo, corpoHtml, rodape }) {
    const estilos = '@page Section1{size:21cm 29.7cm;margin:1.5cm;mso-footer:f1;' +
        'mso-footer-margin:0.7cm;} div.Section1{page:Section1;} ' +
        `body{font-family:${FONTE_WORD};font-size:10pt;color:#000000;}`;
    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
        'xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
        `<head><meta charset="utf-8"><title>${escaparHtmlWord(titulo)}</title>` +
        `<style>${estilos}</style></head><body><div class="Section1">` +
        corpoHtml + montarRodapeWord(rodape) + '</div></body></html>';
}

/**
 * Uma parte do arquivo MHTML (o HTML ou uma imagem), sempre em base64.
 * @param {{tipo: string, nome: string, base64: string}} parte - Tipo MIME, nome e conteúdo.
 * @returns {string} Texto da parte.
 */
function montarParteMhtmlWord({ tipo, nome, base64 }) {
    return `--${LIMITE_PARTES_WORD}\r\nContent-Type: ${tipo}\r\n` +
        'Content-Transfer-Encoding: base64\r\n' +
        `Content-Location: ${ENDERECO_BASE_WORD}${nome}\r\n\r\n${base64}\r\n`;
}

/**
 * Baixa o documento do Word. As imagens são referenciadas no HTML pelo próprio nome
 * (ex.: <img src="imagem-001.png">) e entram embutidas no arquivo.
 * @param {{titulo: string, corpoHtml: string, rodape: string, nomeArquivo: string,
 *     imagens?: {nome: string, tipo: string, base64: string}[]}} documento - Dados do documento.
 */
function baixarDocumentoWord(documento) {
    const html = montarHtmlWord(documento);
    const htmlBase64 = bytesParaBase64Word(new TextEncoder().encode(html));
    const partes = [{ tipo: 'text/html; charset="utf-8"', nome: 'documento.htm', base64: htmlBase64 },
        ...(documento.imagens || [])];
    const conteudo = 'MIME-Version: 1.0\r\n' +
        `Content-Type: multipart/related; boundary="${LIMITE_PARTES_WORD}"; type="text/html"\r\n\r\n` +
        partes.map(montarParteMhtmlWord).join('') + `--${LIMITE_PARTES_WORD}--\r\n`;
    const arquivo = new Blob([conteudo], { type: TIPO_ARQUIVO_WORD });
    const endereco = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = endereco;
    link.download = documento.nomeArquivo;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(endereco), 1000);
}
