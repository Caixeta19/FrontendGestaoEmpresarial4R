import { useEffect, useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { abrirCaixa, sugestaoAberturaCaixa } from '../../services/financeiroApi';
import { inputEstiloFormulario } from './estilos';
import {
  FORMAS_DO_CAIXA, arredondar, formatarData, formatarMoeda, lerValorBR, mensagemErro, rotuloForma,
} from './utilCaixa';

const MINIMO_JUSTIFICATIVA = 10;
const emReais = (n) => Number(n).toFixed(2).replace('.', ',');

/**
 * Abertura do caixa de hoje: o gerente informa o dinheiro da gaveta (obrigatório, 0 vale). O valor vem preenchido com o
 * fechamento do último caixa desse caixa; se ele mudar, a justificativa passa a ser obrigatória. As outras formas abrem
 * com 0 e liquidam na conciliação.
 */
export default function FormularioAbertura({ filial, caixaPdv, onFechar, onAberto }) {
  const [sugestao, setSugestao] = useState(undefined); // undefined = carregando; { dinheiro: null } = nunca fechou
  const [dinheiro, setDinheiro] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vivo = true;
    sugestaoAberturaCaixa(filial.id, caixaPdv)
      .then((s) => {
        if (!vivo) return;
        setSugestao(s);
        if (s?.dinheiro !== null && s?.dinheiro !== undefined) setDinheiro(emReais(s.dinheiro));
      })
      .catch(() => { if (vivo) setSugestao({ dinheiro: null }); });
    return () => { vivo = false; };
  }, [filial.id, caixaPdv]);

  const valor = lerValorBR(dinheiro);
  const valorValido = dinheiro.trim() !== '' && Number.isFinite(valor) && valor >= 0;
  const temSugestao = sugestao && sugestao.dinheiro !== null && sugestao.dinheiro !== undefined;
  const mudouSugestao = temSugestao && valorValido && arredondar(valor) !== arredondar(sugestao.dinheiro);
  const justificativaOk = !mudouSugestao || justificativa.trim().length >= MINIMO_JUSTIFICATIVA;

  const abrir = async () => {
    setErro('');
    if (!valorValido) {
      setErro('Informe o valor em dinheiro da abertura (se a gaveta abre vazia, informe 0).');
      return;
    }
    if (!justificativaOk) {
      setErro(`Informe a justificativa da abertura (mín. ${MINIMO_JUSTIFICATIVA} caracteres): o dinheiro difere do fechamento anterior.`);
      return;
    }
    setEnviando(true);
    try {
      const caixa = await abrirCaixa({
        filialId: filial.id,
        caixaPdv,
        formasIniciais: [{ forma: 'DINHEIRO', valorAbertura: arredondar(valor) }],
        justificativaAbertura: mudouSugestao ? justificativa.trim() : undefined,
      });
      onAberto(caixa);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label="Abertura de caixa" style={{
        background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, maxWidth: 560, width: '100%',
        maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#f472b6' }}>Abrir caixa</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-faint)' }}>
              {filial.nome} · {caixaPdv} · hoje
            </p>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar" style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--text-dim)', fontSize: 12.5, textAlign: 'left' }}>
              <th style={{ paddingBottom: 8 }}>Forma de pagamento</th>
              <th style={{ paddingBottom: 8, width: 170 }}>Valor de abertura</th>
            </tr>
          </thead>
          <tbody>
            {FORMAS_DO_CAIXA.map((forma) => (
              <tr key={forma} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 0', fontWeight: 600 }}>{rotuloForma(forma)}</td>
                <td style={{ padding: '6px 0' }}>
                  {forma === 'DINHEIRO' ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={dinheiro}
                      onChange={(e) => setDinheiro(e.target.value)}
                      placeholder="0,00"
                      aria-label="Valor em dinheiro da abertura"
                      autoFocus
                      style={{ ...inputEstiloFormulario, fontWeight: 700 }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-faint)' }}>0,00</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sugestao === undefined && <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-faint)' }}>Buscando o fechamento anterior…</p>}
        {temSugestao && (
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-faint)' }}>
            Sugerido: <b style={{ color: 'var(--text)' }}>{formatarMoeda(sugestao.dinheiro)}</b>, dinheiro contado no fechamento
            de {formatarData(sugestao.dataUltimoFechamento)}. Para abrir com outro valor, justifique.
          </p>
        )}
        {sugestao && !temSugestao && (
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-faint)' }}>
            Primeira abertura desse caixa: informe quanto há na gaveta (0 se estiver vazia).
          </p>
        )}

        {mudouSugestao && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Justificativa da abertura (mín. {MINIMO_JUSTIFICATIVA} caracteres)
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={3}
              maxLength={300}
              style={{ ...inputEstiloFormulario, resize: 'vertical', fontWeight: 400 }}
            />
          </label>
        )}

        {erro && (
          <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid var(--bad, #ef4444)', color: 'var(--bad, #ef4444)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            {erro}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onFechar} disabled={enviando}
            style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="button" onClick={abrir} disabled={enviando || sugestao === undefined}
            style={{ background: 'var(--accent, #c026d3)', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: enviando ? 0.7 : 1 }}>
            <PlusCircle size={15} /> {enviando ? 'Abrindo…' : 'Abrir caixa'}
          </button>
        </div>
      </div>
    </div>
  );
}
