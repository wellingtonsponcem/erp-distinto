import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { queryOne } from '@/lib/db';
import { renderMasterContractHtml } from '@/lib/contract-template';

interface PublicContractReviewProps {
  contrato: {
    id: string;
    titulo: string;
    cliente_nome: string;
    status: string;
    conteudo_html: string;
    criado_em: string;
  } | null;
  erro?: string;
}

export default function PublicContractReviewPage({ contrato, erro }: PublicContractReviewProps) {
  if (erro || !contrato) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 mb-4">
          <span className="material-symbols-outlined text-3xl">description</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Contrato não encontrado</h1>
        <p className="text-sm text-zinc-400 max-w-md">
          O link de revisão acessado é inválido ou o documento não está mais disponível no sistema.
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>REVISÃO: {contrato.titulo}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-[#09090b] font-sans antialiased text-zinc-100 flex flex-col">
        {/* Banner Superior de Aviso de Revisão */}
        <header className="sticky top-0 z-50 bg-[#121118]/95 backdrop-blur-md border-b border-purple-500/20 px-4 py-3 shadow-lg">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <span className="material-symbols-outlined text-xl">visibility</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/90 border border-purple-500/30 px-2 py-0.5 rounded-md">
                    Modo de Revisão
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">Apenas Conferência</span>
                </div>
                <p className="text-xs text-zinc-300 font-medium mt-0.5">
                  Revise as cláusulas e dados. <strong>Este link não possui opção de assinatura.</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* Notificação no Topo do Documento */}
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2.5 text-center text-xs text-amber-300 font-medium">
          <span className="font-bold">Atenção:</span> A assinatura digital será enviada oficialmente após a conferência e aprovação destas informações.
        </div>

        {/* Container do Contrato (Iframe ou HTML Injetado com Estilo isolado) */}
        <main className="flex-1 py-6 px-2 sm:px-4 bg-zinc-900/60 flex justify-center overflow-x-auto">
          <div
            className="w-full max-w-[850px] bg-white text-zinc-900 shadow-2xl rounded-sm overflow-hidden"
            dangerouslySetInnerHTML={{ __html: contrato.conteudo_html }}
          />
        </main>

        {/* Rodapé da Página de Revisão */}
        <footer className="bg-[#09090b] border-t border-zinc-800/80 py-4 px-4 text-center text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Distinto Estúdio de Fotografia & Audiovisual • Documento de Revisão</p>
        </footer>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  if (!id || Array.isArray(id)) {
    return { props: { contrato: null, erro: 'ID inválido' } };
  }

  try {
    const contratoDb = await queryOne<any>(
      'SELECT * FROM contratos WHERE id = $1 LIMIT 1',
      [id]
    );

    if (!contratoDb) {
      return { props: { contrato: null, erro: 'Contrato não encontrado' } };
    }

    let dadosParsed: any = {};
    try {
      dadosParsed = typeof contratoDb.dados_json === 'string'
        ? JSON.parse(contratoDb.dados_json)
        : (contratoDb.dados_json || {});
    } catch (e) {}

    const clienteNome = contratoDb.cliente_nome || 'Cliente Contratante';
    const titulo = contratoDb.titulo || `Contrato - ${clienteNome}`;
    const valor = parseFloat(contratoDb.valor_total || contratoDb.valor || 0);

    let htmlFinal = dadosParsed.contrato_texto || '';

    if (!htmlFinal || htmlFinal.includes('CONTRATO DE PRESTAÇÃO DE SERVIÇOS AUDIOVISUAIS')) {
      htmlFinal = renderMasterContractHtml({
        id: contratoDb.id,
        titulo,
        cliente_nome: clienteNome,
        cliente_cpf_cnpj: contratoDb.cliente_cpf_cnpj || dadosParsed.signatario_1?.cpf || '',
        cliente_email: contratoDb.cliente_email || dadosParsed.signatario_1?.email || '',
        cliente_telefone: contratoDb.cliente_telefone || dadosParsed.signatario_1?.telefone || '',
        noivo_nome: dadosParsed.signatario_1?.nome || '',
        noivo_cpf: dadosParsed.signatario_1?.cpf || '',
        noivo_email: dadosParsed.signatario_1?.email || '',
        noivo_telefone: dadosParsed.signatario_1?.telefone || '',
        noiva_nome: dadosParsed.signatario_2?.nome || '',
        noiva_cpf: dadosParsed.signatario_2?.cpf || '',
        noiva_email: dadosParsed.signatario_2?.email || '',
        noiva_telefone: dadosParsed.signatario_2?.telefone || '',
        valor_total: valor,
        condicoes_pagamento: dadosParsed.forma_pagamento,
        clausulas_personalizadas: dadosParsed.clausulas
      });
    }

    // Sanitizar títulos na tag title/body se necessário
    if (htmlFinal.includes('{{TITULO_CONTRATO}}') || htmlFinal.includes('[TITULO_CONTRATO]')) {
      htmlFinal = htmlFinal
        .replace(/\{\{TITULO_CONTRATO\}\}/g, titulo)
        .replace(/\[TITULO_CONTRATO\]/g, titulo);
    }

    return {
      props: {
        contrato: {
          id: contratoDb.id,
          titulo,
          cliente_nome: clienteNome,
          status: contratoDb.status || 'rascunho',
          conteudo_html: htmlFinal,
          criado_em: contratoDb.criado_em || contratoDb.created_at || '',
        },
      },
    };
  } catch (err: any) {
    console.error('Erro ao buscar contrato público de revisão:', err);
    return { props: { contrato: null, erro: 'Erro interno no servidor' } };
  }
};
