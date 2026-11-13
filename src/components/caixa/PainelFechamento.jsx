import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { fecharCaixa, previaFechamentoCaixa } from '../../services/financeiroApi';
import { inputEstiloFormulario } from './estilos';
import {
  arredondar, codigoErro, formatarMoeda, lerValorBR, mensagemErro, rotuloForma, useSituacaoCaixa,
} from './utilCaixa';

const MINIMO_OBSERVACAO = 10;
const reais = (n) => (n === null || n === undefined ? '—' : Number(n).toFixed(2).replace('.', ','));
/** "+R$ 10,00" (sobra), "−R$ 5,00" (falta) ou "R$ 0,00". */
const comSinal = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${formatarMoeda(Math.abs(n))}`;
const corDaDiferenca = (n) => (n === 0 ? 'var(--good, #22c55e)' : n > 0 ? '#f97316' : 'var(--bad, #ef4444)');

/**
 * Fechamento do caixa aberto. O dinheiro contado começa sempre vazio (fechamento cego): o gerente conta a gaveta e digita;
 * só então aparecem o esperado pelas vendas e a diferença (contado − esperado). Só o dinheiro é contado: PIX, Vivo Pay,
 * cartões e boleto liquidam na conciliação e fecham sem diferença. Fechar com diferença exige observação e confirmação.
 */
export default function PainelFechamento({ caixa, onFechado }) {
  const dinheiro = caixa.formas.find((f) => f.forma === 'DINHEIRO');
  const esperadoDoCaixa = dinheiro?.contabilizadoEsperado; // null para o gerente: o caixa aberto não mostra o esperado
  const [contado, setContado] = useState('');
  const [observacao, setObservacao] = useState('');
  const [previa, setPrevia] = useState(null); // { valorContado, esperado, diferenca } vinda do back, quando o esperado não veio
  const [diferencaDoBack, setDiferencaDoBack] = useState(null); // diferença informada pelo 422 do fechamento
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { situacao } = useSituacaoCaixa(caixa.filialId);
  const podeFechar = situacao ? situacao.podeAbrir : true; // sem resposta, o backend decide

  const valor = lerValorBR(contado);
  const valorValido = contado.trim() !== '' && Number.isFinite(valor) && valor >= 0;
  const valorArredondado = valorValido ? arredondar(valor) : null;
  const esperadoVisivel = esperadoDoCaixa !== null && esperadoDoCaixa !== undefined;

  // Esperado e diferença: calculados na tela quando o esperado veio; senão, vêm da prévia do back para o valor digitado.
  const previaAtual = previa && previa.valorContado === valorArredondado ? previa : null;
  const esperado = !valorValido ? null : esperadoVisivel ? Number(esperadoDoCaixa) : previaAtual?.esperado ?? null;
  const diferenca = !valorValido
    ? null
    : esperadoVisivel
      ? arredondar(valor - Number(esperadoDoCaixa))
      : previaAtual?.diferenca ?? diferencaDoBack;
  const haDiferenca = diferenca !== null && diferenca !== 0;

  // Prévia da diferença para quem não recebe o esperado (espera uma pausa na digitação).
  useEffect(() => {
    if (esperadoVisivel || !valorValido) return undefined;
    let vivo = true;
    const t = setTimeout(() => {
      previaFechamentoCaixa(caixa.id, valorArredondado)
        .then((r) => {
          if (vivo) {
            setPrevia({ valorContado: arredondar(r.valorContado), esperado: Number(r.contabilizadoEsperado), diferenca: Number(r.diferenca) });
          }
        })
        .catch(() => { /* sem prévia: o back informa a diferença ao fechar */ });
    }, 400);
    return () => { vivo = false; clearTimeout(t); };
  }, [caixa.id, esperadoVisivel, valorValido, valorArredondado]);

  const alterarContado = (texto) => {
    if (!/^\d*([.,]\d{0,2})?$/.test(texto)) return; // só número, vírgula ou ponto, 2 casas, sem negativo
    setContado(texto);
    setConfirmando(false);
    setDiferencaDoBack(null);
    setErro('');
  };

  const enviar = async () => {
    setEnviando(true);
    setErro('');
    try {
      onFechado(await fecharCaixa(
        caixa.id,
        [{ forma: 'DINHEIRO', valorConferido: valorArredondado }],
        haDiferenca ? observacao.trim() : undefined,
      ));
    } catch (e) {
      if (codigoErro(e) === 'CAIXA_DIFERENCA_SEM_OBSERVACAO') {
        // O back conferiu a diferença e falta a observação: mostra o valor e pede a confirmação.
        setDiferencaDoBack(Number(e.corpo?.diferenca));
        setConfirmando(false);
      }
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const fechar = () => {
    setErro('');
    if (!valorValido) {
      setErro('Informe o valor contado na gaveta.');
      return;
    }
    if (!haDiferenca) {
      enviar();
      return;
    }
    if (observacao.trim().length < MINIMO_OBSERVACAO) {
      setErro(`O caixa fecha com diferença de ${comSinal(diferenca)}: informe a observação (mín. ${MINIMO_OBSERVACAO} caracteres).`);
      return;
    }
    setConfirmando(true);
  };

  // Sem a prévia (back antigo ou falha) o gerente fecha direto e o back avisa a diferença: aí o formulário passa a pedir a observação.
  const pedirObservacao = haDiferenca && podeFechar;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13, color: 'var(--text)' }}>
          <thead>
            <tr style={{ color: 'var(--text-dim)', fontSize: 12.5, fontWeight: 700 }}>
              <th style={{ paddingBottom: 12 }}>Forma de Pagamento</th>
              <th style={{ paddingBottom: 12 }}>Valor de Abertura</th>
              <th style={{ paddingBottom: 12 }}>Movimento de Caixa</th>
              <th style={{ paddingBottom: 12 }}>Entradas</th>
              <th style={{ paddingBottom: 12 }}>Saídas</th>
              <th style={{ paddingBottom: 12 }}>Valor contabilizado</th>
              <th style={{ paddingBottom: 12 }}>Diferença</th>
            </tr>
          </thead>
          <tbody>
            {caixa.formas.map((f) => {
              const ehDinheiro = f.forma === 'DINHEIRO';
              return (
                <tr key={f.forma} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600 }}>
                    {rotuloForma(f.forma)}
                    {f.liquidaNaConciliacao && (
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-faint)' }}>liquida na conciliação</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 0' }}>{reais(f.abertura)}</td>
                  <td style={{ padding: '12px 0' }}>{reais(f.movimento)}</td>
                  <td style={{ padding: '12px 0' }}>{reais(f.entradas)}</td>
                  <td style={{ padding: '12px 0' }}>{reais(f.saidas)}</td>
                  <td style={{ padding: '12px 0' }}>
                    {ehDinheiro ? (
                      <input
                        type="text"
                        inputMode="decimal"
                        value={contado}
                        onChange={(e) => alterarContado(e.target.value)}
                        disabled={!podeFechar}
                        placeholder="Informe o valor contado na gaveta"
                        aria-label="Valor contado na gaveta"
                        autoComplete="off"
                        style={{ ...inputEstiloFormulario, width: 250, fontWeight: 700, padding: '4px 10px' }}
                      />
                    ) : (
                      reais(f.contabilizadoEsperado)
                    )}
                  </td>
                  <td style={{ padding: '12px 0', fontWeight: 700, color: ehDinheiro && diferenca !== null ? corDaDiferenca(diferenca) : 'inherit' }}>
                    {ehDinheiro ? (diferenca === null ? '—' : comSinal(diferenca)) : '0,00'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        aria-live="polite"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 28px', fontSize: 13.5, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--panel)' }}
      >
        <span>Esperado pelas vendas: <b>{esperado === null ? '—' : formatarMoeda(esperado)}</b></span>
        <span>Contado: <b>{valorValido ? formatarMoeda(valorArredondado) : '—'}</b></span>
        <span>
          Diferença:{' '}
          <b style={{ color: diferenca === null ? 'inherit' : corDaDiferenca(diferenca) }}>
            {diferenca === null ? '—' : comSinal(diferenca)}
          </b>
        </span>
      </div>

      {pedirObservacao && (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Observação da diferença (mín. {MINIMO_OBSERVACAO} caracteres)
          <textarea
            value={observacao}
            onChange={(e) => { setObservacao(e.target.value); setConfirmando(false); }}
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

      {!podeFechar && (
        <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
          Seu perfil só consulta esse caixa: quem fecha é o gerente da loja ou a auditoria de caixa.
        </span>
      )}

      {podeFechar && confirmando && haDiferenca && (
        <div role="alertdialog" aria-label="Confirmar fechamento com diferença" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          border: `1px solid ${corDaDiferenca(diferenca)}`, borderRadius: 8, padding: '12px 16px', background: 'var(--panel)',
        }}>
          <b style={{ fontSize: 14, color: corDaDiferenca(diferenca) }}>Fechar com diferença de {comSinal(diferenca)}?</b>
          <span style={{ display: 'inline-flex', gap: 8 }}>
            <button type="button" onClick={() => setConfirmando(false)} disabled={enviando}
              style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Voltar e recontar
            </button>
            <button type="button" onClick={enviar} disabled={enviando}
              style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: enviando ? 0.7 : 1 }}>
              {enviando ? 'Fechando…' : 'Sim, fechar caixa'}
            </button>
          </span>
        </div>
      )}

      {podeFechar && !confirmando && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={fechar}
            disabled={enviando || !valorValido}
            title={valorValido ? undefined : 'Informe o valor contado na gaveta'}
            style={{
              background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 24px', fontSize: 13.5,
              fontWeight: 700, cursor: enviando || !valorValido ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)', opacity: enviando || !valorValido ? 0.55 : 1,
            }}
          >
            <Lock size={15} /> {enviando ? 'Fechando…' : 'Fechar caixa'}
          </button>
        </div>
      )}
    </div>
  );
}
