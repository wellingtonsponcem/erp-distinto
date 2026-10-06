import fs from 'fs';
import path from 'path';

export interface ContractRenderData {
  id?: string;
  numero_contrato?: string;
  titulo?: string;
  cliente_nome?: string;
  cliente_cpf_cnpj?: string;
  cliente_email?: string;
  cliente_telefone?: string;
  cliente_endereco?: string;
  noivo_nome?: string;
  noiva_nome?: string;
  noivo_cpf?: string;
  noiva_cpf?: string;
  noivo_email?: string;
  noiva_email?: string;
  noivo_telefone?: string;
  noiva_telefone?: string;
  empresa_nome?: string;
  empresa_cnpj?: string;
  empresa_endereco?: string;
  empresa_email?: string;
  valor_total?: number;
  data_evento?: string;
  local_evento?: string;
  ensaio_prewedding?: string;
  condicoes_pagamento?: string;
  clausulas_personalizadas?: string;
  anexo_escopo?: string;
  custom_template_html?: string;
}

export function renderMasterContractHtml(data: ContractRenderData): string {
  let rawHtml = data.custom_template_html || '';

  if (!rawHtml) {
    const templatePath = path.join(process.cwd(), 'contrato_jeanenuneswellingtonponcemdocumentoc.html');
    if (fs.existsSync(templatePath)) {
      rawHtml = fs.readFileSync(templatePath, 'utf-8');
    }
  }

  if (!rawHtml) {
    return `<div style="padding: 20px; font-family: sans-serif;"><h2>${data.titulo || 'Contrato'}</h2><p>Contratante: ${data.cliente_nome}</p><p>Valor: R$ ${(data.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>`;
  }

  const numContrato = data.numero_contrato
    || (data.id ? (data.id.startsWith('contrato_') ? `2026/${data.id.replace('contrato_', '').substring(0, 8).toUpperCase()}` : `2026/${data.id.substring(0, 6).toUpperCase()}`) : '2026/830B');
  const valorTotalNum = parseFloat(String(data.valor_total || 0));
  const valorTotalStr = `R$ ${valorTotalNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const clienteNome = data.cliente_nome
    || (data.noivo_nome && data.noiva_nome ? `${data.noivo_nome} & ${data.noiva_nome}` : data.noivo_nome || data.noiva_nome || 'CONTRATANTE');
  const clienteCpfCnpj = data.cliente_cpf_cnpj
    || [data.noivo_cpf, data.noiva_cpf].filter(Boolean).join(' / ')
    || '000.000.000-00';
  const clienteEmail = data.cliente_email || data.noivo_email || data.noiva_email || '';
  const clienteTelefone = data.cliente_telefone || data.noivo_telefone || data.noiva_telefone || '';

  let html = rawHtml;

  // Substituição de todas as Variáveis Padrão {{TAG}}
  html = html.replace(/\{\{NUMERO_CONTRATO\}\}/g, numContrato);
  html = html.replace(/\{\{CLIENTE_NOME\}\}/g, clienteNome);
  html = html.replace(/\{\{CLIENTE_CPF_CNPJ\}\}/g, clienteCpfCnpj);
  html = html.replace(/\{\{CLIENTE_EMAIL\}\}/g, clienteEmail);
  html = html.replace(/\{\{CLIENTE_TELEFONE\}\}/g, clienteTelefone);
  html = html.replace(/\{\{CLIENTE_ENDERECO\}\}/g, data.cliente_endereco || '');

  html = html.replace(/\{\{CLIENTE_EMAIL_INFO\}\}/g, clienteEmail ? `, e-mail: ${clienteEmail}` : '');
  html = html.replace(/\{\{CLIENTE_TELEFONE_INFO\}\}/g, clienteTelefone ? `, telefone: ${clienteTelefone}` : '');
  html = html.replace(/\{\{CLIENTE_ENDERECO_INFO\}\}/g, data.cliente_endereco ? `, residente em: ${data.cliente_endereco}` : '');

  html = html.replace(/\{\{EMPRESA_NOME\}\}/g, data.empresa_nome || 'Distinto (69.250.713 JEANE NUNES DE PONCEM FAUSTINO)');
  html = html.replace(/\{\{EMPRESA_CNPJ\}\}/g, data.empresa_cnpj || '69.250.713/0001-00');
  html = html.replace(/\{\{EMPRESA_ENDERECO\}\}/g, data.empresa_endereco || 'Avenida Brasil, nº 17, Quadra 39, Novo Horizonte, Serra - ES, CEP 29163-331');
  html = html.replace(/\{\{EMPRESA_EMAIL\}\}/g, data.empresa_email || 'contato@wedistinto.com');
  html = html.replace(/\{\{VALOR_TOTAL\}\}/g, valorTotalStr);
  html = html.replace(/\{\{CONDICOES_PAGAMENTO\}\}/g, data.condicoes_pagamento || 'Entrada de 20% + Saldo parcelado em até 6x.');
  html = html.replace(/\{\{TITULO_CONTRATO\}\}/g, data.titulo || 'Contrato de Prestação de Serviços');
  html = html.replace(/\{\{DATA_EVENTO\}\}/g, data.data_evento || 'a ser definida em comum acordo');
  html = html.replace(/\{\{LOCAL_EVENTO\}\}/g, data.local_evento || 'a ser definido em comum acordo');

  // Variáveis dos Noivos / Casal
  html = html.replace(/\{\{NOIVO_NOME\}\}/g, data.noivo_nome || '');
  html = html.replace(/\{\{NOIVA_NOME\}\}/g, data.noiva_nome || '');
  html = html.replace(/\{\{NOIVO_CPF\}\}/g, data.noivo_cpf || '');
  html = html.replace(/\{\{NOIVA_CPF\}\}/g, data.noiva_cpf || '');
  html = html.replace(/\{\{NOIVO_EMAIL\}\}/g, data.noivo_email || '');
  html = html.replace(/\{\{NOIVA_EMAIL\}\}/g, data.noiva_email || '');
  html = html.replace(/\{\{NOIVO_TELEFONE\}\}/g, data.noivo_telefone || '');
  html = html.replace(/\{\{NOIVA_TELEFONE\}\}/g, data.noiva_telefone || '');

  // Se houver cláusulas personalizadas
  if (data.clausulas_personalizadas) {
    const sectionHtml = `
      <div class="section-title">CLÁUSULA ADICIONAL — TERMOS E ESCOPO ESPECÍFICO</div>
      <p class="clause" style="white-space: pre-line;">${data.clausulas_personalizadas}</p>
    `;
    html = html.replace(/\{\{CLAUSULAS_PERSONALIZADAS_SECTION\}\}/g, sectionHtml);
    html = html.replace(/\{\{CLAUSULAS_PERSONALIZADAS\}\}/g, data.clausulas_personalizadas);
  } else {
    html = html.replace(/\{\{CLAUSULAS_PERSONALIZADAS_SECTION\}\}/g, '');
    html = html.replace(/\{\{CLAUSULAS_PERSONALIZADAS\}\}/g, '');
  }

  // Retrocompatibilidade se o template ainda contiver blocos antigos
  if (html.includes('Jeane Nunes,') || html.includes('wemngton Poncem,')) {
    const contratanteBlock = `<strong>${clienteNome}</strong>, portador(a) do CPF/CNPJ nº <strong>${clienteCpfCnpj}</strong>${clienteEmail ? `, e-mail ${clienteEmail}` : ''}, doravante denominado(a) simplesmente <strong>CONTRATANTE</strong>.`;
    html = html.replace(
      /<p class="c164">[\s\S]*?<\/p>/,
      `<p class="c164">${contratanteBlock}</p>`
    );
  }

  return html;
}
