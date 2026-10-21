import fs from 'fs';
import path from 'path';
import { queryOne } from './db';

export interface ContractRenderData {
  id?: string;
  numero_contrato?: string;
  criado_em?: string | Date;
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
  empresa_nome_fantasia?: string;
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
  data_assinatura?: string;
}

// Dados oficiais da CONTRATADA (Receita Federal). Podem ser sobrescritos por contrato via dados_json.empresa_*
export const EMPRESA_PADRAO = {
  nome_fantasia: 'DISTINTO',
  nome: '69.250.713 JEANE NUNES DE PONCEM FAUSTINO',
  cnpj: '69.250.713/0001-00',
  endereco: 'Av. Brasil, nº 17, Quadra 39, Novo Horizonte, Serra/ES, CEP 29163-331',
  email: 'ola@wedistinto.com',
};

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function formatTelefone(tel?: string): string {
  const d = (tel || '').replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel || '';
}

// Número no formato ANO/NNNNN. Sem número salvo, deriva um valor estável do id (não muda a cada renderização).
export function gerarNumeroContrato(seed?: string, ano?: number): string {
  const year = ano || new Date().getFullYear();
  let n: number;
  if (seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    n = 10000 + (h % 90000);
  } else {
    n = 10000 + Math.floor(Math.random() * 90000);
  }
  return `${year}/${n}`;
}

// Monta os dados de renderização a partir da linha do banco + dados_json (usado por todas as rotas)
export function buildContractRenderData(row: any, dados: any): ContractRenderData {
  const s1 = dados.signatario_1 || {};
  const s2 = dados.signatario_2 || {};
  return {
    id: row.id,
    numero_contrato: dados.numero_contrato,
    criado_em: row.criado_em || row.created_at,
    titulo: row.titulo,
    cliente_nome: row.cliente_nome || row.cliente || '',
    cliente_cpf_cnpj: row.cliente_cpf_cnpj || s1.cpf || '',
    cliente_email: row.cliente_email || s1.email || '',
    cliente_telefone: row.cliente_telefone || s1.telefone || '',
    cliente_endereco: dados.cliente_endereco || '',
    noivo_nome: s1.nome || '',
    noivo_cpf: s1.cpf || '',
    noivo_email: s1.email || '',
    noivo_telefone: s1.telefone || '',
    noiva_nome: s2.nome || '',
    noiva_cpf: s2.cpf || '',
    noiva_email: s2.email || '',
    noiva_telefone: s2.telefone || '',
    empresa_nome: dados.empresa_nome,
    empresa_nome_fantasia: dados.empresa_nome_fantasia,
    empresa_cnpj: dados.empresa_cnpj,
    empresa_endereco: dados.empresa_endereco,
    empresa_email: dados.empresa_email,
    valor_total: parseFloat(row.valor_total || row.valor || 0),
    data_evento: dados.data_evento,
    local_evento: dados.local_evento,
    condicoes_pagamento: dados.forma_pagamento,
    clausulas_personalizadas: dados.clausulas,
    data_assinatura: dados.data_assinatura,
  };
}

// Modelo escolhido no contrato (dados.modelo_id) ou o modelo padrão cadastrado em Modelos de Contrato.
// Sem nenhum no banco, cai no arquivo HTML oficial.
async function carregarModeloHtml(modeloId?: string): Promise<string> {
  try {
    const row = modeloId
      ? await queryOne<any>('SELECT conteudo_html FROM modelos_contrato WHERE id = $1 LIMIT 1', [modeloId])
      : await queryOne<any>('SELECT conteudo_html FROM modelos_contrato WHERE padrao = 1 LIMIT 1');
    return row?.conteudo_html || '';
  } catch (e) {
    return '';
  }
}

