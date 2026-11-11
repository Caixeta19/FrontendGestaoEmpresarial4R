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

/** Abre o inventário da filial com a IQ09. 409 = já existe um aberto (ApiError.corpo.execucaoId). */
export function abrir(filialId, arquivo) {
  const form = new FormData();
  form.append('filialId', filialId);
  form.append('arquivo', arquivo);
  return request(BASE, { method: 'POST', body: form });
}

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
export async function exportarCsv(id) {
  const token = lerToken();
  let resp;
  try {
    resp = await fetch(`${API_BASE}${BASE}/${id}/exportacao`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se o backend está no ar.');
  }
  if (!resp.ok) {
    const corpo = await resp.json().catch(() => null);
    if (resp.status === 401 && !corpo) encerrarSessaoExpirada();
    throw new ApiError(resp.status, corpo?.mensagem || `Erro ${resp.status}`, corpo?.campos, corpo);
  }
  const nome = /filename="?([^";]+)"?/.exec(resp.headers.get('Content-Disposition') || '')?.[1] || `inventario_${id}.csv`;
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
