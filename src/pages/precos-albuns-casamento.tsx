import React, { useEffect, useState } from 'react';
import {
  Sparkles, Crown, Layers, FileText,
  PackageCheck, Image, Box, ShoppingBag, MessageCircle, X, Printer,
  Share2, CircleDot, Check, Maximize2, BookOpen, CheckCircle2, Heart,
} from 'lucide-react';
import precosCasamentoData from '@/data/precos-albuns-casamento.json';

interface Colecao {
  id: string;
  nome_comercial: string;
  categoria_original: string;
  descricao: string;
  acabamento_detalhado: Record<string, string>;
  acabamentos_lista_fotos?: any[];
  estojo: any;
  custo_base_fullcolor: number;
  investimento_cliente: number;
  valor_lamina_extra: number;
  imagens: any;
}

export default function PrecosAlbunsCasamentoPage() {
  const whatsappEmpresa = '5527988586935';

  const [colecaoSelecionada, setColecaoSelecionada] = useState<Colecao | null>(null);
  const [laminasExtras, setLaminasExtras] = useState(0);
  const [showModalAprovacao, setShowModalAprovacao] = useState(false);
  const [showModalFoto, setShowModalFoto] = useState<{ src: string; titulo: string } | null>(null);

  const [apNome, setApNome] = useState('');
  const [apTelefone, setApTelefone] = useState('');
  const [apObs, setApObs] = useState('');

  const configGeral = (precosCasamentoData as any).configuracao_geral || {};
  const colecoes: Colecao[] = (precosCasamentoData as any).colecao_albuns || [];
  const galeriaAcabamentos: any[] = (precosCasamentoData as any).galeria_acabamentos || [];

  // Selecionar primeira coleção automaticamente
  useEffect(() => {
    if (colecoes.length && !colecaoSelecionada) {
      setColecaoSelecionada(colecoes[0]);
    }
  }, []);

  const selecionarColecao = (col: Colecao) => {
    setColecaoSelecionada(col);
  };

  const precoFinal = colecaoSelecionada
    ? colecaoSelecionada.investimento_cliente + (laminasExtras * colecaoSelecionada.valor_lamina_extra)
    : 0;

  const precoMinimo = colecoes.length ? Math.min(...colecoes.map(c => c.investimento_cliente)) : 0;

  const msgWhats = colecaoSelecionada
    ? `Olá! Tenho interesse nos Álbuns de Casamento. Escolhi a ${colecaoSelecionada.nome_comercial} (+${laminasExtras} lâminas extras, Total: R$ ${precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Podem me ajudar?`
    : '';

  const copiarLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => alert('Link copiado!'));
  };

  const enviarAprovacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colecaoSelecionada) return;
    const texto = `Olá! Quero solicitar o Álbum de Casamento (${colecaoSelecionada.nome_comercial}) (+${laminasExtras} lâminas extras, Total: R$ ${precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).%0A` +
      `Nome: ${encodeURIComponent(apNome)}%0ATelefone: ${encodeURIComponent(apTelefone)}%0AObs: ${encodeURIComponent(apObs)}`;
    window.open(`https://wa.me/${whatsappEmpresa}?text=${texto}`, '_blank');
    setShowModalAprovacao(false);
  };

  return (
    <>
      <style jsx global>{`
        html, body {
          background-color: #0c0a09 !important;
          color: #f5f5f4 !important;
          font-family: 'Inter', sans-serif;
          background-image:
            radial-gradient(circle at 20% 15%, rgba(225, 29, 72, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 60%, rgba(217, 119, 6, 0.10) 0%, transparent 45%) !important;
          background-attachment: fixed !important;
        }
        #__next {
          background-color: #0c0a09;
          min-height: 100vh;
        }
        .glass-panel {
          background: rgba(28, 25, 23, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(245, 245, 244, 0.09);
        }
        .glass-card {
          background: rgba(44, 38, 35, 0.55);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 245, 244, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          border-color: rgba(245, 158, 11, 0.45);
          box-shadow: 0 10px 30px -10px rgba(217, 119, 6, 0.25);
          transform: translateY(-2px);
        }
        .glass-card.selected {
          border-color: #f59e0b;
          background: rgba(217, 119, 6, 0.12);
          box-shadow: 0 0 35px rgba(245, 158, 11, 0.35);
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0c0a09; }
        ::-webkit-scrollbar-thumb { background: #292524; border-radius: 4px; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col antialiased pb-48 sm:pb-36" style={{ backgroundColor: '#0c0a09', color: '#f5f5f4' }}>
        {/* Header */}
        <header className="w-full glass-panel sticky top-0 z-40 border-b border-amber-500/20 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-amber-700 flex items-center justify-center font-bold text-white shadow-lg text-sm sm:text-base">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white/20" />
              </div>
              <div>
                <h1 className="font-extrabold tracking-wider text-base sm:text-lg text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>DISTINTO</h1>
                <p className="text-[9px] sm:text-[10px] tracking-widest uppercase text-amber-200/80 font-semibold hidden sm:block">Wedding & Fine Art Albums</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 no-print">
              <button onClick={() => window.print()} className="hidden sm:inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-xs font-semibold text-stone-300 transition-colors border border-amber-500/20">
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir / PDF</span>
              </button>
              <button onClick={copiarLink} className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-xs font-semibold text-stone-300 transition-colors border border-amber-500/20">
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 flex-1 w-full space-y-6 sm:space-y-10">
          {/* Hero */}
          <section className="glass-panel p-5 sm:p-12 rounded-2xl sm:rounded-3xl relative overflow-hidden border border-amber-500/20">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
              <div className="space-y-2.5 sm:space-y-3 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  <span>Edição Especial Casamentos</span>
                </div>
                <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Álbuns de Casamento <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-rose-300">Fine Art</span>
                </h2>
                <p className="text-sm sm:text-lg text-amber-100/80 font-medium">
                  Encadernação artesanal de alto padrão projetada para eternizar as memórias do grande dia com elegância, durabilidade e acabamento impecável.
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 sm:pt-2 text-xs text-stone-400">
                  <span className="flex items-center space-x-1.5 bg-stone-900/60 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    <span>Lâminas rígidas de 800g (não dobram)</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-stone-900/60 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    <span>4 coleções exclusivas para noivos</span>
                  </span>
                </div>
              </div>

              <div className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-2.5 sm:space-y-3 min-w-full sm:min-w-[240px] border-amber-500/30">
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-amber-200/70">Investimento A Partir De</span>
                <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  R$ {precoMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-400">Em até 6x sem juros ou condição especial à vista</p>
                <a href="#colecoes-section" className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg text-center">
                  Ver Coleções
                </a>
              </div>
            </div>
          </section>

          {/* Especificações Técnicas */}
          {Object.keys(configGeral).length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Especificações Técnicas da Linha Wedding</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="glass-panel p-4 sm:p-5 rounded-2xl flex items-start space-x-3.5 sm:space-x-4 border-amber-500/15">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-400 block">Dimensões</span>
                    <h4 className="font-bold text-stone-100 text-xs sm:text-sm mt-0.5">{configGeral.tamanho_fechado || '30x30 cm'} (Fechado)</h4>
                    <p className="text-[11px] sm:text-xs text-stone-400">{configGeral.tamanho_aberto || '30x60 cm'} panorâmico</p>
                  </div>
                </div>
                <div className="glass-panel p-4 sm:p-5 rounded-2xl flex items-start space-x-3.5 sm:space-x-4 border-amber-500/15">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-400 block">Encadernação</span>
                    <h4 className="font-bold text-stone-100 text-xs sm:text-sm mt-0.5">Panorâmica 180°</h4>
                    <p className="text-[11px] sm:text-xs text-stone-400">Lâminas rígidas de 800g / My Book 300g flexível</p>
                  </div>
                </div>
                <div className="glass-panel p-4 sm:p-5 rounded-2xl flex items-start space-x-3.5 sm:space-x-4 border-amber-500/15">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-400 block">Capacidade Base</span>
                    <h4 className="font-bold text-stone-100 text-xs sm:text-sm mt-0.5">{configGeral.paginas_base || 20} Páginas (10 Lâminas)</h4>
                    <p className="text-[11px] sm:text-xs text-stone-400">Expansível com lâminas extras</p>
                  </div>
                </div>
                <div className="glass-panel p-4 sm:p-5 rounded-2xl flex items-start space-x-3.5 sm:space-x-4 border-amber-500/15">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-400 block">Entrega & Apresentação</span>
                    <h4 className="font-bold text-stone-100 text-xs sm:text-sm mt-0.5">{configGeral.retirada || 'Presencial'}</h4>
                    <p className="text-[11px] sm:text-xs text-stone-400">Caixa e embalagem de gala</p>
                  </div>
                </div>
              </div>

              {configGeral.servicos_inclusos?.length > 0 && (
                <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-amber-500/20 mt-3 sm:mt-4">
                  <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-amber-400 block mb-2.5">Diferenciais Inclusos nos Álbuns de Casamento</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {configGeral.servicos_inclusos.map((serv: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-stone-200 bg-stone-900/60 p-2.5 rounded-xl border border-amber-500/10">
                        <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{serv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Coleções */}
          <section id="colecoes-section" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Crown className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Coleções & Acabamentos de Casamento</h3>
                </div>
                <p className="text-xs text-stone-400 mt-1">Selecione a coleção desejada para personalizar o número de lâminas extras e simular o valor final.</p>
              </div>

              <div className="glass-panel p-2.5 sm:p-3 rounded-2xl flex items-center justify-between sm:justify-start space-x-2 sm:space-x-3 w-full sm:w-auto border border-amber-500/30">
                <span className="text-xs font-bold text-stone-300 pl-1">Lâminas Extras:</span>
                <select
                  value={laminasExtras}
                  onChange={(e) => setLaminasExtras(parseInt(e.target.value))}
                  className="bg-stone-900 text-amber-300 font-bold text-xs rounded-xl px-2.5 py-1.5 border border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={0}>+0 Lâminas (20 Páginas)</option>
                  <option value={2}>+2 Lâminas (24 Páginas)</option>
                  <option value={4}>+4 Lâminas (28 Páginas)</option>
                  <option value={6}>+6 Lâminas (32 Páginas)</option>
                  <option value={8}>+8 Lâminas (36 Páginas)</option>
                  <option value={10}>+10 Lâminas (40 Páginas)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {colecoes.map((col) => {
                const catOrig = col.categoria_original || '';
                const isTop = catOrig === 'Top Master' || catOrig === 'Prestige';
                const isMid = catOrig === 'Intermediário' || catOrig === 'Classic';
                const isSimple = catOrig === 'Simples' || catOrig === 'Essencial';
                const isMyBook = col.id === 'my_book' || catOrig === 'Fotográficos';
                const isSelected = colecaoSelecionada?.id === col.id;
                const imgCapa = col.imagens?.capa || col.estojo?.imagem_referencia || '';
                const precoColecao = col.investimento_cliente + (laminasExtras * col.valor_lamina_extra);

                return (
                  <div
                    key={col.id}
                    onClick={() => selecionarColecao(col)}
                    className={`glass-card rounded-3xl p-6 flex flex-col justify-between cursor-pointer relative overflow-hidden group border-2 ${
                      isSelected ? 'selected' : 'border-transparent'
                    }`}
                  >
                    <div className="space-y-5">
                      {imgCapa && (
                        <div className="w-full rounded-2xl overflow-hidden bg-stone-950 relative group-hover:scale-[1.02] transition-transform border border-amber-500/20 shadow-inner">
                          <img src={imgCapa} alt={col.nome_comercial} className="w-full h-auto block relative z-10 opacity-95 group-hover:opacity-100 transition-opacity" onError={(e)=>{ (e.target as HTMLImageElement).style.display='none'; }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent z-20 pointer-events-none" />
                          {isTop && (
                            <div className="absolute top-3 right-3 z-30 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-stone-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-2xl border border-yellow-200/50">
                              LUXO SUPREMO
                            </div>
                          )}
                          {isMid && !isTop && (
                            <div className="absolute top-3 right-3 z-30 bg-stone-900/90 text-amber-300 border border-amber-400/60 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md shadow-lg">
                              MAIS ESCOLHIDO
                            </div>
                          )}
                          {isSimple && !isMyBook && (
                            <div className="absolute top-3 right-3 z-30 bg-stone-900/90 text-stone-300 border border-stone-700 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md shadow-lg">
                              ESSENCIAL NOIVOS
                            </div>
                          )}
                          {isMyBook && (
                            <div className="absolute top-3 right-3 z-30 bg-rose-900/90 text-rose-200 border border-rose-400/60 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md shadow-lg">
                              ÁLBUM DOS PAIS
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">{col.categoria_original || 'Coleção Wedding'}</span>
                        <h4 className="text-xl font-extrabold text-white tracking-tight leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>{col.nome_comercial}</h4>
                        <p className="text-xs text-stone-400 mt-2 leading-relaxed">{col.descricao}</p>
                      </div>

                      {/* Acabamentos detalhados */}
                      {col.acabamento_detalhado && Object.keys(col.acabamento_detalhado).length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-stone-800 text-xs">
                          <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">Acabamentos do Álbum:</span>
                          {Object.entries(col.acabamento_detalhado).map(([k, v]) => (
                            <div key={k} className="flex items-start space-x-2 text-stone-300 bg-stone-900/60 p-2 rounded-xl border border-stone-800">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-snug">
                                <strong className="text-stone-100 capitalize">{k.replace(/_/g,' ')}:</strong> {String(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {col.estojo && (
                        <div className={`p-3.5 rounded-2xl border space-y-2 ${col.estojo.opcional ? 'bg-amber-950/30 border-amber-500/30' : 'bg-stone-900/80 border-amber-500/20'}`}>
                          <div className="flex items-start justify-between gap-2 text-xs font-bold text-amber-300">
                            <span className="flex items-start space-x-2 flex-1 min-w-0">
                              <Box className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                              <span className="leading-tight">{col.estojo.tipo || 'Estojo Nobre'}</span>
                            </span>
                            {col.estojo.opcional && col.estojo.valor_adicional && (
                              <span className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-[11px] font-black leading-none">+R$ {Number(col.estojo.valor_adicional).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            )}
                          </div>
                          {col.estojo.imagem_referencia && (
                            <img src={col.estojo.imagem_referencia} alt={col.estojo.tipo || 'Estojo'} className="w-full rounded-xl" onError={(e)=>{ (e.target as HTMLImageElement).style.display='none'; }} />
                          )}
                          <p className="text-[11px] text-stone-400 leading-tight">{col.estojo.descricao || ''}</p>
                          {col.estojo.opcional && (
                            <p className="text-[10px] font-semibold text-amber-300/80">Opcional — solicite no pedido se desejar incluir.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-stone-800 flex flex-col space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-stone-400 font-medium">Investimento:</span>
                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            R$ {precoColecao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <span className="text-[10px] text-amber-300 font-semibold block">
                            + R$ {col.valor_lamina_extra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / lâmina extra
                          </span>
                        </div>
                      </div>
                      <button className="w-full py-3 rounded-xl bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 group-hover:bg-amber-500 group-hover:text-stone-950">
                        <CircleDot className="w-4 h-4" />
                        <span>Selecionar Coleção</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Galeria */}
          {galeriaAcabamentos.length > 0 && (
            <section className="space-y-6 pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Image className="w-4 h-4" />
                </div>
                <h3 className="text-2xl font-extrabold text-white tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Galeria de Detalhes & Acabamentos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {galeriaAcabamentos.map((item: any, idx: number) => (
                  <div key={idx} className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between border-amber-500/10">
                    <div className="h-44 bg-stone-900 relative overflow-hidden">
                      <img src={item.imagem_exemplo} alt={item.item} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e)=>{ (e.target as HTMLImageElement).style.display='none'; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-4 space-y-1 flex-1">
                      <h4 className="font-bold text-sm text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{item.item}</h4>
                      <p className="text-xs text-stone-400 leading-relaxed">{item.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer flutuante */}
        <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-amber-500/30 px-3 py-2.5 sm:p-5 no-print shadow-2xl backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto">
            {!colecaoSelecionada ? (
              <div className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center space-x-2.5 text-amber-300">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 block">Escolha uma coleção:</span>
                    <p className="text-xs sm:text-sm font-semibold text-stone-100">Selecione um dos álbuns acima para personalizar seu pedido</p>
                  </div>
                </div>
                <a href="#colecoes-section" className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all shrink-0">
                  Escolher Álbum
                </a>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-4">
                <div className="flex items-center justify-between sm:justify-start space-x-3">
                  <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 items-center justify-center text-amber-400 shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-1.5 sm:block">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 sm:text-stone-400">Selecionada:</span>
                    <h5 className="font-extrabold text-white text-xs sm:text-base truncate max-w-[200px] sm:max-w-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {colecaoSelecionada.nome_comercial}
                    </h5>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Investimento Total</span>
                    <div className="text-lg sm:text-3xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      R$ {precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                    <a
                      href={`https://wa.me/${whatsappEmpresa}?text=${encodeURIComponent(msgWhats)}`}
                      target="_blank"
                      className="p-2.5 sm:px-4 sm:py-3.5 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-900/30"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden md:inline">WhatsApp</span>
                    </a>
                    <button
                      onClick={() => setShowModalAprovacao(true)}
                      className="px-3.5 py-2.5 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Solicitar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Solicitação */}
        {showModalAprovacao && (
          <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/40 relative">
              <button onClick={() => setShowModalAprovacao(false)} className="absolute top-5 right-5 text-stone-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase border border-amber-500/30">
                  <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span>Solicitar Álbum de Casamento</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Solicitar esta coleção</h3>
                <p className="text-xs text-stone-400">Preencha seus dados para receber o atendimento personalizado pelo WhatsApp.</p>
              </div>

              <form onSubmit={enviarAprovacao} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Nome dos Noivos / Contato</label>
                  <input type="text" value={apNome} onChange={(e) => setApNome(e.target.value)} required placeholder="Ex: Giovanna e Pedro" className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">WhatsApp / Telefone</label>
                  <input type="text" value={apTelefone} onChange={(e) => setApTelefone(e.target.value)} required placeholder="(27) 99999-9999" className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500" />
                </div>

                <div className="bg-stone-900/90 p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Coleção Escolhida:</span>
                    <strong className="text-amber-300 font-bold">{colecaoSelecionada?.nome_comercial || '--'}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Lâminas Extras:</span>
                    <strong className="text-stone-200 font-bold">+{laminasExtras} Lâminas</strong>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-stone-800">
                    <span>Investimento Final:</span>
                    <strong className="text-emerald-400 text-lg">R$ {precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Observações (Opcional)</label>
                  <textarea value={apObs} onChange={(e) => setApObs(e.target.value)} rows={3} placeholder="Data do casamento, preferências de estojo ou acabamentos..." className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500" />
                </div>

                <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40">
                  Enviar Solicitação via WhatsApp
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Foto */}
        {showModalFoto && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowModalFoto(null)}>
            <div className="relative max-w-3xl w-full bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h3 className="text-sm font-bold text-white tracking-wide truncate">{showModalFoto.titulo}</h3>
                <button onClick={() => setShowModalFoto(null)} className="p-1 rounded-full text-stone-400 hover:text-white bg-stone-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[75vh] overflow-hidden rounded-2xl bg-stone-950 flex items-center justify-center p-2">
                <img src={showModalFoto.src} alt={showModalFoto.titulo} className="max-h-[70vh] w-auto object-contain rounded-xl" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
