import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { generateId } from '@/lib/helpers';
import { brevoService } from '@/lib/brevo';
import { briefingVideoConfig } from '@/lib/propostas/form-briefing-video';

const EMAIL_DESTINO =
  process.env.BRIEFING_VIDEO_EMAIL_DESTINO ||
  process.env.BRIEFING_EMAIL_DESTINO ||
  process.env.ORCAMENTO_EMAIL_DESTINO ||
  'ola@wedistinto.com';

function esc(v: string): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatVal(v: any): string {
  if (Array.isArray(v)) return v.join(', ');
  return String(v ?? '');
}

function buildVideoEmailHtml(dados: Record<string, any>, clienteNome: string, empresa: string): string {
  let sectionsHtml = '';
  for (const section of briefingVideoConfig.sections) {
    let rows = '';
    for (const field of section.fields) {
      const val = dados[field.id];
      if (val === undefined || val === null) continue;
      const str = Array.isArray(val) ? val.join(', ') : String(val).trim();
      if (!str) continue;
      rows += `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #2a2a2a;font-family:Arial,sans-serif;font-size:12px;color:#b9b9b9;vertical-align:top;width:42%;"><strong style="color:#c5a880;">${esc(field.label)}</strong></td>
          <td style="padding:10px 14px;border-bottom:1px solid #2a2a2a;font-family:Arial,sans-serif;font-size:12px;color:#ffffff;vertical-align:top;white-space:pre-wrap;">${esc(formatVal(val))}</td>
        </tr>`;
    }
    if (!rows) continue;
    sectionsHtml += `
      <h3 style="font-family:Arial,sans-serif;font-size:13px;color:#c5a880;letter-spacing:1px;text-transform:uppercase;margin:28px 0 6px;">${esc(section.section_name)}</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;">${rows}</table>`;
  }

  // Campos extras que não estão no config mas vieram no payload
  const extras = Object.entries(dados).filter(
    ([k]) => !briefingVideoConfig.sections.some((s) => s.fields.some((f) => f.id === k))
  );
  let extrasRows = '';
  for (const [k, v] of extras) {
    if (['lgpd_aceito', 'lgpd_data_aceite', 'tipo', 'cliente_id'].includes(k)) continue;
    if (v === undefined || v === null || String(v).trim() === '') continue;
    const label = k.replace(/_/g, ' ');
    extrasRows += `<tr><td style="padding:8px 14px;border-bottom:1px solid #2a2a2a;font-size:11px;color:#888;">${esc(label)}</td><td style="padding:8px 14px;border-bottom:1px solid #2a2a2a;font-size:11px;color:#fff;white-space:pre-wrap;">${esc(formatVal(v))}</td></tr>`;
  }
  if (extrasRows) {
    sectionsHtml += `<h3 style="font-family:Arial,sans-serif;font-size:11px;color:#777;margin:28px 0 6px;">Outros dados</h3><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#1a1a1a;border:1px solid #2a2a2a;">${extrasRows}</table>`;
  }

  const empresaLine = empresa ? ` — ${esc(empresa)}` : '';

  return `
    <div style="background:#0d0d0d;padding:32px 16px;font-family:Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:14px;overflow:hidden;">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#181818,#0f0f0f);border-bottom:2px solid #c5a880;">
          <h1 style="margin:0;font-family:Georgia,serif;font-size:19px;color:#ffffff;">Novo Briefing de Vídeo — Produtora</h1>
          <p style="margin:6px 0 0;font-size:12px;color:#b9b9b9;">${esc(clienteNome)}${empresaLine} — Distinto Produtora / Filmmaker</p>
        </div>
        <div style="padding:8px 28px 28px;">
          ${sectionsHtml || '<p style="color:#888;font-size:13px;">Nenhum campo preenchido além do nome.</p>'}
          <p style="font-family:Arial,sans-serif;font-size:11px;color:#777;margin-top:24px;">Recebido automaticamente pelo link <code>wedistinto.com/briefing-video</code> e salvo no ERP em <code>briefings_resposta</code> com <code>tipo=video_produtora</code>.</p>
        </div>
      </div>
    </div>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const tipo = String(req.query.tipo || 'video_produtora').trim();
      // Suporte a filtro: ?tipo=video_produtora | casamento | todos
      let sql = 'SELECT * FROM briefings_resposta';
      const params: any[] = [];
      if (tipo && tipo !== 'todos' && tipo !== 'all') {
        sql += ' WHERE tipo = $1';
        params.push(tipo);
      }
      sql += ' ORDER BY criado_em DESC';
      const rows = await query(sql, params);
      const briefings = rows.map((r: any) => {
        let dados: any = {};
        try {
          dados = typeof r.dados_json === 'string' ? JSON.parse(r.dados_json || '{}') : r.dados_json || {};
        } catch (e: any) {
          dados = { _erro_parse: true, raw: String(r.dados_json || '').slice(0, 500) };
        }
        return { ...r, dados };
      });
      return res.status(200).json(briefings);
    } catch (err: any) {
      console.error('[briefing-video] Erro ao listar:', err);
      return res.status(500).json({ erro: 'Erro interno ao carregar briefings de vídeo', detail: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = req.body || {};
      let clienteNome = String(payload.nome_cliente || payload.nome_noivos || payload.cliente || '').trim();
      clienteNome = clienteNome.replace(/[\r\n\t\x00-\x1F]/g, ' ').slice(0, 255) || '';
      const empresa = String(payload.empresa || '').trim().slice(0, 255);
      const clienteId = String(payload.cliente_id || payload.clienteId || payload.id || '').trim().slice(0, 64);

      if (!clienteNome) {
        return res.status(422).json({ erro: 'O nome do cliente é obrigatório.' });
      }
      if (!payload.whatsapp || String(payload.whatsapp).trim() === '') {
        return res.status(422).json({ erro: 'O WhatsApp é obrigatório.' });
      }

      // Validação mínima dos required do config
      for (const section of briefingVideoConfig.sections) {
        for (const field of section.fields) {
          if (!field.required) continue;
          const raw = payload[field.id];
          const empty =
            raw === undefined ||
            raw === null ||
            (Array.isArray(raw) && raw.length === 0) ||
            (typeof raw === 'string' && String(raw).trim() === '');
          if (empty) {
            return res.status(422).json({ erro: `Campo obrigatório não preenchido: ${field.label}`, field: field.id });
          }
        }
      }

      const sanitized: any = {};
      for (const [k, v] of Object.entries(payload)) {
        if (Array.isArray(v)) sanitized[k] = v.map((x) => String(x).trim().slice(0, 5000)).slice(0, 20);
        else if (typeof v === 'string') sanitized[k] = v.slice(0, 5000).trim();
        else sanitized[k] = v;
      }
      sanitized.nome_cliente = clienteNome;
      if (empresa) sanitized.empresa = empresa;
      if (clienteId) sanitized.cliente_id = clienteId;
      sanitized.tipo = 'video_produtora';

      const id = generateId();
      const dadosJsonStr = JSON.stringify(sanitized);

      // Tenta inserir com colunas novas; fallback se colunas ainda não existem (migração pendente)
      try {
        await query(
          'INSERT INTO briefings_resposta (id, cliente_nome, empresa, cliente_id, dados_json, tipo, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [id, clienteNome, empresa || null, clienteId || null, dadosJsonStr, 'video_produtora', 'novo']
        );
      } catch (e: any) {
        if (/Unknown column.*tipo|Unknown column.*empresa|Unknown column.*cliente_id/i.test(e.message)) {
          await query(
            'INSERT INTO briefings_resposta (id, cliente_nome, dados_json, status) VALUES ($1, $2, $3, $4)',
            [id, clienteNome, dadosJsonStr, 'novo']
          );
        } else {
          throw e;
        }
      }

      console.log('[briefing-video] salvo', { id, clienteNome, empresa, clienteId });

      // E-mail para equipe (best-effort)
      try {
        await brevoService.sendEmail({
          to: [{ email: EMAIL_DESTINO }],
          subject: `Novo Briefing Vídeo — ${clienteNome}${empresa ? ` — ${empresa}` : ''}`,
          htmlContent: buildVideoEmailHtml(sanitized, clienteNome, empresa),
        });
        console.log('[briefing-video] e-mail enviado para', EMAIL_DESTINO);
      } catch (err: any) {
        console.error('[briefing-video] falha ao enviar e-mail', err?.message || err);
      }

      return res.status(201).json({ ok: true, id, mensagem: 'Briefing de vídeo enviado com sucesso!' });
    } catch (err: any) {
      console.error('[briefing-video] Erro ao salvar:', err?.message, err?.stack);
      let msg = err?.message || 'Erro interno';
      if (/Incorrect string value|Data too long/i.test(msg)) {
        msg = 'Dados com caracteres inválidos. Tente remover emojis ou caracteres especiais.';
      }
      return res.status(500).json({ erro: 'Erro ao processar briefing de vídeo: ' + msg, detail: err?.message });
    }
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
