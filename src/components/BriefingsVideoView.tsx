import React, { useEffect, useState } from 'react';
import {
  Search,
  ClipboardList,
  Link as LinkIcon,
  Copy,
  Check,
  RefreshCw,
  Calendar,
  Building2,
  Phone,
  Video,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const safeFetchJson = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { erro: `Resposta inválida: ${text.substring(0, 100)}` };
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return { ok: false, status: 500, data: { erro: err.message || 'Erro de conexão' } };
  }
};

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cpf_cnpj?: string;
}

interface BriefingVideo {
  id: string;
  cliente_nome: string;
  empresa?: string;
  cliente_id?: string;
  tipo?: string;
  status: string;
  criado_em: string;
  dados: Record<string, any>;
}

function formatDataBr(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatVal(v: any): string {
  if (Array.isArray(v)) return v.join(', ');
  return String(v ?? '');
}

export const BriefingsVideoView: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [briefings, setBriefings] = useState<BriefingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Gerador
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('');
  const [nomeManual, setNomeManual] = useState('');
  const [empresaManual, setEmpresaManual] = useState('');
  const [linkGerado, setLinkGerado] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [selected, setSelected] = useState<BriefingVideo | null>(null);

  const carregar = async () => {
    setLoading(true);
    const rClientes = await safeFetchJson('/api/gerenciamento/clientes');
    if (rClientes.ok && Array.isArray(rClientes.data)) setClientes(rClientes.data as Cliente[]);

    const rBrief = await safeFetchJson('/api/briefings/video-enviar?tipo=video_produtora');
    if (rBrief.ok && Array.isArray(rBrief.data)) {
      setBriefings(rBrief.data as BriefingVideo[]);
    } else {
      // fallback tenta ?tipo=todos e filtra
      const r2 = await safeFetchJson('/api/briefings/video-enviar?tipo=todos');
      if (r2.ok && Array.isArray(r2.data)) {
        setBriefings((r2.data as BriefingVideo[]).filter((b) => !b.tipo || b.tipo === 'video_produtora'));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    // Gera link automaticamente
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wedistinto.com';
    let nome = nomeManual.trim();
    let empresa = empresaManual.trim();
    let id = '';
    let telefone = '';
    let email = '';

    if (clienteSelecionado) {
      const cli = clientes.find((c) => c.id === clienteSelecionado);
      if (cli) {
        nome = cli.nome;
        id = cli.id;
        // empresa pode estar no nome ou campo separado - usa nome como fallback
        telefone = cli.telefone || '';
        email = cli.email || '';
      }
    }

    if (!nome && !empresa) {
      setLinkGerado(`${origin}/briefing-video`);
      return;
    }

    const params = new URLSearchParams();
    if (nome) params.set('cliente', nome);
    if (empresa) params.set('empresa', empresa);
    if (id) params.set('id', id);
    if (telefone) params.set('whatsapp', telefone);
    if (email) params.set('email', email);

    setLinkGerado(`${origin}/briefing-video?${params.toString()}`);
  }, [clienteSelecionado, nomeManual, empresaManual, clientes]);

  const copiarLink = async () => {
    if (!linkGerado) return;
    try {
      await navigator.clipboard.writeText(linkGerado);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = linkGerado;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const abrirLink = () => {
    if (linkGerado) window.open(linkGerado, '_blank');
  };

  const filtered = briefings.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (b.cliente_nome || '').toLowerCase().includes(q) ||
      (b.empresa || '').toLowerCase().includes(q) ||
      (b.dados?.empresa || '').toLowerCase().includes(q) ||
      (b.dados?.objetivo_video || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#050505] text-white flex flex-col min-h-screen p-6 font-sans">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 8px; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-[#c5a880]" />
            Briefings de Vídeo — Produtora
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Página pública <code className="text-[#c5a880]">/briefing-video</code> — gere link personalizado e envie para o cliente via WhatsApp
          </p>
        </div>
        <button
          onClick={carregar}
          className="flex items-center gap-2 p-2.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white self-start"
          title="Atualizar"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Gerador de Link */}
      <div className="bg-[#0c0c0c] border border-[#c5a880]/20 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 text-[#c5a880] font-bold text-xs mb-1">
          <Sparkles className="w-4 h-4" />
          Gerar link para enviar ao cliente
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Escolha um cliente da base (busca no banco e pré-preenche nome/empresa/WhatsApp) ou digite manualmente. Para cliente recorrente, use o seletor — o link já vai com <code className="text-zinc-300">?id=</code>.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Cliente da base (busca no banco)
            </label>
            <select
              value={clienteSelecionado}
              onChange={(e) => {
                setClienteSelecionado(e.target.value);
                if (e.target.value) {
                  setNomeManual('');
                  setEmpresaManual('');
                }
              }}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]"
            >
              <option value="">— Digitar manualmente —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} {c.telefone ? `— ${c.telefone}` : ''}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-600 mt-1">{clientes.length} clientes cadastrados</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Nome do cliente (manual)
            </label>
            <input
              type="text"
              value={nomeManual}
              onChange={(e) => {
                setNomeManual(e.target.value);
                if (e.target.value) setClienteSelecionado('');
              }}
              placeholder="Ex: Chef Ana"
              disabled={!!clienteSelecionado}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#c5a880] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Empresa / Marca (opcional)
            </label>
            <input
              type="text"
              value={empresaManual}
              onChange={(e) => {
                setEmpresaManual(e.target.value);
                // se tem cliente selecionado, permite sobrescrever empresa manualmente
              }}
              placeholder="Ex: Ateliê da Ana"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#c5a880]"
            />
          </div>
        </div>

        <div className="mt-4 bg-black/60 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-500 shrink-0">
            <LinkIcon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Link</span>
          </div>
          <code className="flex-1 text-xs text-[#c5a880] break-all bg-black/40 rounded-lg px-3 py-2 border border-white/5 font-mono">
            {linkGerado}
          </code>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copiarLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${copiado ? 'bg-emerald-600 text-white' : 'bg-[#c5a880] hover:bg-[#d4b78f] text-black'}`}
            >
              {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button
              onClick={abrirLink}
              className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5"
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Página pública, sem login
          </span>
          <span>•</span>
          <span>Link pré-preenche nome/empresa/WhatsApp na página</span>
          <span>•</span>
          <span>Respostas caem abaixo com filtro</span>
        </div>
      </div>

      {/* Stats + Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#c5a880]/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[#c5a880]" />
          </div>
          <div>
            <div className="text-2xl font-bold">{briefings.length}</div>
            <div className="text-xs text-zinc-500">Briefings Vídeo recebidos</div>
          </div>
        </div>
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{new Set(briefings.map((b) => b.empresa || b.dados?.empresa).filter(Boolean)).size}</div>
            <div className="text-xs text-zinc-500">Empresas distintas</div>
          </div>
        </div>
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center">
            <Video className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <div className="text-sm font-bold truncate max-w-[180px]">{briefings[0]?.cliente_nome || '—'}</div>
            <div className="text-xs text-zinc-500">Último briefing</div>
          </div>
        </div>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente, empresa, objetivo..."
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-white/20"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-zinc-500 text-sm py-10 text-center">Carregando briefings de vídeo...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#0c0c0c] border border-white/5 rounded-2xl">
          <Video className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
          <p className="text-sm text-white font-semibold">Nenhum briefing de vídeo ainda</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Gere o link acima e envie para o cliente. Quando ele responder, a resposta aparece aqui automaticamente. A página pública é <code className="text-[#c5a880]">/briefing-video</code>.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-[#121212] border border-white/5 hover:border-[#c5a880]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition"
              onClick={() => setSelected(b)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-[#c5a880]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">
                    {b.cliente_nome}
                    {b.empresa || b.dados?.empresa ? (
                      <span className="text-zinc-400 font-normal"> — {b.empresa || b.dados.empresa}</span>
                    ) : null}
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-[#c5a880]/15 text-[#c5a880] px-2 py-0.5 rounded-full">Vídeo Produtora</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1">
                    {b.dados?.objetivo_video && <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" />{formatVal(b.dados.objetivo_video)}</span>}
                    {b.dados?.prazo_entrega && <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />Prazo: {formatVal(b.dados.prazo_entrega)}</span>}
                    {b.dados?.whatsapp && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{formatVal(b.dados.whatsapp)}</span>}
                    <span>{formatDataBr(b.criado_em)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(b);
                }}
                className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition shrink-0"
              >
                Ver briefing
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => setSelected(null)}>
          <div
            className="bg-[#0c0c0c] border border-white/10 rounded-[1.5rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0c0c0c] z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a880]">Briefing Vídeo — Produtora</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selected.cliente_nome} {selected.empresa || selected.dados?.empresa ? `— ${selected.empresa || selected.dados.empresa}` : ''}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Recebido em {formatDataBr(selected.criado_em)} • ID {selected.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-full transition">
                <span className="text-zinc-400">✕</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                {[
                  ['Nome', selected.dados?.nome_cliente || selected.cliente_nome],
                  ['Empresa', selected.dados?.empresa || selected.empresa],
                  ['WhatsApp', selected.dados?.whatsapp],
                  ['E-mail', selected.dados?.email],
                ]
                  .filter(([, v]) => v)
                  .map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
                      <p className="text-sm text-white break-words">{formatVal(val as any)}</p>
                    </div>
                  ))}
              </div>

              {selected.dados &&
                Object.entries(selected.dados)
                  .filter(([k]) => !['nome_cliente', 'empresa', 'whatsapp', 'email', 'cliente_id', 'tipo', 'lgpd_aceito', 'lgpd_data_aceite'].includes(k))
                  .map(([key, val]) => {
                    if (!val || (Array.isArray(val) && val.length === 0) || String(val).trim() === '') return null;
                    const labels: Record<string, string> = {
                      objetivo_video: 'Objetivo do vídeo',
                      onde_publicado: 'Onde será publicado',
                      formato: 'Formato',
                      duracao_prevista: 'Duração prevista',
                      qtd_pessoas: 'Qtd. pessoas',
                      tipo_gravacao: 'Tipo de gravação',
                      roteiro: 'Roteiro',
                      audio: 'Áudio',
                      local_gravacao: 'Local da gravação',
                      data_gravacao: 'Data/horário gravação',
                      prazo_entrega: 'Prazo final',
                      escopo: 'Escopo',
                      cortes_pilulas: 'Cortes pílulas',
                      verba_estimada: 'Verba estimada',
                      referencia: 'Referência',
                    };
                    return (
                      <div key={key} className="border-b border-white/5 pb-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#c5a880] mb-1">
                          {labels[key] || key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-white whitespace-pre-wrap break-words">{formatVal(val)}</p>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
