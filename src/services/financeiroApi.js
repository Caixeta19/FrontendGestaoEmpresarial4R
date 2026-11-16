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

// ---------------------------------------------------------------- contas a pagar e extrato do BB
const PAGAR = '/financeiro/contas-pagar';
const EXTRATO = '/financeiro/conciliacao/extrato';

/** Filtros opcionais: status, vencimentoDe, vencimentoAte, busca, filialId. */
export const listarContasPagarFiltradas = (filtros = {}) => request(PAGAR, { params: filtros });
export const resumoContasPagar = () => request(`${PAGAR}/resumo`);
/** { consultar, gerenciar, baixaManual, sincronizar } */
export const permissoesContasPagar = () => request(`${PAGAR}/permissoes`);
/** 409 CONTA_DUPLICADA / CONTA_PROVAVEL_DUPLICADA chegam em ApiError.corpo.codigo. */
/** { conta, justificativaBaixa, motivoCancelamento, historico: [{ acao, usuario, em, texto }] } */
export const detalheContaPagar = (id) => request(`${PAGAR}/${id}`);
export const criarContaPagar =(corpo) => request(PAGAR, { method: 'POST', body: corpo });
export const editarContaPagar = (id, corpo) => request(`${PAGAR}/${id}`, { method: 'PUT', body: corpo });
export const cancelarContaPagar = (id, motivo) => request(`${PAGAR}/${id}/cancelar`, { method: 'POST', body: { motivo } });
export const baixaManualContaPagar = (id, corpo) => request(`${PAGAR}/${id}/baixa-manual`, { method: 'POST', body: corpo });
export const reabrirContaPagar = (id, justificativa) =>
  request(`${PAGAR}/${id}/reabrir`, { method: 'POST', body: { justificativa } });

/**
 * Comprovante em PDF. Um <a href> não envia o Bearer, então o arquivo é buscado com fetch e aberto por blob URL
 * (nada fica guardado no navegador; a URL é revogada depois).
 */
export async function baixarComprovante(id) {
  const aba = window.open('', '_blank'); // abre já, no clique, para o navegador não bloquear o pop-up
  try {
    const r = await fetch(`${API_BASE}${PAGAR}/${id}/comprovante`, { headers: cabecalhos() });
    if (r.status === 401) encerrarSessaoExpirada();
    if (!r.ok) throw new Error(r.status === 404 ? 'Comprovante não encontrado.' : `Falha ao baixar o comprovante (HTTP ${r.status}).`);
    const url = URL.createObjectURL(await r.blob());
    if (aba) aba.location.href = url;
    else window.location.assign(url);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    aba?.close();
    throw e;
  }
}

export const sincronizarExtrato = () => request(`${EXTRATO}/sincronizar`, { method: 'POST' });
/** situacao: AMBIGUO | SEM_CORRESPONDENCIA | CONCILIADO | IGNORADO (valores a confirmar no DTO do backend). */
export const listarLancamentosExtrato = (situacao) => request(`${EXTRATO}/lancamentos`, { params: { situacao } });
export const vincularLancamento = (id, { tituloId, justificativa }) =>
  request(`${EXTRATO}/lancamentos/${id}/vincular`, { method: 'POST', body: { tituloId, justificativa } });
export const ignorarLancamento = (id, motivo) =>
  request(`${EXTRATO}/lancamentos/${id}/ignorar`, { method: 'POST', body: { motivo } });

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
 * Fecha o caixa só com diferença zero: `formas` = [{ forma, valorConferido }] de TODAS as formas exigidas. Recusas do backend:
 * 422 CAIXA_COM_DIFERENCA (corpo.formas = as que divergem, corpo.tentativasRestantes) e 423 CAIXA_FECHAMENTO_BLOQUEADO.
 * `justificativa` só vale para quem pode fechar com divergência (financeiro, gerente de área, auditoria e admin).
 */
export const fecharCaixa = (id, { formas, observacao, justificativa }) =>
  request(`${CAIXA}/${id}/fechar`, { method: 'POST', body: { formas, observacao, justificativa } });
export const conferirCaixa = (id) => request(`${CAIXA}/${id}/conferir`, { method: 'POST' });
export const reabrirCaixa = (id, justificativa) =>
  request(`${CAIXA}/${id}/reabrir`, { method: 'POST', body: { justificativa } });

// ---------------------------------------------------------------- sangria, suprimento e estorno (só dinheiro, caixa aberto)
export const listarLancamentosCaixa = (id) => request(`${CAIXA}/${id}/lancamentos`);

/**
 * corpo: { tipo: 'SANGRIA' | 'SUPRIMENTO', valor, conta, observacao, chaveIdempotencia }. A chave é gerada uma vez por
 * formulário: repetir a mesma (duplo clique, nova tentativa) devolve o lançamento já feito em vez de criar outro.
 */
export const lancarNoCaixa = (id, corpo) => request(`${CAIXA}/${id}/lancamentos`, { method: 'POST', body: corpo });

/** Só financeiro e admin, com o caixa aberto: cria a contrapartida, nunca apaga a linha. */
export const estornarLancamentoCaixa = (id, lancamentoId, { justificativa, chaveIdempotencia }) =>
  request(`${CAIXA}/${id}/lancamentos/${lancamentoId}/estornar`, { method: 'POST', body: { justificativa, chaveIdempotencia } });