export async function renderContractForRow(row: any, dados: any): Promise<string> {
  // Fixa a data de emissão na primeira renderização para não mudar a cada edição
  if (!dados.data_assinatura) {
    const d = new Date();
    dados.data_assinatura = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }
  const data = buildContractRenderData(row, dados);
  data.custom_template_html = await carregarModeloHtml(dados.modelo_id);
  return renderMasterContractHtml(data);
}

function qualificacaoContratantes(data: ContractRenderData): string {
  const pessoas = [
    { nome: data.noivo_nome, cpf: data.noivo_cpf, email: data.noivo_email, tel: data.noivo_telefone },
    { nome: data.noiva_nome, cpf: data.noiva_cpf, email: data.noiva_email, tel: data.noiva_telefone },
  ].filter(p => p.nome);

  if (pessoas.length === 0) {
    pessoas.push({ nome: data.cliente_nome || 'CONTRATANTE', cpf: data.cliente_cpf_cnpj, email: data.cliente_email, tel: data.cliente_telefone });
  }

  const partes = pessoas.map(p => {
    const itens = [`<strong>${escapeHtml(p.nome || '')}</strong>`];
    if (p.cpf) itens.push(`inscrito(a) no CPF sob o nº <strong>${escapeHtml(p.cpf)}</strong>`);
    if (p.email) itens.push(`e-mail <strong>${escapeHtml(p.email)}</strong>`);
    if (p.tel) itens.push(`telefone <strong>${escapeHtml(formatTelefone(p.tel))}</strong>`);
    return itens.join(', ');
  });

  const endereco = data.cliente_endereco
    ? `, ${pessoas.length > 1 ? 'ambos residentes e domiciliados' : 'residente e domiciliado(a)'} em <strong>${escapeHtml(data.cliente_endereco)}</strong>`
    : '';
  return `${partes.join('; e ')}${endereco}, doravante denominados, em conjunto, <strong>CONTRATANTES</strong>.`;
}

function assinaturasContratantes(data: ContractRenderData): string {
  const nomes = [data.noivo_nome, data.noiva_nome].filter(Boolean) as string[];
  if (nomes.length === 0) nomes.push(data.cliente_nome || 'CONTRATANTE');
  return nomes.map(n => `
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-name">${escapeHtml(n.toUpperCase())}</div>
          <div class="signature-role">CONTRATANTE</div>
        </div>`).join('');
}

// "R$ 150 no ato + R$ 150 na entrega" vira lista a) b)
function formatCondicoesPagamento(cond: string): string {
  const partes = cond.split(/\s\+\s/).map(p => p.trim().replace(/[.;]$/, '')).filter(Boolean);
  if (partes.length < 2) return escapeHtml(cond);
  return partes
    .map((p, i) => `${String.fromCharCode(97 + i)}) ${escapeHtml(p)}${i < partes.length - 1 ? ';' : '.'}`)
    .join('<br>\n      ');
}

