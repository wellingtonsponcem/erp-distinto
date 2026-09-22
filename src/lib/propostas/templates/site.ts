import { SlideCtx, sanitizar, formatarMoeda } from '@/lib/propostas/common';

function normalizarValidade(v:any): string {
  if(!v) return '';
  if(v instanceof Date) return v.toISOString().slice(0,10);
  const s=String(v).trim(); if(!s) return '';
  const iso=s.match(/^(\d{4})-(\d{2})-(\d{2})/); if(iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const d2=new Date(s); if(!isNaN(d2.getTime())) return d2.toISOString().slice(0,10);
  return s;
}
function humanizarVencimento(v:string): string {
  const m:Record<string,string>={ na_aprovacao:'NA APROVAÇÃO', na_entrega:'NA ENTREGA / APROVAÇÃO FINAL', avista:'À VISTA', na_assinatura:'NA ASSINATURA' };
  return m[String(v||'').toLowerCase()] || String(v||'').replace(/_/g,' ').toUpperCase() || '—';
}
function extrairNumeroProposta(slug:string): string {
  const m = String(slug||'').match(/(\d{3,6})/);
  return m ? m[1] : '2200';
}
function formatarDataBR(iso:string): string {
  if(!iso) return '—';
  const [y,m,d]=iso.split('-');
  return `${d}/${m}/${y}`;
}

export function render(ctx: SlideCtx): string {
  const { proposta, dados: d } = ctx;
  const hoje=new Date(); const hojeStr=`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;
  const validadeISO=normalizarValidade(proposta.validade);
  const vencida=validadeISO!=='' && validadeISO < hojeStr;
  const validadeFmt = validadeISO ? formatarDataBR(validadeISO) : '—';
  const validadeDias = String(d.site_validade_dias||d.validade_proposta||'10');
  const emissaoISO = proposta.criado_em ? normalizarValidade(proposta.criado_em) : normalizarValidade(d.criado_em || new Date().toISOString());
  const emissaoFmt = emissaoISO ? formatarDataBR(emissaoISO) : '21/09/2026';
  const clienteNome = sanitizar(d.site_cliente_nome||proposta.cliente_nome||'Flávia Personal Chef');
  const numeroProp = extrairNumeroProposta(String(proposta.slug||''));
  const siteValorTotal = Number(proposta.valor_total ?? d.site_valor_total ?? 2200)||2200;
  const sitePrazo = String(d.site_prazo_dias||d.prazo_dias_uteis||'12');
  const valorFmt = formatarMoeda(siteValorTotal);
  const valorSemRS = valorFmt.replace('R$','').trim();
  const parteValor = valorSemRS.split(','); const valorInteiro = parteValor[0]||'2.200'; const valorCent = parteValor[1]?','+parteValor[1]:',00';

  const whatsappRaw = String(d.whatsapp_numero||'+55 27 9 8858-6935').replace(/\D/g,'');
  const whatsappMsgAprov = encodeURIComponent(`Olá! Li e aprovo a Proposta Comercial ${numeroProp} (Site ${clienteNome}). Podemos gerar o sinal e iniciar!`);
  const whatsappMsgDuvida = encodeURIComponent(`Olá! Gostaria de tirar uma dúvida sobre a Proposta Comercial ${numeroProp}.`);
  const emailContato = sanitizar(d.email_contato||'contato@wedistinto.com');
  const instaHandle = sanitizar(d.instagram_handle||'@distintowedding');

  let parcelas:any[] = Array.isArray(d.site_pagamento_parcelas) ? d.site_pagamento_parcelas : [];
  if(parcelas.length===0){
    const half=Math.round(siteValorTotal/2*100)/100;
    parcelas=[{n:1,label:'Na Aprovação (Sinal)',sub:'Início imediato dos trabalhos',valor:half,vencimento:'na_aprovacao'},{n:2,label:'Na Conclusão / Publicação',sub:'Antes da liberação oficial do domínio',valor:Math.round((siteValorTotal-half)*100)/100,vencimento:'na_entrega'}];
  }

  // 4 fases — conteúdo Stitch
  const fasesDefs = [
    { num:'01', titulo:'Planejamento', desc:'Mapeamento inicial para definir tom de voz e estrutura das páginas.', itens:['Reunião inicial de alinhamento','Triagem de fotos e cardápios','Definição do sitemap e seções','Orientações de textos estratégicos'] },
    { num:'02', titulo:'Design Visual', desc:'Direção de arte sob medida com foco na gastronomia fina.', itens:['Layout personalizado e autoral','Paleta de cores e tipografia de luxo','Valorização visual dos pratos','1 rodada de ajustes no layout'] },
    { num:'03', titulo:'Desenvolvimento', desc:'Programação moderna, limpa e com carregamento instantâneo.', itens:['Até 5 seções personalizadas','100% responsivo (Celular, Tablet, PC)','Botão flutuante para WhatsApp','Formulário condicional inteligente'] },
    { num:'04', titulo:'Testes & Ativação', desc:'Garantia técnica e conexão do domínio oficial.', itens:['Testes de usabilidade e botões','Otimização de imagens e cache','Configuração de domínio & SSL','Treinamento rápido de uso'] },
  ];
  const entregas: string[] = d.site_entregas||d.entregas||['Site 100% Responsivo','Layout Autoral & Exclusivo','Até 5 Seções Estruturadas','Galeria Gastronômica & Portfólio','Depoimentos & Credibilidade','Integração WhatsApp Direta','Formulário Condicional','Redes Sociais & Instagram','Publicação + 1 Rodada de Ajustes'];
  const entregasDesc: Record<string,string> = {
    'Site 100% Responsivo':'Navegação perfeita em smartphones, tablets e computadores de alta resolução.',
    'Layout Autoral & Exclusivo':'Nada de templates genéricos. Identidade alinhada ao público da gastronomia premium.',
    'Até 5 Seções Estruturadas':'Início impactante, Sobre a Chef, Experiências/Menus, Portfólio de Pratos e Contato direto.',
    'Galeria Gastronômica & Portfólio':'Apresentação visual apetitosa dos eventos anteriores e pratos autorais.',
    'Depoimentos & Credibilidade':'Módulo de avaliações de clientes satisfeitos para aumento imediato da taxa de conversão.',
    'Integração WhatsApp Direta':'Botão estratégico com mensagem de saudação pronta para receber solicitações de cotação.',
    'Formulário Condicional':'Campos inteligentes para o cliente informar data do evento, número de convidados e preferências.',
    'Redes Sociais & Instagram':'Links integrados para fortalecer a conexão dos visitantes com seus conteúdos diários.',
    'Publicação + 1 Rodada de Ajustes':'Lançamento oficial no domínio com garantia de revisão detalhada pós-apresentação.',
  };

  const fasesHtml = fasesDefs.map(f=>`
    <div class="bg-[#161821] p-6 border border-[#262a38] shadow-subtle hover:border-[#323749] transition-all flex flex-col">
      <div class="w-10 h-10 bg-[#1f222e] border border-[#262a38] flex items-center justify-center text-white font-bold text-sm mb-4">${f.num}</div>
      <h4 class="text-base font-bold text-white mb-2">${sanitizar(f.titulo)}</h4>
      <p class="text-xs text-slate-400 mb-4 leading-relaxed">${sanitizar(f.desc)}</p>
      <ul class="text-xs text-slate-300 space-y-2.5 mt-auto pt-4 border-t border-[#262a38]">
        ${f.itens.map(it=>`<li class="flex items-start"><span class="text-slate-400 mr-2 font-bold">•</span> ${sanitizar(it)}</li>`).join('')}
      </ul>
    </div>`).join('');

  const entregasHtml = entregas.map(t=>{
    const desc = entregasDesc[t] || '';
    return `<div class="p-4 bg-[#161821] border border-[#262a38] hover:border-[#323749] transition flex items-start space-x-3">
      <div class="w-6 h-6 bg-[#1f222e] border border-white/20 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="14" height="14" style="width:14px;height:14px" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path></svg>
      </div>
      <div><h5 class="text-sm font-semibold text-white">${sanitizar(t)}</h5>${desc?`<p class="text-xs text-slate-400 mt-0.5 leading-relaxed">${sanitizar(desc)}</p>`:''}</div>
    </div>`;
  }).join('');

  const responsa: string[] = d.site_responsabilidades||d.responsabilidades_cliente||['Logotipo e Identidade: Envio dos arquivos do logotipo em alta definição (PNG ou Vetor).','Textos e Conteúdo: Bio sobre a chef, descrição dos menus, pacotes de atendimento e serviços.','Fotografias Autorais: Fotos de pratos, ambientação e retrato pessoal com direito de uso liberado.','Depoimentos Reais: Prints ou mensagens de clientes para seção de prova social.','Acessos Técnicos: Login e senha da plataforma do domínio (ex: Registro.br) ou hospedagem caso já possua.'];
  const naoIncluso: string[] = d.site_nao_incluso||d.nao_incluso||['Sessão ou cobertura de ensaio fotográfico presencial.','Produção de vídeos gastronômicos ou edição de reels.','Criação ou reformulação de marca/branding/logo.','Taxas de anuidade do registro de domínio ou planos de hospedagem pagos diretamente aos provedores.','Loja virtual complexa com checkout ou pagamento online de pratos na plataforma.','Gestão contínua de tráfego pago (Google Ads / Meta Ads) ou gerenciamento mensal de redes sociais.'];

  const parcelasHtml = parcelas.map((p:any,i:number)=>`
    <div class="flex items-center justify-between p-4 bg-[#161821] border border-[#262a38]">
      <div class="flex items-center space-x-3">
        <span class="w-7 h-7 bg-[#1f222e] border border-white/20 text-white flex items-center justify-center text-xs font-bold">${p.n||i+1}</span>
        <div>
          <div class="text-xs uppercase tracking-wider text-slate-300 font-medium">${sanitizar(p.label)}</div>
          <div class="text-xs text-slate-400">${sanitizar(p.sub||humanizarVencimento(p.vencimento)||'')}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-lg font-bold text-white">${formatarMoeda(p.valor)}</div>
        <div class="text-[10px] text-slate-400 font-mono">${p.n===1?'50% do total':p.n===2?'50% do total':''}</div>
      </div>
    </div>`).join('');

  const heroImg = '/assets/flavia-hero-food.jpg';

  return `
<!-- Stitch Dark Corporate — Proposta #${numeroProp} — Projeto 6140402342488611140 / Screen 44c55b3b6bfb44e39acd421b7318c423 -->
<style>
  .site-dark-wrap { font-family: "Plus Jakarta Sans", system-ui, sans-serif; }
  @media print { .no-print { display:none !important; } }
</style>

<div class="site-dark-wrap bg-[#0b0c10] text-slate-100 antialiased pb-40 w-full overflow-x-hidden sm:-mx-[6vw] mx-0">
  <!-- TopHeader -->
  <header class="sticky top-0 z-40 bg-[#0b0c10]/95 backdrop-blur-md border-b border-[#262a38]">
    <div class="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
      <div class="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-[#161821] border border-white/20 text-white flex items-center justify-center font-bold text-sm sm:text-lg shadow-sm flex-shrink-0">${clienteNome.charAt(0).toUpperCase()}</div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-400 truncate">Proposta #${numeroProp}</span>
            <span class="inline-flex items-center px-1.5 py-0.5 text-[9px] sm:text-[11px] font-medium bg-[#1f222e] text-slate-200 border border-white/20 flex-shrink-0">
              <span class="w-1.5 h-1.5 bg-white mr-1 sm:mr-1.5 animate-pulse"></span>${vencida?'Vencida':'Aprovado'}
            </span>
          </div>
          <h1 class="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">${clienteNome}</h1>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <div class="hidden md:flex flex-col text-right mr-4 border-r border-[#262a38] pr-5">
          <span class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Emissão: ${emissaoFmt}</span>
          <span class="text-xs font-semibold text-slate-300">Validade: ${validadeDias} dias corridos</span>
        </div>
        <button class="no-print hidden sm:inline-flex items-center px-3.5 py-2 border border-[#262a38] shadow-sm text-xs font-medium text-slate-200 bg-[#161821] hover:bg-[#1f222e] hover:border-[#323749] transition" onclick="window.print()">
          <svg width="16" height="16" style="width:16px;height:16px" class="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
          Salvar em PDF
        </button>
        <a class="no-print inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-white text-[11px] sm:text-xs font-bold text-black bg-white hover:bg-slate-200 transition" href="#investimento">Aprovar Proposta
          <svg width="12" height="12" style="width:12px;height:12px" class="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 sm:ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-14 space-y-12 sm:space-y-20">
    <!-- Hero -->
    <section class="relative border-b border-[#262a38] pb-12 sm:pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-stretch">
        <div class="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-8">
          <div class="space-y-4 sm:space-y-5">
            <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#161821] border border-[#262a38] text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-slate-300 max-w-full"><span class="w-1.5 h-1.5 bg-white flex-shrink-0"></span><span class="truncate">Alta Gastronomia & Presença Digital Exclusiva</span></div>
            <h2 class="text-2xl sm:text-4xl md:text-6xl text-white leading-[1.1] font-bold tracking-tight break-words">Presença Digital à Altura da Chef.</h2>
            <p class="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">Criação de site institucional gastronômico autoral, cinematográfico e intimista. Projetado sob medida para posicionar ${clienteNome} no ápice da gastronomia privada, valorizando menus degustação e convertendo clientes seletos diretamente para o WhatsApp.</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#262a38]">
            <div class="p-4 bg-[#161821] border border-[#262a38] flex flex-col justify-between hover:border-[#323749] transition"><span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Investimento</span><div class="mt-2"><div class="text-xl font-bold text-white tracking-tight">${valorInteiro}</div><span class="text-[11px] text-slate-400 font-normal">à vista ou 2x</span></div></div>
            <div class="p-4 bg-[#161821] border border-[#262a38] flex flex-col justify-between hover:border-[#323749] transition"><span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Prazo</span><div class="mt-2"><div class="text-xl font-bold text-white tracking-tight">${sitePrazo} Dias</div><span class="text-[11px] text-slate-400 font-normal">úteis de entrega</span></div></div>
            <div class="p-4 bg-[#161821] border border-[#262a38] flex flex-col justify-between hover:border-[#323749] transition"><span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Formato</span><div class="mt-2"><div class="text-xl font-bold text-white tracking-tight">5 Seções</div><span class="text-[11px] text-slate-400 font-normal">arquitetura única</span></div></div>
            <div class="p-4 bg-[#161821] border border-[#262a38] flex flex-col justify-between hover:border-[#323749] transition"><span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Atendimento</span><div class="mt-2"><div class="text-xl font-bold text-white tracking-tight">Exclusivo</div><span class="text-[11px] text-slate-400 font-normal">direto com dev</span></div></div>
          </div>
        </div>
        <div class="lg:col-span-5 relative flex flex-col justify-end">
          <div class="relative w-full h-full min-h-[240px] lg:min-h-[380px] aspect-[16/9] lg:aspect-auto bg-[#161821] border border-[#262a38] overflow-hidden">
            <img src="${heroImg}" alt="Gastronomia de luxo — ${clienteNome}" class="w-full h-full object-cover object-center grayscale contrast-125 brightness-90 hover:grayscale-0 transition duration-700" onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&auto=format&fit=crop'">
            <div class="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-transparent opacity-60"></div>
            <div class="absolute bottom-4 left-4 right-4 p-4 bg-[#0b0c10]/90 backdrop-blur-md border border-[#262a38] flex items-center justify-between">
              <div class="flex items-center space-x-2.5"><span class="w-2 h-2 bg-white"></span><span class="text-xs font-semibold uppercase tracking-wider text-white">Identidade & Experiência Gastronômica</span></div>
              <span class="text-[11px] font-mono text-slate-400">Edição 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Escopo -->
    <section class="space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Fases do Projeto</span><h3 class="text-3xl font-bold text-white tracking-tight mt-1">Escopo Incluído & Metodologia</h3></div>
        <p class="text-sm text-slate-400 max-w-md">Fluxo transparente dividido em 4 frentes estruturadas para garantir fidelidade visual, rapidez técnica e foco em resultados.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">${fasesHtml}</div>
    </section>

    <!-- Entregas -->
    <section class="space-y-6">
      <div class="border-b border-[#262a38] pb-4"><span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Checklist de Itens</span><h3 class="text-3xl font-bold text-white tracking-tight mt-1">Entregas Previstas</h3><p class="text-sm text-slate-400 mt-1">Tudo o que estará integrado e funcionando no endereço final do site.</p></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4">${entregasHtml}</div>
    </section>

    <!-- Cronograma -->
    <section class="space-y-8">
      <div class="border-b border-[#262a38] pb-4 flex flex-col md:flex-row md:items-end justify-between">
        <div><span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Previsibilidade</span><h3 class="text-3xl font-bold text-white tracking-tight mt-1">Cronograma & Estimativa de Prazo</h3></div>
        <div class="mt-2 md:mt-0 text-sm font-semibold text-slate-300 bg-[#161821] px-3.5 py-1.5 border border-[#262a38] inline-block">Prazo Estimado: <strong class="text-white font-bold">${sitePrazo} Dias Úteis</strong></div>
      </div>
      <!-- Desktop: horizontal -->
      <div class="relative hidden md:block">
        <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-[#262a38] -translate-y-1/2 z-0"></div>
        <div class="grid grid-cols-4 gap-6 relative z-10">
          <div class="bg-[#161821] p-5 border border-[#262a38] shadow-sm relative hover:border-[#323749] transition"><div class="flex items-center justify-between mb-2"><span class="px-2 py-0.5 text-xs font-bold bg-[#1f222e] text-white border border-[#262a38]">D+0</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kick-off</span></div><h5 class="text-sm font-bold text-white">Aprovação & Briefing</h5><p class="text-xs text-slate-400 mt-1 leading-relaxed">Confirmação da proposta, pagamento do sinal e recebimento dos materiais da chef.</p></div>
          <div class="bg-[#161821] p-5 border border-[#262a38] shadow-sm relative hover:border-[#323749] transition"><div class="flex items-center justify-between mb-2"><span class="px-2 py-0.5 text-xs font-bold bg-[#1f222e] text-white border border-[#262a38]">D+3</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Apresentação</span></div><h5 class="text-sm font-bold text-white">Protótipo Visual</h5><p class="text-xs text-slate-400 mt-1 leading-relaxed">Envio do conceito visual, tipografia e estrutura para validação de estilo da cliente.</p></div>
          <div class="bg-[#161821] p-5 border border-[#262a38] shadow-sm relative hover:border-[#323749] transition"><div class="flex items-center justify-between mb-2"><span class="px-2 py-0.5 text-xs font-bold bg-[#1f222e] text-white border border-[#262a38]">D+8</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Construção</span></div><h5 class="text-sm font-bold text-white">Programação do Site</h5><p class="text-xs text-slate-400 mt-1 leading-relaxed">Codificação responsiva, montagem das galerias, testes de performance e botões WhatsApp.</p></div>
          <div class="bg-[#161821] p-5 border border-white/40 shadow-sm relative hover:border-white transition"><div class="flex items-center justify-between mb-2"><span class="px-2 py-0.5 text-xs font-bold bg-white text-black border border-white">D+12</span><span class="text-[11px] font-bold text-white uppercase tracking-wider">Go-Live</span></div><h5 class="text-sm font-bold text-white">Ajustes & Lançamento</h5><p class="text-xs text-slate-400 mt-1 leading-relaxed">Rodada final de ajustes consolidados, configuração do domínio e entrega do site no ar.</p></div>
        </div>
      </div>
      <!-- Mobile: vertical (Executiva Minimalista - Stitch 60dc4b33) -->
      <div class="md:hidden relative pl-5 border-l-2 border-[#272935] space-y-4 ml-1">
        <div class="relative bg-[#16181f] p-3.5 border border-[#272935]"><div class="absolute -left-[27px] top-3 w-3 h-3 bg-[#1e2029] border border-white"></div><div class="flex items-center justify-between mb-1"><span class="px-1.5 py-0.5 text-[10px] font-bold bg-[#1e2029] text-white border border-[#272935]">D+0</span><span class="text-[10px] font-bold text-slate-400 uppercase">Kick-off</span></div><h5 class="text-xs font-bold text-white">Aprovação & Briefing</h5><p class="text-[11px] text-slate-400 mt-1 leading-relaxed">Confirmação da proposta, pagamento do sinal e recebimento dos materiais da chef.</p></div>
        <div class="relative bg-[#16181f] p-3.5 border border-[#272935]"><div class="absolute -left-[27px] top-3 w-3 h-3 bg-[#1e2029] border border-slate-400"></div><div class="flex items-center justify-between mb-1"><span class="px-1.5 py-0.5 text-[10px] font-bold bg-[#1e2029] text-white border border-[#272935]">D+3</span><span class="text-[10px] font-bold text-slate-400 uppercase">Apresentação</span></div><h5 class="text-xs font-bold text-white">Protótipo Visual</h5><p class="text-[11px] text-slate-400 mt-1 leading-relaxed">Envio do conceito visual, tipografia e estrutura para validação de estilo da cliente.</p></div>
        <div class="relative bg-[#16181f] p-3.5 border border-[#272935]"><div class="absolute -left-[27px] top-3 w-3 h-3 bg-[#1e2029] border border-slate-400"></div><div class="flex items-center justify-between mb-1"><span class="px-1.5 py-0.5 text-[10px] font-bold bg-[#1e2029] text-white border border-[#272935]">D+8</span><span class="text-[10px] font-bold text-slate-400 uppercase">Construção</span></div><h5 class="text-xs font-bold text-white">Programação do Site</h5><p class="text-[11px] text-slate-400 mt-1 leading-relaxed">Codificação responsiva, montagem das galerias, testes de performance e botões WhatsApp.</p></div>
        <div class="relative bg-[#16181f] p-3.5 border border-white"><div class="absolute -left-[27px] top-3 w-3 h-3 bg-white"></div><div class="flex items-center justify-between mb-1"><span class="px-1.5 py-0.5 text-[10px] font-bold bg-white text-black border border-white">D+12</span><span class="text-[10px] font-bold text-white uppercase">Go-Live</span></div><h5 class="text-xs font-bold text-white">Ajustes & Lançamento</h5><p class="text-[11px] text-slate-400 mt-1 leading-relaxed">Rodada final de ajustes consolidados, configuração do domínio e entrega do site no ar.</p></div>
      </div>
      <p class="text-xs text-slate-400 italic">* Os prazos começam a contar no primeiro dia útil subsequente à confirmação do sinal e entrega de todos os conteúdos essenciais (fotos, textos e acessos).</p>
    </section>

    <!-- Investimento -->
    <section class="space-y-6 pt-4" id="investimento">
      <div class="border-b border-[#262a38] pb-4"><span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Condições Comerciais</span><h3 class="text-3xl font-bold text-white tracking-tight mt-1">Investimento & Forma de Pagamento</h3></div>
      <div class="bg-[#161821] border border-[#262a38] text-white p-6 sm:p-10 shadow-premium relative overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div class="lg:col-span-6 space-y-4">
            <span class="text-xs uppercase tracking-widest font-semibold text-slate-400">Valor Total do Projeto Fechado</span>
            <div class="flex items-baseline space-x-2"><span class="text-5xl sm:text-6xl font-bold text-white tracking-tight">R$ ${valorInteiro}</span><span class="text-slate-400 text-sm">${valorCent}</span></div>
            <p class="text-slate-400 text-sm max-w-sm leading-relaxed">Valor integral para desenvolvimento completo, sem custos ocultos de implementação dentro do escopo detalhado.</p>
            <div class="pt-2 flex flex-wrap gap-2 text-xs"><span class="bg-[#1f222e] text-slate-300 px-3 py-1 border border-[#262a38]">PIX</span><span class="bg-[#1f222e] text-slate-300 px-3 py-1 border border-[#262a38]">Boleto Bancário</span><span class="bg-[#1f222e] text-slate-300 px-3 py-1 border border-[#262a38]">Nota Fiscal Inclusa</span></div>
          </div>
          <div class="lg:col-span-6 bg-[#101217] p-6 border border-[#262a38] space-y-4">
            <h4 class="text-xs font-semibold text-slate-300 tracking-wider uppercase">Parcelamento Padrão Facilitado (${parcelas.length}x)</h4>
            ${parcelasHtml}
            <div class="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-[#262a38]">
              <span>Validade desta proposta: <strong class="text-slate-200">${validadeDias} dias corridos</strong></span>
              <span class="${vencida?'text-red-400':'text-white'} font-medium">${vencida?'VENCIDA EM '+validadeFmt:'Válida até '+validadeFmt}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Responsabilidades -->
    <section class="space-y-8">
      <div class="border-b border-[#262a38] pb-4"><span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Clareza Contratual</span><h3 class="text-3xl font-bold text-white tracking-tight mt-1">Alinhamento de Responsabilidades</h3></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-[#161821] p-6 sm:p-8 border border-[#262a38] shadow-subtle space-y-4">
          <div class="flex items-center space-x-2.5"><div class="w-7 h-7 bg-[#1f222e] border border-white/20 text-white flex items-center justify-center font-bold text-xs">✓</div><h4 class="text-lg font-bold text-white">Responsabilidades da Cliente</h4></div>
          <p class="text-xs text-slate-400 leading-relaxed">Para mantermos o cronograma rigoroso de ${sitePrazo} dias úteis, o fornecimento dos seguintes insumos é de responsabilidade da cliente:</p>
          <ul class="text-xs text-slate-300 space-y-2.5 pt-2">
            ${responsa.map(r=>`<li class="flex items-start"><span class="text-slate-500 mr-2 font-bold">•</span><span>${sanitizar(r)}</span></li>`).join('')}
          </ul>
        </div>
        <div class="bg-[#161821] p-6 sm:p-8 border border-[#262a38] shadow-subtle space-y-4">
          <div class="flex items-center space-x-2.5"><div class="w-7 h-7 bg-[#1f222e] border border-[#262a38] text-slate-400 flex items-center justify-center font-bold text-xs">✕</div><h4 class="text-lg font-bold text-white">Não Incluso no Escopo Base</h4></div>
          <p class="text-xs text-slate-400 leading-relaxed">Serviços opcionais não contemplados nesta proposta de desenvolvimento institucional, mas que podem ser orçados separadamente:</p>
          <ul class="text-xs text-slate-300 space-y-2.5 pt-2">
            ${naoIncluso.map(n=>`<li class="flex items-start"><span class="text-slate-500 mr-2 font-bold">•</span><span>${sanitizar(n)}</span></li>`).join('')}
          </ul>
        </div>
      </div>
    </section>

    <!-- Revisão -->
    <section class="bg-[#161821] p-6 sm:p-8 border border-[#262a38] mb-24">
      <div class="max-w-3xl space-y-3">
        <h4 class="text-base font-bold text-white flex items-center"><svg width="20" height="20" style="width:20px;height:20px" class="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>Garantia de Revisão e Suporte</h4>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed"><strong class="text-white font-semibold">Revisões Inclusas:</strong> O projeto contempla 1 rodada de ajustes consolidados na etapa de layout e 1 rodada de correções finais pontuais na homologação. Solicitações fora do escopo ou reestruturações completas pós-aprovação serão avaliadas sob taxa adicional de horas técnicas.</p>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed"><strong class="text-white font-semibold">Suporte Técnico:</strong> Oferecemos 15 dias de garantia após a publicação oficial para correção de qualquer instabilidade técnica ou dúvida sobre operação básica.</p>
      </div>
    </section>
  </main>

  <!-- FloatingBar — Desktop: side-by-side | Mobile: stacked + 2-col grid (Stitch 60dc4b33) -->
  <aside class="no-print fixed bottom-0 left-0 right-0 z-50 bg-[#0b0c10]/95 backdrop-blur-md border-t border-[#262a38] text-white py-3 px-4 sm:py-3.5 shadow-2xl">
    <!-- Desktop -->
    <div class="hidden sm:flex max-w-6xl mx-auto items-center justify-between gap-3">
      <div class="flex items-center space-x-4">
        <div><span class="text-[11px] text-slate-400 uppercase tracking-widest block font-medium">Proposta ${clienteNome}</span><div class="flex items-baseline space-x-1.5"><span class="text-xl font-bold text-white">${valorFmt}</span><span class="text-xs text-slate-400">(em até ${parcelas.length}x de ${formatarMoeda(parcelas[0]?.valor||0)})</span></div></div>
      </div>
      <div class="flex items-center gap-3">
        <a class="inline-flex items-center justify-center px-4 py-2.5 border border-[#262a38] hover:border-[#323749] bg-[#161821] text-xs font-medium text-slate-300 hover:text-white transition" href="https://wa.me/${whatsappRaw}?text=${whatsappMsgDuvida}" target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" style="width:16px;height:16px" class="w-4 h-4 mr-1.5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
          Tirar Dúvidas
        </a>
        <button class="inline-flex items-center justify-center px-5 py-2.5 bg-white hover:bg-slate-200 text-black font-bold text-xs tracking-wide shadow-md transition" onclick="document.getElementById('approvalModal').classList.remove('hidden');document.getElementById('approvalModal').classList.add('flex')">
          Aprovar Proposta & Iniciar
          <svg width="16" height="16" style="width:16px;height:16px" class="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path></svg>
        </button>
      </div>
    </div>
    <!-- Mobile (Executiva Minimalista) -->
    <div class="sm:hidden max-w-md mx-auto space-y-2">
      <div class="flex items-center justify-between text-[11px]"><span class="text-slate-400 font-medium">Total: <strong class="text-white">${valorFmt}</strong> (${parcelas.length}x ${formatarMoeda(parcelas[0]?.valor||0)})</span><span class="text-slate-400">${sitePrazo} dias úteis</span></div>
      <div class="grid grid-cols-2 gap-2">
        <a class="inline-flex items-center justify-center py-2.5 px-3 border border-[#272935] bg-[#16181f] hover:bg-[#1e2029] text-[11px] font-semibold text-slate-200 transition" href="https://wa.me/${whatsappRaw}?text=${whatsappMsgDuvida}" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" style="width:14px;height:14px" class="w-3.5 h-3.5 mr-1.5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
          Tirar Dúvidas
        </a>
        <button class="inline-flex items-center justify-center py-2.5 px-3 bg-white hover:bg-slate-200 text-black font-bold text-[11px] tracking-wide shadow transition" onclick="document.getElementById('approvalModal').classList.remove('hidden');document.getElementById('approvalModal').classList.add('flex')">
          Aprovar Proposta
          <svg width="14" height="14" style="width:14px;height:14px" class="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path></svg>
        </button>
      </div>
    </div>
  </aside>

  <!-- Modal -->
  <div id="approvalModal" class="no-print fixed inset-0 z-50 bg-[#0b0c10]/85 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-[#161821] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-[#262a38]">
      <button class="absolute top-5 right-5 text-slate-400 hover:text-white" onclick="document.getElementById('approvalModal').classList.add('hidden');document.getElementById('approvalModal').classList.remove('flex')">
        <svg width="24" height="24" style="width:24px;height:24px" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
      </button>
      <div class="text-center space-y-3">
        <div class="w-12 h-12 bg-[#1f222e] border border-white/20 text-white flex items-center justify-center mx-auto"><svg width="24" height="24" style="width:24px;height:24px" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></div>
        <h3 class="text-2xl font-bold text-white tracking-tight">Aprovação do Projeto</h3>
        <p class="text-xs sm:text-sm text-slate-300">Você está prestes a aprovar a proposta comercial para o desenvolvimento do site institucional <strong>${clienteNome}</strong>.</p>
      </div>
      <div class="mt-6 p-4 bg-[#101217] border border-[#262a38] text-xs space-y-2">
        <div class="flex justify-between"><span class="text-slate-400">Valor Acordado:</span><span class="font-bold text-white">${valorFmt}</span></div>
        <div class="flex justify-between"><span class="text-slate-400">1º Sinal (50%):</span><span class="font-bold text-white">${formatarMoeda(parcelas[0]?.valor||0)} (PIX ou Boleto)</span></div>
        <div class="flex justify-between"><span class="text-slate-400">Prazo de entrega:</span><span class="font-bold text-white">${sitePrazo} dias úteis</span></div>
      </div>
      <div class="mt-6 space-y-3">
        <a class="w-full inline-flex items-center justify-center px-4 py-3 bg-white hover:bg-slate-200 text-black font-bold text-sm tracking-wide shadow-md transition" href="https://wa.me/${whatsappRaw}?text=${whatsappMsgAprov}" target="_blank" rel="noopener noreferrer">Confirmar Aprovação via WhatsApp
          <svg width="16" height="16" style="width:16px;height:16px" class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
        </a>
        <button class="w-full text-center text-xs text-slate-400 hover:text-white py-1" onclick="document.getElementById('approvalModal').classList.add('hidden');document.getElementById('approvalModal').classList.remove('flex')">Voltar e revisar detalhes</button>
      </div>
    </div>
  </div>
  <script>
    (function(){
      var m=document.getElementById('approvalModal');
      if(m) window.addEventListener('click', function(e){ if(e.target===m){ m.classList.add('hidden'); m.classList.remove('flex'); } });
    })();
  </script>
</div>
`;
}
