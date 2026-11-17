import { useEffect, useState } from 'react';
import { permissoesFormasPagamento } from '../../services/financeiroApi';
import { ufDaFilial } from '../relatorios/utilRelatorios.js';

export { formatarMoeda } from '../../services/vendasApi';
export { mensagemErro } from '../caixa/utilCaixa.js';
export { hoje, ufDaFilial } from '../relatorios/utilRelatorios.js';

/** Mesmo limite do backend (422 acima disso). */
export const MAXIMO_DIAS = 366;

export const AGRUPAR_POR = [
  ['FILIAL', 'Filial / PDV'],
  ['FORMA', 'Forma de pagamento'],
  ['CAIXA', 'Caixa'],
];

/** Valor do select de UF para as filiais cujo nome não tem prefixo de UF ("ADM 4 REDES", "EA CE - ..."). */
export const SEM_UF = '__SEM_UF__';

const dia = (iso) => new Date(`${iso}T00:00:00`);

/** Mensagem de erro do período, ou '' se estiver válido (as mesmas regras do backend). */
export function validarPeriodo(dataInicio, dataFim) {
  if (!dataInicio || !dataFim) return 'Informe a data inicial e a data final.';
  if (dataFim < dataInicio) return 'A data final não pode ser anterior à data inicial.';
  const dias = Math.round((dia(dataFim) - dia(dataInicio)) / 86400000) + 1;
  if (dias > MAXIMO_DIAS) return `O período pode ter no máximo ${MAXIMO_DIAS} dias.`;
  return '';
}

/** UFs presentes nos nomes das filiais, em ordem, e se há filiais sem UF. */
export function ufsDasFiliais(filiais) {
  const ufs = new Set();
  let semUf = false;
  filiais.forEach((f) => {
    const u = ufDaFilial(f.nome);
    if (u) ufs.add(u); else semUf = true;
  });
  return { ufs: [...ufs].sort(), semUf };
}

export const filialDaUf = (filial, uf) => {
  if (!uf) return true;
  const u = ufDaFilial(filial.nome);
  return uf === SEM_UF ? !u : u === uf;
};

export const percentualBR = (v) => `${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

export const dataBR = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso);
};

/**
 * Se o usuário pode consultar o relatório (esconde o item "Movimento" do menu). Mostra por padrão e se a consulta falhar:
 * o backend barra com 403 de qualquer forma.
 */
export function usePodeVerMovimento() {
  const [pode, setPode] = useState(true);
  useEffect(() => {
    let ativo = true;
    permissoesFormasPagamento()
      .then((p) => { if (ativo && p?.consultar === false) setPode(false); })
      .catch(() => {});
    return () => { ativo = false; };
  }, []);
  return pode;
}
