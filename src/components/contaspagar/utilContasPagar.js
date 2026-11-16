export { formatarMoeda, lerValorBR } from '../../services/vendasApi';
export { mensagemErro, codigoErro } from '../caixa/utilCaixa';

export const MINIMO_JUSTIFICATIVA = 10;

export const soDigitos = (t) => String(t ?? '').replace(/\D/g, '');

/** CPF (até 11 dígitos) ou CNPJ (até 14) com máscara, enquanto digita. */
export function mascararDocumento(texto) {
  const d = soDigitos(texto).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** Valor numérico -> texto do campo monetário (1234.5 -> "1.234,50"). */
export const valorParaCampo = (v) =>
  v === null || v === undefined || v === ''
    ? ''
    : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Número com 2 casas, como o backend espera. */
export const duasCasas = (n) => Math.round(n * 100) / 100;

export const dataBR = (iso) =>
  iso ? new Date(String(iso).length <= 10 ? iso + 'T00:00' : iso).toLocaleDateString('pt-BR') : '—';
export const dataHoraBR = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR') : '—');
export const horaBR = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
export const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const FORMAS_PAGAMENTO = [
  ['BOLETO', 'Boleto'],
  ['PIX', 'PIX'],
  ['TED', 'TED'],
  ['TRIBUTO', 'Tributo'],
  ['OUTRO', 'Outro'],
];

export const STATUS_FILTRO = [
  ['', 'Todos'],
  ['ABERTO', 'Pendente'],
  ['BAIXADO', 'Pago'],
  ['DIVERGENTE', 'Divergência'],
  ['CANCELADO', 'Cancelada'],
];

const BADGE_CONTA = {
  ABERTO: ['warn', 'Pendente'],
  VENCIDA: ['bad', 'Vencida'],
  BAIXADO: ['good', 'Pago'],
  DIVERGENTE: ['bad', 'Divergência'],
  CANCELADO: ['neutral', 'Cancelada'],
};
/** "Vencida" vem do backend (`vencida`) e só vale para conta pendente. */
export const chaveStatus = (c) => (c.status === 'ABERTO' && c.vencida ? 'VENCIDA' : c.status);
export const badgeConta = (c) => BADGE_CONTA[chaveStatus(c)] || ['neutral', c.status];

export const ORIGEM_BAIXA = { CONCILIACAO_BB: 'Conciliado', MANUAL: 'Manual' };

export const BADGE_LOG = {
  RECEBIDO: ['warn', 'Na fila'],
  PROCESSADO: ['good', 'Processado'],
  ERRO: ['bad', 'Erro'],
  REJEITADO: ['neutral', 'Rejeitado'],
};
export const BANCO = { BANCO_BRASIL: 'Banco do Brasil', BANCO_PROPRIO: 'Banco próprio' };

export const SITUACOES_EXTRATO = [
  ['AMBIGUO', 'Ambíguos'],
  ['SEM_CORRESPONDENCIA', 'Sem conta correspondente'],
  ['CONCILIADO', 'Conciliados'],
  ['IGNORADO', 'Ignorados'],
];

export const CANAL = {
  CONECTADO: { texto: '● Conectado', cor: 'var(--good)' },
  AGUARDANDO: { texto: '○ Aguardando', cor: 'var(--text-faint)' },
  COM_ERRO: { texto: '● Com erro', cor: 'var(--bad)' },
  DESLIGADO: { texto: '○ Desligado', cor: 'var(--text-faint)' },
};
