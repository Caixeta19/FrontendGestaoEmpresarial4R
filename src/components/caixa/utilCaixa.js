import { useCallback, useEffect, useState } from 'react';
import { listarFiliais } from '../../services/vendasApi';
import { EVENTO_CAIXA_MUDOU } from '../../services/api';
import { permissoesCaixa, situacaoCaixa } from '../../services/financeiroApi';
import { hoje } from '../relatorios/utilRelatorios';

export { formatarMoeda, formatarData, formatarDataHora, lerValorBR } from '../../services/vendasApi';

/** Formas do caixa, na ordem da tela. VOUCHER não existe no caixa. */
export const ROTULO_FORMA = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  VIVO_PAY: 'Vivo Pay',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  BOLETO: 'Boleto',
};
export const FORMAS_DO_CAIXA = Object.keys(ROTULO_FORMA);
export const rotuloForma = (forma) => ROTULO_FORMA[forma] || forma;

export const mensagemErro = (e) => e?.mensagem || e?.message || 'Falha ao comunicar com o servidor.';
export const codigoErro = (e) => e?.corpo?.codigo || null;

/** "2026-11-12" -> dias entre essa data e hoje (0 = hoje). */
export function diasDesde(dataISO) {
  const [a, m, d] = String(dataISO || '').slice(0, 10).split('-').map(Number);
  const [ha, hm, hd] = hoje().split('-').map(Number);
  if (!a || !ha) return 0;
  return Math.round((Date.UTC(ha, hm - 1, hd) - Date.UTC(a, m - 1, d)) / 86400000);
}

/** Texto e cor da "Data do caixa": "Caixa de hoje" ou "Aberto há N dia(s)" em laranja. */
export function rotuloDataCaixa(dataISO) {
  const dias = diasDesde(dataISO);
  if (dias <= 0) return { texto: 'Caixa de hoje', cor: '#16a34a' };
  return { texto: `Aberto há ${dias} dia${dias === 1 ? '' : 's'}`, cor: '#f97316' };
}

/** Arredonda para 2 casas (centavos). */
export const arredondar = (n) => Math.round(Number(n) * 100) / 100;

// ---------------------------------------------------------------- hooks
let cacheFiliais = null;

/** Filiais ativas (uma busca por sessão de página). */
export function useFiliais() {
  const [filiais, setFiliais] = useState(cacheFiliais || []);
  useEffect(() => {
    if (cacheFiliais) return undefined;
    let vivo = true;
    listarFiliais()
      .then((lista) => {
        cacheFiliais = Array.isArray(lista) ? lista : (lista?.content ?? []);
        if (vivo) setFiliais(cacheFiliais);
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, []);
  return filiais;
}

/**
 * Situação do caixa de hoje da filial. Sem filial escolhida não consulta. `erro` fica preenchido se a consulta falhar:
 * a tela de Venda não trava por isso (o backend continua barrando a venda sem caixa).
 */
export function useSituacaoCaixa(filialId) {
  const [situacao, setSituacao] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const recarregar = useCallback(async () => {
    if (!filialId) {
      setSituacao(null);
      return null;
    }
    setCarregando(true);
    try {
      const s = await situacaoCaixa(filialId);
      setSituacao(s);
      setErro('');
      return s;
    } catch (e) {
      setSituacao(null);
      setErro(mensagemErro(e));
      return null;
    } finally {
      setCarregando(false);
    }
  }, [filialId]);

  useEffect(() => { recarregar(); }, [recarregar]);

  // Um erro CAIXA_* em qualquer chamada indica que a situação mudou (caixa fechado no meio do carrinho, por exemplo).
  useEffect(() => {
    window.addEventListener(EVENTO_CAIXA_MUDOU, recarregar);
    return () => window.removeEventListener(EVENTO_CAIXA_MUDOU, recarregar);
  }, [recarregar]);

  return { situacao, carregando, erro, recarregar };
}

/**
 * O que o usuário pode fazer no caixa. Se a consulta falhar, a tela libera os botões e o backend recusa (403) quem
 * não pode: errar para o lado de mostrar não dá poder a ninguém.
 */
export function usePermissoesCaixa() {
  const [permissoes, setPermissoes] = useState({ conferirReabrir: true, todasAsFiliais: false, carregada: false });
  useEffect(() => {
    let vivo = true;
    permissoesCaixa()
      .then((p) => { if (vivo) setPermissoes({ ...p, carregada: true }); })
      .catch(() => { if (vivo) setPermissoes((atual) => ({ ...atual, carregada: true })); });
    return () => { vivo = false; };
  }, []);
  return permissoes;
}
