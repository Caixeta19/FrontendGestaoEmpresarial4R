import { API_BASE, encerrarSessaoExpirada, request } from './api';

// API_BASE já termina em /api (context-path do back). Aqui entram só os caminhos
// depois dele: /financeiro/contas-pagar -> http://localhost:8080/api/financeiro/contas-pagar.

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
  if (r.status === 401) encerrarSessaoExpirada();
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const listarContasPagar = () => get('/financeiro/contas-pagar');
export const listarLogs = (tamanho = 50) => get(`/financeiro/conciliacao/logs?tamanho=${tamanho}`);
export const reprocessarLog = (id) =>
  fetch(`${API_BASE}/financeiro/conciliacao/logs/${id}/reprocessar`, {
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
      const r = await fetch(`${API_BASE}/financeiro/conciliacao/stream`, {
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

// ---------------------------------------------------------------- caixa diário (V38)
// Sem caixa aberto hoje a filial não vende. Erros do caixa trazem `corpo.codigo` (CAIXA_NAO_ABERTO, CAIXA_JA_ABERTO,
// CAIXA_FECHADO, CAIXA_SEM_PERMISSAO, CAIXA_COM_CARRINHO_ABERTO) no ApiError.
const CAIXA = '/financeiro/caixa';

/** Caixa de hoje da filial: { aberto, caixaId, data, caixaPdv, caixas, podeAbrir, avisos }. */
export const situacaoCaixa = (filialId) => request(`${CAIXA}/situacao`, { params: { filialId } });

/** { conferirReabrir, todasAsFiliais } do usuário logado. */
export const permissoesCaixa = () => request(`${CAIXA}/permissoes`);

/** Dinheiro sugerido para a abertura (fechamento do último caixa desse caixa): { dinheiro, dataUltimoFechamento }. */
export const sugestaoAberturaCaixa = (filialId, caixaPdv) =>
  request(`${CAIXA}/sugestao-abertura`, { params: { filialId, caixaPdv } });

/** corpo: { filialId, caixaPdv, formasIniciais: [{ forma, valorAbertura }], justificativaAbertura } */
export const abrirCaixa = (corpo) => request(`${CAIXA}/abrir`, { method: 'POST', body: corpo });

/** Filtros: filialId, dataInicio, dataFim (yyyy-MM-dd), conferencia, busca, ordenar, direcao, page, size. */
export const listarCaixasAbertos = (filtros = {}) => request(`${CAIXA}/abertos`, { params: filtros });
export const listarCaixasFechados = (filtros = {}) => request(`${CAIXA}/fechados`, { params: filtros });

export const detalharCaixa = (id) => request(`${CAIXA}/${id}`);
export const movimentoDetalhadoCaixa = (id) => request(`${CAIXA}/${id}/movimento-detalhado`);

/**
 * Esperado e diferença do dinheiro para o valor contado informado, sem fechar: { valorContado, contabilizadoEsperado,
 * diferenca }. O caixa aberto não mostra o esperado ao gerente; ele só o conhece depois de digitar o que contou.
 */
export const previaFechamentoCaixa = (id, valorContado) =>
  request(`${CAIXA}/${id}/previa-fechamento`, { method: 'POST', body: { valorContado } });

/** formas: [{ forma, valorConferido }]; só o dinheiro precisa ser contado. */
export const fecharCaixa = (id, formas, observacao) =>
  request(`${CAIXA}/${id}/fechar`, { method: 'POST', body: { formas, observacao } });
export const conferirCaixa = (id) => request(`${CAIXA}/${id}/conferir`, { method: 'POST' });
export const reabrirCaixa = (id, justificativa) =>
  request(`${CAIXA}/${id}/reabrir`, { method: 'POST', body: { justificativa } });
