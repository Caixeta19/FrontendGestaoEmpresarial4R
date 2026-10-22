import { API_BASE } from './api';

// API_BASE já termina em /api (context-path do back). Aqui entram só os caminhos
// depois dele: /v1/contas-pagar -> http://localhost:8080/api/v1/contas-pagar.

function token() {
  return (
    localStorage.getItem('syscor_token') ||
    JSON.parse(sessionStorage.getItem('syscor_session') || '{}').token
  );
}

function cabecalhos(extra = {}) {
  const t = token();
  return { ...extra, ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

async function get(path) {
  const r = await fetch(API_BASE + path, { headers: cabecalhos() });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const listarContasPagar = () => get('/v1/contas-pagar');
export const listarLogs = (tamanho = 50) => get(`/v1/conciliacao/logs?tamanho=${tamanho}`);
export const reprocessarLog = (id) =>
  fetch(`${API_BASE}/v1/conciliacao/logs/${id}/reprocessar`, {
    method: 'POST',
    headers: cabecalhos(),
  });

/**
 * Tempo real via SSE. O EventSource nativo não envia o header Authorization, então
 * a leitura é feita com fetch + stream, que aceita o token no header.
 * Devolve uma função que encerra a conexão (use no cleanup do useEffect).
 */
export function assinarConciliacao(onEvento) {
  const ctrl = new AbortController();

  (async () => {
    try {
      const r = await fetch(`${API_BASE}/v1/conciliacao/stream`, {
        headers: cabecalhos({ Accept: 'text/event-stream' }),
        signal: ctrl.signal,
      });
      if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);

      const leitor = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await leitor.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true }).replace(/\r/g, '');

        let fim;
        while ((fim = buffer.indexOf('\n\n')) >= 0) {
          const bloco = buffer.slice(0, fim);
          buffer = buffer.slice(fim + 2);

          let evento = 'message';
          const dados = [];
          for (const linha of bloco.split('\n')) {
            if (linha.startsWith('event:')) evento = linha.slice(6).trim();
            else if (linha.startsWith('data:')) dados.push(linha.slice(5).trim());
          }
          if (evento === 'conciliacao' && dados.length) {
            try { onEvento(JSON.parse(dados.join('\n'))); } catch { /* evento malformado */ }
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error('SSE da conciliação caiu:', e);
    }
  })();

  return () => ctrl.abort();
}