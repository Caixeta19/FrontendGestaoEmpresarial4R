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

const CHAVE_SESSAO_EXPIRADA = 'syscor_sessao_expirada';
let encerrandoSessao = false;

/**
 * Sessão inválida: limpa o token e volta para o login, avisando o motivo. Recarrega a página porque a sessão também
 * fica no estado do App, e a rota de login devolveria para a tela inicial enquanto ela existisse.
 */
export function encerrarSessaoExpirada() {
  if (encerrandoSessao) return;
  encerrandoSessao = true;
  try {
    sessionStorage.removeItem('syscor_session');
    localStorage.removeItem('syscor_token');
    sessionStorage.setItem(CHAVE_SESSAO_EXPIRADA, '1');
  } catch {
    // storage indisponível: o redirecionamento continua valendo
  }
  window.location.hash = '#/login';
  window.location.reload();
}

/** Devolve true uma única vez, se o usuário acabou de ser levado ao login por sessão expirada. */
export function consumirAvisoSessaoExpirada() {
  try {
    const expirou = sessionStorage.getItem(CHAVE_SESSAO_EXPIRADA) === '1';
    sessionStorage.removeItem(CHAVE_SESSAO_EXPIRADA);
    return expirou;
  } catch {
    return false;
  }
}

/** Login do usuário logado (subject do JWT), só para a tela; quem valida o token é o backend. */
export function loginDoToken() {
  try {
    const payload = lerToken()?.split('.')[1];
    if (!payload) return null;
    const bytes = Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    return lerJson(new TextDecoder().decode(bytes))?.sub || null;
  } catch {
    return null;
  }
}

/** Lê o token JWT sem quebrar a requisição se o storage estiver com valor inválido. */
export function lerToken() {
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
    // 401 sem corpo = token ausente, inválido, expirado ou usuário inativado. Senha errada do vendedor e login
    // recusado também são 401, mas trazem a mensagem no corpo e são tratados por quem chamou.
    if (resp.status === 401 && !dados) encerrarSessaoExpirada();

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