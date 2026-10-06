import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/helpers';
import { query, queryOne } from '@/lib/db';
import { assinafyService } from '@/lib/assinafy';

export default requireAuth(async (req: NextApiRequest, res: NextApiResponse, user) => {
  const method = req.method;

  // Garantir colunas no MySQL Hostinger
  try {
    await query(`ALTER TABLE configuracao_empresa ADD COLUMN assinafy_api_key TEXT;`);
  } catch (e) {}
  try {
    await query(`ALTER TABLE configuracao_empresa ADD COLUMN assinafy_account_id VARCHAR(100);`);
  } catch (e) {}
  try {
    await query(`ALTER TABLE configuracao_empresa ADD COLUMN assinafy_mode VARCHAR(32) DEFAULT 'prod';`);
  } catch (e) {}

  if (method === 'GET') {
    try {
      const config = await queryOne<{ assinafy_api_key?: string; assinafy_account_id?: string; assinafy_mode?: string }>(
        "SELECT assinafy_api_key, assinafy_account_id, assinafy_mode FROM configuracao_empresa ORDER BY (id = 'principal') DESC LIMIT 1"
      );

      const rawKey = config?.assinafy_api_key || process.env.ASSINAFY_API_KEY || '';
      const accountId = config?.assinafy_account_id || process.env.ASSINAFY_ACCOUNT_ID || '';
      const mode = config?.assinafy_mode || process.env.ASSINAFY_MODE || 'prod';

      const maskedKey = rawKey && rawKey.length > 8
        ? `${rawKey.substring(0, 6)}...${rawKey.substring(rawKey.length - 4)}`
        : (rawKey ? '********' : '');

      // Executar teste de conexão se houver chave configurada
      let testResult = null;
      if (rawKey) {
        testResult = await assinafyService.testConnection(rawKey, accountId, mode);
      }

      return res.status(200).json({
        configured: Boolean(rawKey),
        maskedKey,
        hasKey: Boolean(rawKey),
        accountId,
        mode,
        testResult
      });
    } catch (err: any) {
      return res.status(500).json({ erro: err.message });
    }
  }

  if (method === 'POST') {
    if (user.nivel !== 1) {
      return res.status(403).json({ erro: 'Acesso negado: permissão de administrador requerida.' });
    }
    try {
      const { apiKey, accountId, mode } = req.body || {};

      const currentConfig = await queryOne<{ assinafy_api_key?: string; assinafy_account_id?: string; assinafy_mode?: string }>(
        "SELECT assinafy_api_key, assinafy_account_id, assinafy_mode FROM configuracao_empresa WHERE id = 'principal' LIMIT 1"
      );

      let cleanKey = (apiKey || '').trim();
      if (!cleanKey && currentConfig?.assinafy_api_key) {
        cleanKey = currentConfig.assinafy_api_key;
      }

      let cleanAccount = (accountId || '').trim();
      if (!cleanAccount && currentConfig?.assinafy_account_id) {
        cleanAccount = currentConfig.assinafy_account_id;
      }

      const cleanMode = (mode || 'prod').trim();

      if (!cleanKey) {
        return res.status(422).json({ erro: 'A Chave de API do Assinafy é obrigatória.' });
      }

      // Atualizar ou Inserir no banco
      const exists = await queryOne("SELECT id FROM configuracao_empresa WHERE id = 'principal'");
      if (exists) {
        await query(
          "UPDATE configuracao_empresa SET assinafy_api_key = $1, assinafy_account_id = $2, assinafy_mode = $3 WHERE id = 'principal'",
          [cleanKey, cleanAccount, cleanMode]
        );
      } else {
        await query(
          "INSERT INTO configuracao_empresa (id, assinafy_api_key, assinafy_account_id, assinafy_mode) VALUES ('principal', $1, $2, $3)",
          [cleanKey, cleanAccount, cleanMode]
        );
      }

      // Testar conexão imediatamente
      const testResult = await assinafyService.testConnection(cleanKey, cleanAccount, cleanMode);

      return res.status(200).json({
        ok: true,
        mensagem: 'Configurações do Assinafy salvas com sucesso!',
        testResult
      });
    } catch (err: any) {
      console.error('Erro ao salvar configuracao Assinafy:', err);
      return res.status(500).json({ erro: `Erro ao salvar configurações do Assinafy: ${err.message}` });
    }
  }

  return res.status(405).json({ erro: 'Método não permitido' });
});
