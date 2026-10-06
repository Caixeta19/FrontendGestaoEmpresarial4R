const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function get(path) {
  const r = await fetch(BASE + path, { credentials: 'include' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const listarContasPagar = () => get('/api/v1/contas-pagar');
export const listarLogs = (tamanho = 50) => get(`/api/v1/conciliacao/logs?tamanho=${tamanho}`);
export const reprocessarLog = (id) =>
  fetch(`${BASE}/api/v1/conciliacao/logs/${id}/reprocessar`, { method: 'POST', credentials: 'include' });

/**
 * Tempo real via SSE. Obs.: EventSource não envia o header Authorization; use cookie de sessão
 * (withCredentials) ou um token de curta duração na query string.
 */
export function assinarConciliacao(onEvento) {
  const es = new EventSource(`${BASE}/api/v1/conciliacao/stream`, { withCredentials: true });
  es.addEventListener('conciliacao', (e) => onEvento(JSON.parse(e.data)));
  return () => es.close();
}