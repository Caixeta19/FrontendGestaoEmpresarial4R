// Cliente HTTP único do frontend. Todas as telas falam com o backend por aqui.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    this.mensagem = mensagem;
    this.campos = campos || null;
  }
}

function lerJson(texto) {
  try { return JSON.parse(texto); } catch { return null; }
}

/**
 * request('/vendas', { method: 'POST', body: {...}, params: { page: 0 } })
 * Lança ApiError com a mensagem do backend (campo "mensagem" do GlobalExceptionHandler).
 */
export async function request(path, { method = 'GET', body, params } = {}) {
  // Corrige a URL para garantir que use sempre a API_BASE do back-end
  const url = new URL(path.startsWith('http') ? path : API_BASE + path);
  
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  // Recupera o token JWT armazenado para autenticação nas rotas protegidas
  const token = localStorage.getItem('syscor_token') || JSON.parse(sessionStorage.getItem('syscor_session') || '{}').token;

  let resp;
  try {
    resp = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se o backend está no ar.');
  }

  if (resp.status === 204) return null;
  const texto = await resp.text();
  const dados = texto ? lerJson(texto) : null;

  if (!resp.ok) {
    const detalhes = dados?.campos ? Object.values(dados.campos).join(' · ') : '';
    const mensagem = [dados?.mensagem, detalhes].filter(Boolean).join(' — ') || `Erro ${resp.status}`;
    throw new ApiError(resp.status, mensagem, dados?.campos);
  }
  return dados;
}