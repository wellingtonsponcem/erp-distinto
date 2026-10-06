import { query, queryOne } from './db';

export interface AssinafyConfig {
  apiKey: string;
  accountId: string;
  mode: 'prod' | 'test' | string;
}

export class AssinafyService {
  private apiKey: string = '';
  private accountId: string = '';
  private mode: string = 'prod';

  constructor() {}

  public async getConfig(): Promise<AssinafyConfig | null> {
    try {
      const row = await queryOne<any>(
        "SELECT assinafy_api_key, assinafy_account_id, assinafy_mode FROM configuracao_empresa ORDER BY (id = 'principal') DESC LIMIT 1"
      );

      const apiKey = row?.assinafy_api_key || process.env.ASSINAFY_API_KEY || '';
      const accountId = row?.assinafy_account_id || process.env.ASSINAFY_ACCOUNT_ID || '';
      const mode = row?.assinafy_mode || process.env.ASSINAFY_MODE || 'prod';

      if (apiKey) this.apiKey = apiKey;
      if (accountId) this.accountId = accountId;
      if (mode) this.mode = mode;

      return { apiKey, accountId, mode };
    } catch (e) {
      return null;
    }
  }

  public getBaseUrl(mode?: string): string {
    const m = mode || this.mode;
    return m === 'prod' || m === 'production'
      ? 'https://api.assinafy.com.br/v1'
      : 'https://sandbox.assinafy.com.br/v1';
  }

  public async testConnection(apiKey?: string, accountId?: string, mode?: string): Promise<{ success: boolean; message: string; details?: any }> {
    if (!apiKey || !accountId) {
      await this.getConfig();
    }
    const key = apiKey || this.apiKey;
    const acc = accountId || this.accountId;
    const m = mode || this.mode;

    if (!key) {
      return { success: false, message: 'Chave de API do Assinafy não configurada.' };
    }

    const baseUrl = this.getBaseUrl(m);

    // Endpoints para testar autenticação
    const endpointsToTry = acc
      ? [`/accounts/${acc}/signers`, `/accounts/${acc}`, `/accounts`]
      : [`/accounts`];

    let lastError = '';
    for (const ep of endpointsToTry) {
      try {
        const url = `${baseUrl}${ep.startsWith('/') ? ep : '/' + ep}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Api-Key': key,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        const status = res.status;
        const text = await res.text();

        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text;
        }

        if (status >= 200 && status < 300) {
          return {
            success: true,
            message: 'Conexão com a API do Assinafy realizada com sucesso!',
            details: { httpStatus: status, endpoint: ep, mode: m, data }
          };
        } else if (status === 401 || status === 403) {
          return {
            success: false,
            message: `Autenticação recusada pelo Assinafy (HTTP ${status}). Verifique a API Key.`,
            details: { httpStatus: status, error: data }
          };
        } else if (status === 404) {
          lastError = `Recurso não encontrado (HTTP 404 em ${ep}). Verifique se o Account ID está correto.`;
        } else {
          lastError = `Assinafy retornou código HTTP ${status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`;
        }
      } catch (err: any) {
        lastError = `Erro na requisição HTTP: ${err.message}`;
      }
    }

    return {
      success: false,
      message: lastError || 'Não foi possível autenticar na API do Assinafy.',
    };
  }
}

export const assinafyService = new AssinafyService();
