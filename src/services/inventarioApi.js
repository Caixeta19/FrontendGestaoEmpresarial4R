// Inventário por filial: IQ09 (SAP) x estoque do sistema x contagem física (bipagem).
import { request, API_BASE, ApiError, lerToken, encerrarSessaoExpirada } from './api';

const BASE = '/estoque/inventario';

// ---------------------------------------------------------------- rótulos e cores

/** Resultado -> rótulo da tela e classe do badge (good | warn | bad | neutral). */
export const RESULTADOS = {
  CONFERIDO: { rotulo: 'Conferido', cor: 'good' },
  PENDENTE: { rotulo: 'Pendente', cor: 'neutral' },
  FALTA: { rotulo: 'Falta', cor: 'bad' },
  SO_NO_SISTEMA: { rotulo: 'Só no sistema', cor: 'bad' },
  SEM_ENTRADA_SISTEMA: { rotulo: 'Sem entrada no sistema', cor: 'warn' },
  SOBRA_FISICA: { rotulo: 'Sobra física', cor: 'warn' },
  VENDIDO_EM_ESTOQUE: { rotulo: 'Vendido em estoque', cor: 'bad' },
  STATUS_SAP_DIVERGENTE: { rotulo: 'Status SAP divergente', cor: 'warn' },
  FORA_ESTOQUE_SAP: { rotulo: 'Fora do estoque (SAP)', cor: 'neutral' },
  CORRETO: { rotulo: 'Correto (antigo)', cor: 'good' },
  DIVERGENCIA: { rotulo: 'Divergência (antigo)', cor: 'warn' },
};

export const rotuloResultado = (r) => RESULTADOS[r]?.rotulo || r || '—';
export const corResultado = (r) => RESULTADOS[r]?.cor || 'neutral';

export const STATUS_EXECUCAO = {
  ABERTO: 'Aberto',
  EM_CONTAGEM: 'Em contagem',
  FECHADO: 'Fechado',
  CANCELADO: 'Cancelado',
};

/** Resultado da conferência por SKU (MB52) -> rótulo e cor do badge. */
export const RESULTADOS_SKU = {
  CONFERIDO: { rotulo: 'Conferido', cor: 'good' },
  CONTAGEM_DIVERGENTE: { rotulo: 'Contagem divergente', cor: 'bad' },
  SAP_ACIMA_SISTEMA: { rotulo: 'SAP acima do sistema', cor: 'warn' },
  SAP_ABAIXO_SISTEMA: { rotulo: 'SAP abaixo do sistema', cor: 'warn' },
  MB52_DIFERE_IQ09: { rotulo: 'MB52 difere da IQ09', cor: 'warn' },
  SO_NO_SAP: { rotulo: 'Só no SAP', cor: 'bad' },
  SO_NO_SISTEMA: { rotulo: 'Só no sistema', cor: 'bad' },
  SKU_NAO_IDENTIFICADO: { rotulo: 'SKU não identificado', cor: 'neutral' },
};

export const rotuloResultadoSku = (r) => RESULTADOS_SKU[r]?.rotulo || r || '—';
export const corResultadoSku = (r) => RESULTADOS_SKU[r]?.cor || 'neutral';

export const emAndamento = (status) => status === 'ABERTO' || status === 'EM_CONTAGEM';

/** Tom do retorno da bipagem: verde (ok), laranja (atenção), vermelho (problema) ou cinza (já bipado). */
export function tomDaBipagem(bipagem) {
  if (!bipagem) return null;
  if (bipagem.jaBipado) return 'cinza';
  if (bipagem.resultado === 'CONFERIDO') return 'verde';
  if (bipagem.resultado === 'VENDIDO_EM_ESTOQUE') return 'vermelho';
  return 'laranja';
}

// ---------------------------------------------------------------- chamadas

/**
 * Abre o inventário da filial com a IQ09 e, se vier, a MB52 (conferência por SKU).
 * 409 = já existe um aberto (ApiError.corpo.execucaoId).
 */
export function abrir(filialId, arquivo, mb52) {
  const form = new FormData();
  form.append('filialId', filialId);
  form.append('arquivo', arquivo);
  if (mb52) form.append('mb52', mb52);
  return request(BASE, { method: 'POST', body: form });
}

// ---------------------------------------------------------------- conferência por SKU (MB52)

/** Importa (ou substitui) a MB52 da execução em andamento. */
export function importarMb52(id, arquivo) {
  const form = new FormData();
  form.append('arquivo', arquivo);
  return request(`${BASE}/${id}/mb52`, { method: 'POST', body: form });
}

