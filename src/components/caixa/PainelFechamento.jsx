import { useState } from 'react';
import { Lock } from 'lucide-react';
import { fecharCaixa } from '../../services/financeiroApi';
import LancamentosCaixa from './LancamentosCaixa';
import { inputEstiloFormulario } from './estilos';
import {
  arredondar, codigoErro, formatarMoeda, lerValorBR, mensagemErro, rotuloForma, useSituacaoCaixa,
} from './utilCaixa';

const MINIMO_JUSTIFICATIVA = 10;
const reais = (n) => (n === null || n === undefined ? '—' : Number(n).toFixed(2).replace('.', ','));
/** "+R$ 10,00" (sobra), "−R$ 5,00" (falta) ou "R$ 0,00". */
const comSinal = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${formatarMoeda(Math.abs(n))}`;
const corDaDiferenca = (n) => (n === 0 ? 'var(--good, #22c55e)' : 'var(--bad, #ef4444)');

/**
 * Conferência por forma de pagamento e fechamento do caixa aberto. Todas as formas exigidas começam vazias (nada
 * pré-preenchido): o gerente informa o que existe de fato em cada uma (dinheiro na gaveta; nas demais, o total recebido,
 * conferido contra o extrato ou a maquininha). O caixa só fecha com diferença zero em todas.
 * <ul>
 *   <li>Quem recebe o esperado (financeiro, gerente de área, auditoria e admin) vê a diferença de cada linha ao digitar e,
 *       com diferença, fecha informando a justificativa.</li>
 *   <li>O gerente da loja não recebe o esperado: só descobre ao clicar em Fechar, e o backend responde quais formas divergem
 *       (sem valores). Cada recusa gasta uma das 5 tentativas do dia.</li>
 * </ul>
 */
export default function PainelFechamento({ caixa, permissoes, onFechado, onAtualizar, onCancelar }) {
  const exigidas = caixa.formas.filter((f) => f.exigidaNoFechamento);
  const veEsperado = exigidas.some((f) => f.esperadoConferencia !== null && f.esperadoConferencia !== undefined);
  const podeDivergir = Boolean(permissoes?.fecharComDivergencia);
  const { situacao } = useSituacaoCaixa(caixa.filialId);
  const podeFechar = situacao ? situacao.podeFechar : true; // sem resposta, o backend decide

  const [valores, setValores] = useState({});
  const [observacao, setObservacao] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [resultado, setResultado] = useState({}); // { forma: 'DIVERGE' | 'OK' } depois de uma recusa do backend
  const [restantes, setRestantes] = useState(caixa.tentativasRestantes ?? null);
  const [bloqueadoNoBack, setBloqueadoNoBack] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const numero = (forma) => lerValorBR(valores[forma]);
  const preenchida = (f) => (valores[f.forma] ?? '').trim() !== '' && Number.isFinite(numero(f.forma)) && numero(f.forma) >= 0;
  const todasPreenchidas = exigidas.length > 0 && exigidas.every(preenchida);
  const diferencaDe = (f) => (veEsperado && preenchida(f) ? arredondar(numero(f.forma) - Number(f.esperadoConferencia)) : null);
  const haDiferenca = exigidas.some((f) => {
    const d = diferencaDe(f);
    return d !== null && d !== 0;
  });
  const justificativaOk = justificativa.trim().length >= MINIMO_JUSTIFICATIVA;
  const bloqueado = !podeDivergir && (bloqueadoNoBack || restantes === 0);
  const precisaJustificar = veEsperado && haDiferenca && podeDivergir;
  const semDiferencaNaTela = !(veEsperado && haDiferenca) || (podeDivergir && justificativaOk);
  const habilitado = podeFechar && todasPreenchidas && !enviando && !bloqueado && semDiferencaNaTela;

  const digitar = (forma, texto) => {
    if (!/^\d*([.,]\d{0,2})?$/.test(texto)) return; // só número, vírgula ou ponto, 2 casas, sem negativo
    setValores((v) => ({ ...v, [forma]: texto }));
    setResultado((r) => {
      const { [forma]: _descartada, ...resto } = r;
      return resto;
    });
    setErro('');
  };

  const fechar = async () => {
    setErro('');
    setEnviando(true);
    try {
      onFechado(await fecharCaixa(caixa.id, {
        formas: exigidas.map((f) => ({ forma: f.forma, valorConferido: arredondar(numero(f.forma)) })),
        observacao: observacao.trim() || undefined,
        justificativa: precisaJustificar ? justificativa.trim() : undefined,
      }));
    } catch (e) {
      const codigo = codigoErro(e);
      if (codigo === 'CAIXA_COM_DIFERENCA') {
        // O gerente da loja só fica sabendo quais formas divergem, sem o valor.
        const divergem = new Set((e.corpo?.formas || []).map((x) => x.forma));
        setResultado(Object.fromEntries(exigidas.map((f) => [f.forma, divergem.has(f.forma) ? 'DIVERGE' : 'OK'])));
        if (typeof e.corpo?.tentativasRestantes === 'number') setRestantes(e.corpo.tentativasRestantes);
      } else if (codigo === 'CAIXA_FECHAMENTO_BLOQUEADO') {
        setBloqueadoNoBack(true);
      }
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  const celulaDiferenca = (f) => {
    const d = diferencaDe(f);
    if (d !== null) return <b style={{ color: corDaDiferenca(d) }}>{comSinal(d)}</b>;
    if (resultado[f.forma] === 'DIVERGE') return <b style={{ color: 'var(--bad, #ef4444)' }}>Diverge</b>;
    if (resultado[f.forma] === 'OK') return <b style={{ color: 'var(--good, #22c55e)' }}>OK</b>;
    return '—';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
        Informe em <b>Valor contabilizado</b> o que existe de fato no caixa da loja. O caixa só fecha quando a diferença de todas as formas for zero.
      </p>

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
            {exigidas.map((f) => (
              <tr key={f.forma} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>
                  {rotuloForma(f.forma)}
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-faint)' }}>
                    {f.forma === 'DINHEIRO' ? 'dinheiro contado na gaveta' : 'total recebido: confira no extrato ou na maquininha'}
                  </span>
                </td>
                <td style={{ padding: '12px 0' }}>{reais(f.abertura)}</td>
                <td style={{ padding: '12px 0' }}>{reais(f.movimento)}</td>
                <td style={{ padding: '12px 0' }}>{reais(f.entradas)}</td>
                <td style={{ padding: '12px 0' }}>{reais(f.saidas)}</td>
                <td style={{ padding: '12px 0' }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={valores[f.forma] ?? ''}
                    onChange={(e) => digitar(f.forma, e.target.value)}
                    disabled={!podeFechar || bloqueado}
                    placeholder="0,00"
                    aria-label={`Valor contabilizado de ${rotuloForma(f.forma)}`}
                    autoComplete="off"
                    style={{ ...inputEstiloFormulario, width: 130, fontWeight: 700, padding: '4px 10px' }}
                  />
                </td>
                <td style={{ padding: '12px 0' }}>{celulaDiferenca(f)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!podeDivergir && restantes !== null && restantes < 5 && (
        <div role="status" style={{ fontSize: 12.5, fontWeight: 600, color: restantes === 0 ? 'var(--bad, #ef4444)' : '#f97316' }}>
          {restantes === 0
            ? 'Fechamento bloqueado: chame o financeiro.'
            : `Restam ${restantes} tentativa${restantes === 1 ? '' : 's'} de fechamento hoje.`}
        </div>
      )}
      {bloqueado && restantes !== 0 && (
        <div role="status" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--bad, #ef4444)' }}>Fechamento bloqueado: chame o financeiro.</div>
      )}

      <LancamentosCaixa
        caixaId={caixa.id}
        podeLancar={podeFechar}
        podeEstornar={Boolean(permissoes?.estornarLancamento)}
        onMudou={() => { setResultado({}); setErro(''); onAtualizar?.(); }}
      />

      {precisaJustificar && (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Justificativa da divergência (mín. {MINIMO_JUSTIFICATIVA} caracteres): o caixa fecha aguardando conferência
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            rows={3}
            maxLength={300}
            style={{ ...inputEstiloFormulario, resize: 'vertical', fontWeight: 400 }}
          />
        </label>
      )}

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
        Observação do fechamento (opcional)
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          rows={2}
          maxLength={300}
          style={{ ...inputEstiloFormulario, resize: 'vertical', fontWeight: 400 }}
        />
      </label>

      {erro && (
        <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid var(--bad, #ef4444)', color: 'var(--bad, #ef4444)', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          {erro}
        </div>
      )}

      {!podeFechar ? (
        <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
          Seu perfil só consulta esse caixa: quem fecha é o gerente da loja, o financeiro, o gerente de área ou a auditoria de caixa.
        </span>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onCancelar} disabled={enviando}
            style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '9px 20px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={fechar}
            disabled={!habilitado}
            title={habilitado ? undefined : 'Preencha o valor de todas as formas; o caixa só fecha com diferença zero'}
            style={{
              background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 24px', fontSize: 13.5,
              fontWeight: 700, cursor: habilitado ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)', opacity: habilitado ? 1 : 0.55,
            }}
          >
            <Lock size={15} /> {enviando ? 'Fechando…' : 'Fechar caixa'}
          </button>
        </div>
      )}
    </div>
  );
}
