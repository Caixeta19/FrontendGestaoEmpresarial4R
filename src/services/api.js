// Cliente HTTP único do frontend. Todas as telas falam com o backend por aqui.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(status, mensagem, campos, corpo) {
    super(mensagem);
    this.status = status;
    this.mensagem = mensagem;
    this.campos = campos || null;
    this.corpo = corpo || null; // corpo do erro, para dados além da mensagem (ex.: pagamentosIncompativeis)
  }
}

function lerJson(texto) {
  try { return JSON.parse(texto); } catch { return null; }
}

/** Lê o token JWT sem quebrar a requisição se o storage estiver com valor inválido. */
function lerToken() {
  try {
    const direto = localStorage.getItem('syscor_token');
    if (direto) return direto;
    return lerJson(sessionStorage.getItem('syscor_session') || '{}')?.token || null;
  } catch {
    return null; // storage indisponível (modo privado, política do navegador etc.)
  }
}

/**
 * request('/vendas', { method: 'POST', body: {...}, params: { page: 0 } })
 *
 * - body JSON (objeto): enviado com Content-Type application/json.
 * - body FormData (upload de arquivo): enviado como multipart; o navegador define
 *   o Content-Type com o boundary, por isso NÃO se define o header manualmente.
 *
 * Lança ApiError com a mensagem do backend (campo "mensagem" do GlobalExceptionHandler).
 */
export async function request(path, { method = 'GET', body, params } = {}) {
  // Garante que use sempre a API_BASE do back-end
  const url = new URL(path.startsWith('http') ? path : API_BASE + path);

  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const token = lerToken();
  const temBody = body !== undefined && body !== null;
  const ehFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers = {
    ...(temBody && !ehFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let resp;
  try {
    resp = await fetch(url.toString(), {
      method,
      headers,
      body: !temBody ? undefined : (ehFormData ? body : JSON.stringify(body)),
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se o backend está no ar.');
  }

  if (resp.status === 204) return null;
  const texto = await resp.text();
  const dados = texto ? lerJson(texto) : null;

  if (!resp.ok) {
    const detalhes = dados?.campos ? Object.values(dados.campos).join(' · ') : '';
    let mensagem = [dados?.mensagem, detalhes].filter(Boolean).join(' — ');

    if (!mensagem) {
      if (resp.status === 401) mensagem = 'Sessão expirada ou não autenticada. Faça login novamente.';
      else if (resp.status === 403) mensagem = 'Você não tem permissão para esta operação.';
      else mensagem = `Erro ${resp.status}`;
    }
    throw new ApiError(resp.status, mensagem, dados?.campos, dados);
  }
  return dados;
}