/** Página da conferência por SKU + totais por resultado. ordenacao: sku | valor | quantidade. */
export const listarSkus = (id, { resultados, busca, somenteDiferenca, ordenacao = 'sku', pagina = 0, tamanho = 50 } = {}) =>
  request(`${BASE}/${id}/skus`, {
    params: {
      resultado: resultados?.length ? resultados.join(',') : undefined,
      busca: busca?.trim() || undefined,
      somenteDiferenca: somenteDiferenca ? true : undefined,
      ordenacao,
      pagina,
      tamanho,
    },
  });

/** Contagem manual do SKU (acessório com quantidade). quantidade null remove a contagem. */
export const contarSku = (id, skuId, quantidade, justificativa) =>
  request(`${BASE}/${id}/skus/${skuId}/contagem`, { method: 'PATCH', body: { quantidade, justificativa } });

export const listar = ({ filialId, status } = {}) => request(BASE, { params: { filialId, status } });

/**
 * Resumo, contadores, uma página de itens e as últimas bipagens.
 * resultados: lista de resultados (vazia = todos); vai como "A,B" e o Spring separa.
 */
export const buscar = (id, { resultados, busca, pagina = 0, tamanho = 50 } = {}) =>
  request(`${BASE}/${id}`, {
    params: {
      resultado: resultados?.length ? resultados.join(',') : undefined,
      busca: busca?.trim() || undefined,
      pagina,
      tamanho,
    },
  });

export const bipar = (id, serial) => request(`${BASE}/${id}/bipagens`, { method: 'POST', body: { serial } });

export const desfazerBipagem = (id, itemId) => request(`${BASE}/${id}/bipagens/${itemId}`, { method: 'DELETE' });

export const justificar = (id, itemId, texto) =>
  request(`${BASE}/${id}/itens/${itemId}/justificativa`, { method: 'PATCH', body: { texto } });

export const fechar = (id) => request(`${BASE}/${id}/fechar`, { method: 'POST' });

export const cancelar = (id) => request(`${BASE}/${id}/cancelar`, { method: 'POST' });

/** Refaz o diagnóstico da IA (inventário fechado). 502 = a API do Claude falhou. */
export const diagnosticar = (id) => request(`${BASE}/${id}/diagnostico`, { method: 'POST' });

/** Carga do centro SAP das filiais: CSV ADABAS;CENTRO_SAP[;DEPOSITO_SAP]. */
export function carregarCentrosSap(arquivo) {
  const form = new FormData();
  form.append('arquivo', arquivo);
  return request('/filiais/centros-sap', { method: 'POST', body: form });
}

/** Baixa o CSV com todas as linhas e o resultado. */
export const exportarCsv = (id) => baixar(`${BASE}/${id}/exportacao`, `inventario_${id}.csv`);

/** Baixa o CSV da conferência por SKU. */
export const exportarCsvSku = (id) => baixar(`${BASE}/${id}/exportacao-sku`, `inventario_${id}_sku.csv`);

/** Download autenticado (fetch com Bearer; nunca <a href> direto para a API). */
async function baixar(caminho, nomePadrao) {
  const token = lerToken();
  let resp;
  try {
    resp = await fetch(`${API_BASE}${caminho}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se o backend está no ar.');
  }
  if (!resp.ok) {
    const corpo = await resp.json().catch(() => null);
    if (resp.status === 401 && !corpo) encerrarSessaoExpirada();
    throw new ApiError(resp.status, corpo?.mensagem || `Erro ${resp.status}`, corpo?.campos, corpo);
  }
  const nome = /filename="?([^";]+)"?/.exec(resp.headers.get('Content-Disposition') || '')?.[1] || nomePadrao;
  const url = URL.createObjectURL(await resp.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return nome;
}

// ---------------------------------------------------------------- formatação

const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const formatarDataHora = (iso) => (iso ? dataHora.format(new Date(iso)).replace(',', '') : '—');
export const formatarHora = (iso) => (iso ? hora.format(new Date(iso)) : '');

const quantidade = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Quantidade (até 3 casas); nulo = "—". {@code comSinal}: "+2" para diferenças. */
export function formatarQtd(valor, comSinal = false) {
  if (valor === null || valor === undefined) return '—';
  const n = Number(valor);
  return (comSinal && n > 0 ? '+' : '') + quantidade.format(n);
}

export const formatarMoeda = (valor) => (valor === null || valor === undefined ? '—' : moeda.format(Number(valor)));