function getExtensoDate(dateStr?: string): string {
  if (dateStr && dateStr.includes(' de ')) return dateStr;
  let now = new Date();
  if (dateStr) {
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        now = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        now = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
  }
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return `${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;
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

  const anoContrato = data.criado_em ? new Date(data.criado_em).getFullYear() : undefined;
  const numContrato = data.numero_contrato || gerarNumeroContrato(data.id, anoContrato);
  const valorTotalNum = parseFloat(String(data.valor_total || 0));
  const valorTotalStr = `R$ ${valorTotalNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const clienteNome = data.cliente_nome
    || (data.noivo_nome && data.noiva_nome ? `${data.noivo_nome} & ${data.noiva_nome}` : data.noivo_nome || data.noiva_nome || 'CONTRATANTE');
  const clienteCpfCnpj = data.cliente_cpf_cnpj
    || [data.noivo_cpf, data.noiva_cpf].filter(Boolean).join(' / ')
    || '000.000.000-00';
  const clienteEmail = data.cliente_email || data.noivo_email || data.noiva_email || '';
  const clienteTelefone = formatTelefone(data.cliente_telefone || data.noivo_telefone || data.noiva_telefone || '');

  const dataAssinaturaStr = getExtensoDate(data.data_assinatura);

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

  html = html.replace(/\{\{CONTRATANTES_QUALIFICACAO\}\}/g, qualificacaoContratantes(data));
  html = html.replace(/\{\{ASSINATURAS_CONTRATANTES\}\}/g, assinaturasContratantes(data));

  html = html.replace(/\{\{EMPRESA_NOME_FANTASIA\}\}/g, data.empresa_nome_fantasia || EMPRESA_PADRAO.nome_fantasia);
  html = html.replace(/\{\{EMPRESA_NOME\}\}/g, data.empresa_nome || EMPRESA_PADRAO.nome);
  html = html.replace(/\{\{EMPRESA_CNPJ\}\}/g, data.empresa_cnpj || EMPRESA_PADRAO.cnpj);
  html = html.replace(/\{\{EMPRESA_ENDERECO\}\}/g, data.empresa_endereco || EMPRESA_PADRAO.endereco);
  html = html.replace(/\{\{EMPRESA_EMAIL\}\}/g, data.empresa_email || EMPRESA_PADRAO.email);
  html = html.replace(/\{\{VALOR_TOTAL\}\}/g, valorTotalStr);
  html = html.replace(/\{\{CONDICOES_PAGAMENTO\}\}/g, formatCondicoesPagamento(data.condicoes_pagamento || 'Reserva de data: R$ 150,00 (cento e cinquenta reais), pagos no ato da contratação + Saldo: R$ 150,00 (cento e cinquenta reais), pagos até o momento da entrega das fotografias finais'));
  html = html.replace(/\{\{TITULO_CONTRATO\}\}/g, data.titulo || 'Contrato de Prestação de Serviços Fotográficos - Ensaio Pré-Wedding');
  html = html.replace(/\{\{DATA_EVENTO\}\}/g, data.data_evento || 'a definir');
  html = html.replace(/\{\{LOCAL_EVENTO\}\}/g, data.local_evento || 'a definir');
  html = html.replace(/\{\{DATA_ASSINATURA\}\}/g, dataAssinaturaStr);

  // Variáveis dos Noivos / Casal
  html = html.replace(/\{\{NOIVO_NOME\}\}/g, data.noivo_nome || '');
  html = html.replace(/\{\{NOIVA_NOME\}\}/g, data.noiva_nome || '');
  html = html.replace(/\{\{NOIVO_CPF\}\}/g, data.noivo_cpf || '');
  html = html.replace(/\{\{NOIVA_CPF\}\}/g, data.noiva_cpf || '');
  html = html.replace(/\{\{NOIVO_EMAIL\}\}/g, data.noivo_email || '');
  html = html.replace(/\{\{NOIVA_EMAIL\}\}/g, data.noiva_email || '');
  html = html.replace(/\{\{NOIVO_TELEFONE\}\}/g, formatTelefone(data.noivo_telefone));
  html = html.replace(/\{\{NOIVA_TELEFONE\}\}/g, formatTelefone(data.noiva_telefone));

  // Se houver cláusulas personalizadas
  if (data.clausulas_personalizadas) {
    const sectionHtml = `
      <div class="section-title">CLÁUSULA ADICIONAL — TERMOS E ESCOPO ESPECÍFICO</div>
      <p class="clause" style="white-space: pre-line;">${escapeHtml(data.clausulas_personalizadas)}</p>
    `;
    html = html.replace(/\{\{CLAUSULAS_PERSONALIZADAS_SECTION\}\}/g, sectionHtml);
    html = html.replace(/\{\{CLAUSULAS_PERSONALIZADAS\}\}/g, data.clausulas_personalizadas);
  } else {
    html = html.replace(/\{\{CLAUSULAS_PERSONALIZADAS_SECTION\}\}/g, '');
    html = html.replace(/\{\{CLAUSULAS_PERSONALIZADAS\}\}/g, '');
  }

  return html;
}
