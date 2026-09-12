import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { briefingVideoConfig, BriefingVideoSection, BriefingVideoField } from '@/lib/propostas/form-briefing-video';
import { LgpdConsent } from '@/components/LgpdConsent';

const HERO_IMG = '/imagens-proposta-casamento/bg-section-01.jpg';
const LOGO = '/assets/distinto_logo.svg';

export default function BriefingVideoPage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lgpdAceito, setLgpdAceito] = useState(false);
  const [erroLgpd, setErroLgpd] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [nomeClienteUrl, setNomeClienteUrl] = useState('');
  const [empresaUrl, setEmpresaUrl] = useState('');
  const [clienteIdUrl, setClienteIdUrl] = useState('');

  // Pré-preenchimento via query: ?cliente=, ?empresa=, ?id=, ?cliente_id=, ?whatsapp=, ?email=
  useEffect(() => {
    if (!router.isReady) return;
    const getQ = (keys: string[]): string => {
      for (const k of keys) {
        const raw = router.query[k];
        if (raw) {
          let v = Array.isArray(raw) ? raw[0] : String(raw);
          try {
            if (/%[0-9A-Fa-f]{2}/.test(v)) v = decodeURIComponent(v);
          } catch {}
          v = v.replace(/[\r\n\t\x00-\x1F]/g, ' ').trim().slice(0, 255);
          if (v) return v;
        }
      }
      return '';
    };

    const nomeQ = getQ(['cliente', 'nome', 'nome_cliente', 'noivos', 'casal']);
    const empresaQ = getQ(['empresa', 'marca']);
    const idQ = getQ(['id', 'cliente_id', 'clienteId']);
    const whatsappQ = getQ(['whatsapp', 'telefone', 'tel']);
    const emailQ = getQ(['email']);

    if (nomeQ) {
      setNomeClienteUrl(nomeQ);
      setValues((prev) => ({ ...prev, nome_cliente: nomeQ }));
    }
    if (empresaQ) {
      setEmpresaUrl(empresaQ);
      setValues((prev) => ({ ...prev, empresa: empresaQ }));
    }
    if (idQ) setClienteIdUrl(idQ);
    if (whatsappQ) setValues((prev) => ({ ...prev, whatsapp: whatsappQ }));
    if (emailQ) setValues((prev) => ({ ...prev, email: emailQ }));

    // Busca no banco se tiver id
    if (idQ) {
      fetch(`/api/clientes/${encodeURIComponent(idQ)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          const cli = data.cliente || data || {};
          setValues((prev) => {
            const next = { ...prev };
            if (cli.nome && !next['nome_cliente']) {
              const n = String(cli.nome).slice(0, 255);
              next['nome_cliente'] = n;
              setNomeClienteUrl(n);
            }
            if ((cli.empresa || cli.razao_social) && !next['empresa']) {
              const e = String(cli.empresa || cli.razao_social).slice(0, 255);
              next['empresa'] = e;
              setEmpresaUrl(e);
            }
            if (cli.telefone && !next['whatsapp']) next['whatsapp'] = String(cli.telefone).slice(0, 30);
            if (cli.email && !next['email']) next['email'] = String(cli.email).slice(0, 255);
            return next;
          });
        })
        .catch(() => {});
      // Fallback: tenta /api/clientes?id=
      fetch(`/api/clientes?id=${encodeURIComponent(idQ)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          const list = Array.isArray(data) ? data : data.clientes || data.rows || [];
          const cli = Array.isArray(list) ? list.find((c: any) => String(c.id) === idQ) : null;
          if (!cli) return;
          setValues((prev) => {
            const next = { ...prev };
            if (cli.nome && !next['nome_cliente']) {
              const n = String(cli.nome).slice(0, 255);
              next['nome_cliente'] = n;
              setNomeClienteUrl(n);
            }
            if ((cli.empresa || cli.razao_social) && !next['empresa']) {
              const e = String(cli.empresa || cli.razao_social).slice(0, 255);
              next['empresa'] = e;
              setEmpresaUrl(e);
            }
            if (cli.telefone && !next['whatsapp']) next['whatsapp'] = String(cli.telefone).slice(0, 30);
            if (cli.email && !next['email']) next['email'] = String(cli.email).slice(0, 255);
            return next;
          });
        })
        .catch(() => {});
    }
  }, [router.isReady, router.query]);

  const getVal = (id: string): string => {
    const v = values[id];
    return Array.isArray(v) ? '' : (v as string) || '';
  };
  const getArrayVal = (id: string): string[] => {
    const v = values[id];
    return Array.isArray(v) ? (v as string[]) : [];
  };

  const setVal = (id: string, v: string) => {
    if (v.length > 5000) v = v.slice(0, 5000);
    setValues((prev) => ({ ...prev, [id]: v }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const setArrayVal = (id: string, option: string, checked: boolean) => {
    setValues((prev) => {
      const cur = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = checked ? [...cur, option] : cur.filter((o) => o !== option);
      return { ...prev, [id]: next };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroEnvio('');
    setErroLgpd('');

    const errMap: Record<string, string> = {};
    for (const section of briefingVideoConfig.sections) {
      for (const field of section.fields) {
        if (!field.required) continue;
        const raw = values[field.id];
        const empty =
          raw === undefined ||
          raw === null ||
          (Array.isArray(raw) && raw.length === 0) ||
          (typeof raw === 'string' && String(raw).trim() === '');
        if (empty) errMap[field.id] = 'Este campo é obrigatório.';
      }
    }
    // Validação extra: quando objetivo = Outro, referência pode ser texto livre - não bloqueia
    if (Object.keys(errMap).length > 0) {
      setErrors(errMap);
      const firstId = Object.keys(errMap)[0];
      document.getElementById(firstId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!lgpdAceito) {
      setErroLgpd('É necessário concordar com os Termos de Privacidade (LGPD) para enviar o briefing.');
      return;
    }

    setEnviando(true);
    try {
      const sanitized: Record<string, any> = {};
      for (const [k, v] of Object.entries(values)) {
        if (Array.isArray(v)) sanitized[k] = v.map((x) => String(x).trim()).slice(0, 20);
        else {
          let nv = typeof v === 'string' ? v.trim() : String(v ?? '');
          if (nv.length > 5000) nv = nv.slice(0, 5000);
          sanitized[k] = nv;
        }
      }
      if (clienteIdUrl) sanitized['cliente_id'] = clienteIdUrl.slice(0, 64);
      if (sanitized['nome_cliente']) sanitized['nome_cliente'] = String(sanitized['nome_cliente']).slice(0, 255);
      if (sanitized['empresa']) sanitized['empresa'] = String(sanitized['empresa']).slice(0, 255);

      let res: Response;
      let text = '';
      try {
        res = await fetch('/api/briefings/video-enviar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...sanitized,
            tipo: 'video_produtora',
            lgpd_aceito: true,
            lgpd_data_aceite: new Date().toISOString(),
          }),
        });
        text = await res.text();
      } catch (err: any) {
        throw new Error(err?.message || 'Falha de conexão ao enviar briefing');
      }
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(text?.slice(0, 300) || 'Resposta inválida do servidor');
      }
      if (res!.ok && data.ok) {
        setEnviado(true);
      } else {
        setErroEnvio(data.erro || data.detail || 'Não foi possível enviar o briefing. Tente novamente.');
      }
    } catch (err: any) {
      setErroEnvio(err?.message || 'Erro de conexão com o servidor. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const renderField = (field: BriefingVideoField) => {
    const val = getVal(field.id);
    const arrVal = getArrayVal(field.id);

    if (field.type === 'radio') {
      return (
        <div className="orc-options">
          {(field.options || []).map((opt) => (
            <label key={opt} className={`orc-option ${val === opt ? 'selected' : ''}`}>
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={val === opt}
                onChange={() => setVal(field.id, opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div className="orc-options">
          {(field.options || []).map((opt) => (
            <label key={opt} className={`orc-option ${arrVal.includes(opt) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                checked={arrVal.includes(opt)}
                onChange={(e) => setArrayVal(field.id, opt, e.target.checked)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <select
          id={field.id}
          className="orc-input"
          value={val}
          onChange={(e) => setVal(field.id, e.target.value)}
        >
          <option value="">Selecione uma opção</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          id={field.id}
          className="orc-input orc-textarea"
          value={val}
          onChange={(e) => setVal(field.id, e.target.value)}
          placeholder={field.placeholder || 'Digite aqui com o máximo de detalhes...'}
          rows={3}
        />
      );
    }

    return (
      <input
        id={field.id}
        type={
          field.type === 'tel'
            ? 'tel'
            : field.type === 'email'
              ? 'email'
              : field.type === 'date'
                ? 'date'
                : 'text'
        }
        className="orc-input"
        value={val}
        onChange={(e) => setVal(field.id, e.target.value)}
        placeholder={field.placeholder || ''}
      />
    );
  };

  if (enviado) {
    return (
      <>
        <Head>
          <title>Briefing Recebido | Distinto Produtora</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="orc-page">
          <div className="orc-success">
            <div className="orc-success-badge">🎬</div>
            <h1>Briefing de Vídeo Recebido!</h1>
            <p>
              Muito obrigado, <strong>{getVal('nome_cliente') || nomeClienteUrl || 'parceiro'}</strong>
              {empresaUrl || getVal('empresa') ? ` — ${empresaUrl || getVal('empresa')}` : ''}!
              Com essas informações nossa equipe de filmmaker vai montar um orçamento preciso e te retornar em breve no WhatsApp/e-mail informados.
            </p>
            <p className="mt-4 text-xs text-amber-300 font-mono">
              Se lembrar de mais alguma referência, é só nos chamar. ✨
            </p>
          </div>
          <style jsx global>{globalStyles}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{briefingVideoConfig.form_title} | Distinto Produtora</title>
        <meta name="description" content={briefingVideoConfig.form_description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Dancing+Script:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="orc-page">
        <header className="orc-hero">
          <div className="orc-hero-bg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
          <div className="orc-hero-overlay" />
          <div className="orc-hero-content">
            <img src={LOGO} alt="Distinto" className="orc-logo" />
            <p className="orc-kicker">FILMMAKER & PRODUTORA</p>

            {nomeClienteUrl ? (
              <div className="mb-4">
                <span className="orc-greeting">Olá, {nomeClienteUrl}! 🎬</span>
                {empresaUrl && <span className="block text-sm text-white/70 mt-1">{empresaUrl}</span>}
                <h1 className="orc-title mt-2">
                  Briefing para <em>Orçamento de Vídeo</em>
                </h1>
              </div>
            ) : (
              <h1 className="orc-title">
                Briefing para <em>Orçamento de Vídeo</em>
              </h1>
            )}

            <p className="orc-subtitle">{briefingVideoConfig.form_description}</p>
            {clienteIdUrl && (
              <p className="text-[11px] text-white/50 mt-2 font-mono">Cliente #{clienteIdUrl.slice(0, 12)}</p>
            )}
          </div>
        </header>

        <main className="orc-main">
          <form onSubmit={handleSubmit} noValidate>
            {briefingVideoConfig.sections.map((section: BriefingVideoSection) => (
              <section key={section.section_name} className="orc-section">
                <div className="orc-section-header">
                  <span className="orc-section-line" />
                  <h2>{section.section_name}</h2>
                </div>

                {section.description && (
                  <p className="text-xs text-amber-200/80 mb-4 font-light italic">{section.description}</p>
                )}

                <div className="orc-section-body">
                  {section.fields.map((field) => {
                    const err = errors[field.id];
                    return (
                      <div className="orc-field" key={field.id}>
                        <label htmlFor={field.id}>
                          {field.label}
                          {field.required && <span className="orc-required">*</span>}
                        </label>
                        {renderField(field)}
                        {err && <span className="orc-error">{err}</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            <LgpdConsent
              checkboxChecked={lgpdAceito}
              onCheckboxChange={(checked) => {
                setLgpdAceito(checked);
                if (checked) setErroLgpd('');
              }}
              requiredError={erroLgpd}
            />

            {erroEnvio && <div className="orc-submit-error">{erroEnvio}</div>}

            <div className="orc-submit-wrap">
              <button type="submit" className="orc-submit" disabled={enviando}>
                {enviando ? 'Enviando Briefing...' : 'Enviar Briefing de Vídeo'}
              </button>
              <p className="orc-privacy">
                Suas respostas são armazenadas com segurança conforme a LGPD (Lei nº 13.709/2018).
              </p>
            </div>
          </form>
        </main>

        <footer className="orc-footer">
          <span>DISTINTO | PRODUTORA</span>
          <span>© {new Date().getFullYear()} — Filmmaker & Conteúdo • Proteção de Dados LGPD</span>
        </footer>
      </div>

      <style jsx global>{globalStyles}</style>
    </>
  );
}

const globalStyles = `
  .orc-page {
    background: #0a0a0a;
    color: #eaeaea;
    min-height: 100vh;
    font-family: 'Montserrat', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .orc-hero {
    position: relative;
    height: 55vh;
    min-height: 420px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }
  .orc-hero-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
  }
  .orc-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.65) 55%, #0a0a0a 100%);
  }
  .orc-hero-content {
    position: relative;
    z-index: 2;
    max-width: 820px;
    margin: 0 auto;
    width: 100%;
    padding: 44px 28px 48px;
    text-align: center;
  }
  .orc-logo { height: 34px; margin: 0 auto 16px; opacity: 0.92; display: block; }
  .orc-kicker {
    font-size: 11px;
    letter-spacing: 0.42em;
    color: #c5a880;
    font-weight: 600;
    margin: 0 0 12px;
    text-transform: uppercase;
  }
  .orc-greeting {
    font-family: 'Dancing Script', cursive;
    font-size: 2rem;
    color: #c5a880;
    display: inline-block;
  }
  .orc-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5.5vw, 3.2rem);
    font-weight: 400;
    line-height: 1.15;
    margin: 0 0 14px;
    color: #fff;
  }
  .orc-title em {
    font-family: 'Dancing Script', cursive;
    color: #c5a880;
    font-style: normal;
    font-weight: 600;
  }
  .orc-subtitle {
    font-size: 14px;
    font-weight: 300;
    line-height: 1.6;
    color: rgba(255,255,255,0.78);
    max-width: 580px;
    margin: 0 auto;
  }
  .orc-main {
    max-width: 780px;
    margin: 0 auto;
    padding: 8px 24px 40px;
  }
  .orc-section {
    margin-bottom: 44px;
  }
  .orc-section-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
  }
  .orc-section-line {
    width: 34px;
    height: 1px;
    background: #c5a880;
    flex-shrink: 0;
  }
  .orc-section-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 500;
    color: #fff;
    letter-spacing: 0.02em;
    margin: 0;
  }
  .orc-section-body {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .orc-field label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #cfcfcf;
    margin-bottom: 10px;
    line-height: 1.5;
  }
  .orc-required { color: #c5a880; margin-left: 4px; }
  .orc-input {
    width: 100%;
    background: #121212;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 14px;
    font-family: 'Montserrat', sans-serif;
    color: #fff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .orc-input:focus {
    border-color: #c5a880;
    box-shadow: 0 0 0 3px rgba(197,168,128,0.14);
  }
  .orc-input::placeholder { color: #555; }
  .orc-textarea { resize: vertical; min-height: 88px; line-height: 1.6; }
  input[type="date"].orc-input::-webkit-calendar-picker-indicator,
  input[type="time"].orc-input::-webkit-calendar-picker-indicator { filter: invert(0.7); }
  select.orc-input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23c5a880' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 42px;
  }
  select.orc-input option { background: #121212; color: #fff; }
  .orc-options { display: flex; flex-wrap: wrap; gap: 10px; }
  .orc-option {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #121212;
    border: 1px solid #2a2a2a;
    border-radius: 999px;
    padding: 10px 18px;
    cursor: pointer;
    font-size: 13px;
    color: #cfcfcf;
    transition: all 0.2s;
    user-select: none;
  }
  .orc-option:hover { border-color: #444; }
  .orc-option.selected {
    background: rgba(197,168,128,0.14);
    border-color: #c5a880;
    color: #f0e6d6;
  }
  .orc-option input { display: none; }
  .orc-error {
    display: block;
    font-size: 12px;
    color: #ff8a80;
    margin-top: 7px;
  }
  .orc-submit-error {
    background: rgba(255,138,128,0.08);
    border: 1px solid rgba(255,138,128,0.35);
    color: #ff8a80;
    font-size: 13px;
    padding: 14px 16px;
    border-radius: 12px;
    margin-bottom: 22px;
  }
  .orc-submit-wrap { text-align: center; padding: 10px 0 30px; }
  .orc-submit {
    background: #c5a880;
    color: #1a1a1a;
    border: none;
    border-radius: 999px;
    padding: 16px 44px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.25s;
  }
  .orc-submit:hover:not(:disabled) { background: #d4b78f; transform: translateY(-2px); }
  .orc-submit:disabled { opacity: 0.55; cursor: not-allowed; }
  .orc-privacy {
    font-size: 11px;
    color: #666;
    margin: 16px auto 0;
    max-width: 400px;
    line-height: 1.6;
  }
  .orc-footer {
    border-top: 1px solid #1c1c1c;
    padding: 26px 20px 36px;
    text-align: center;
    font-size: 11px;
    letter-spacing: 0.24em;
    color: #555;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .orc-footer span:first-child { color: #c5a880; font-weight: 600; }

  .orc-success {
    max-width: 580px;
    margin: 0 auto;
    padding: 18vh 24px;
    text-align: center;
  }
  .orc-success-badge {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    border: 1px solid #c5a880;
    color: #c5a880;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin: 0 auto 26px;
  }
  .orc-success h1 {
    font-family: 'Playfair Display', serif;
    font-weight: 500;
    font-size: 28px;
    color: #fff;
    margin: 0 0 16px;
  }
  .orc-success p {
    font-size: 15px;
    line-height: 1.8;
    color: #b5b5b5;
  }
  .orc-success strong { color: #c5a880; }

  @media (max-width: 640px) {
    .orc-hero { height: 50vh; min-height: 380px; }
    .orc-hero-content { padding: 32px 18px 36px; }
    .orc-main { padding: 8px 18px 30px; }
  }
`;
