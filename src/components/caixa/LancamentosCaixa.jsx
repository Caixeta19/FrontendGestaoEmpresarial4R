import { useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { estornarLancamentoCaixa, lancarNoCaixa, listarLancamentosCaixa } from '../../services/financeiroApi';
import { useToast } from '../ToastContext';
import { inputEstiloFormulario } from './estilos';
import { arredondar, formatarDataHora, formatarMoeda, lerValorBR, mensagemErro, novaChave } from './utilCaixa';

const MINIMO_JUSTIFICATIVA = 10;

const TIPOS = {
  SANGRIA: {
    titulo: 'Retirar dinheiro do caixa',
    ajuda: 'Sangria para depósito em conta.',
    rotuloConta: 'Conta de destino ou descrição',
    botao: 'Lançar sangria',
  },
  SUPRIMENTO: {
    titulo: 'Adicionar dinheiro ao caixa',
    ajuda: 'Suprimento resgatado de uma conta.',
    rotuloConta: 'Conta de origem ou descrição',
    botao: 'Lançar suprimento',
  },
};
const ROTULO_LANCAMENTO = { SANGRIA: 'Sangria', SUPRIMENTO: 'Suprimento', ESTORNO: 'Estorno' };

const caixaErro = { background: 'rgba(239,68,68,0.12)', border: '1px solid var(--bad, #ef4444)', color: 'var(--bad, #ef4444)', padding: '8px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600 };

/** Formulário inline de uma sangria ou de um suprimento. A chave de idempotência só muda depois que o lançamento é feito. */
function FormularioLancamento({ tipo, caixaId, onLancado, onCancelar }) {
  const texto = TIPOS[tipo];
  const [valor, setValor] = useState('');
  const [conta, setConta] = useState('');
  const [observacao, setObservacao] = useState('');
  const [chave, setChave] = useState(novaChave);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const numero = lerValorBR(valor);
  const valido = valor.trim() !== '' && Number.isFinite(numero) && numero > 0 && conta.trim() !== '';

  const lancar = async () => {
    setErro('');
    setEnviando(true);
    try {
      const l = await lancarNoCaixa(caixaId, {
        tipo, valor: arredondar(numero), conta: conta.trim(), observacao: observacao.trim() || undefined, chaveIdempotencia: chave,
      });
      setChave(novaChave());
      onLancado(l);
    } catch (e) {
      setErro(mensagemErro(e)); // a chave fica a mesma: tentar de novo não duplica
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--panel)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
          Valor
          <input type="text" inputMode="decimal" value={valor} placeholder="0,00"
            onChange={(e) => { if (/^\d*([.,]\d{0,2})?$/.test(e.target.value)) setValor(e.target.value); }}
            style={inputEstiloFormulario} aria-label={`Valor da ${tipo === 'SANGRIA' ? 'sangria' : 'entrada de suprimento'}`} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
          {texto.rotuloConta}
          <input type="text" value={conta} maxLength={100} onChange={(e) => setConta(e.target.value)} style={inputEstiloFormulario} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
          Observação
          <input type="text" value={observacao} maxLength={300} onChange={(e) => setObservacao(e.target.value)} style={inputEstiloFormulario} />
        </label>
      </div>
      {erro && <div role="alert" style={caixaErro}>{erro}</div>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancelar} disabled={enviando}
          style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="button" onClick={lancar} disabled={!valido || enviando}
          style={{ background: 'var(--accent, #c026d3)', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 16px', fontSize: 12.5, fontWeight: 700, cursor: !valido || enviando ? 'not-allowed' : 'pointer', opacity: !valido || enviando ? 0.55 : 1 }}>
          {enviando ? 'Lançando…' : 'Lançar'}
        </button>
      </div>
    </div>
  );
}

/** Estorno inline de um lançamento: justificativa obrigatória; cria a contrapartida, nunca apaga a linha. */
function FormularioEstorno({ caixaId, lancamento, onEstornado, onCancelar }) {
  const [justificativa, setJustificativa] = useState('');
  const [chave, setChave] = useState(novaChave);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const valida = justificativa.trim().length >= MINIMO_JUSTIFICATIVA;

  const estornar = async () => {
    setErro('');
    setEnviando(true);
    try {
      const e = await estornarLancamentoCaixa(caixaId, lancamento.id, { justificativa: justificativa.trim(), chaveIdempotencia: chave });
      setChave(novaChave());
      onEstornado(e);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--panel)' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
        Justificativa do estorno da {ROTULO_LANCAMENTO[lancamento.tipo].toLowerCase()} de {formatarMoeda(lancamento.valor)} (mín. {MINIMO_JUSTIFICATIVA} caracteres)
        <input type="text" value={justificativa} maxLength={300} autoFocus onChange={(e) => setJustificativa(e.target.value)} style={inputEstiloFormulario} />
      </label>
      {erro && <div role="alert" style={caixaErro}>{erro}</div>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancelar} disabled={enviando}
          style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '5px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
          Voltar
        </button>
        <button type="button" onClick={estornar} disabled={!valida || enviando}
          style={{ background: '#dc2626', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 14px', fontSize: 12.5, fontWeight: 700, cursor: !valida || enviando ? 'not-allowed' : 'pointer', opacity: !valida || enviando ? 0.55 : 1 }}>
          {enviando ? 'Estornando…' : 'Estornar'}
        </button>
      </div>
    </div>
  );
}

/**
 * Sangria e suprimento de dinheiro no caixa. No painel de fechamento é o bloco "Ao fechar o caixa" (duas opções que abrem
 * o formulário na própria tela); no detalhe do caixa é só a lista (`somenteLeitura`). Os lançamentos entram no esperado do
 * dinheiro: depois de lançar, o valor contado é o que sobrou na gaveta.
 */
export default function LancamentosCaixa({ caixaId, podeLancar = false, podeEstornar = false, somenteLeitura = false, onMudou }) {
  const showToast = useToast();
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState({ SANGRIA: false, SUPRIMENTO: false });
  const [estornando, setEstornando] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLista(await listarLancamentosCaixa(caixaId));
      setErro('');
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }, [caixaId]);

  useEffect(() => { carregar(); }, [carregar]);

  const mudou = async (mensagem) => {
    showToast(mensagem, false);
    await carregar();
    onMudou?.();
  };

  if (somenteLeitura && (!lista || lista.length === 0) && !erro) return null;

  return (
    <fieldset style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '12px 16px', background: 'var(--panel-2)', display: 'flex', flexDirection: 'column', gap: 12, margin: 0 }}>
      <legend style={{ padding: '0 8px', fontSize: 12.5, color: 'var(--text-faint)', fontWeight: 600 }}>
        {somenteLeitura ? 'Sangrias e suprimentos de dinheiro' : 'Ao fechar o caixa'}
      </legend>

      {!somenteLeitura && podeLancar && Object.keys(TIPOS).map((tipo) => (
        <div key={tipo} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={aberto[tipo]} onChange={(e) => setAberto((a) => ({ ...a, [tipo]: e.target.checked }))} />
            <span><b>{TIPOS[tipo].titulo}</b> <span style={{ color: 'var(--text-faint)' }}>— {TIPOS[tipo].ajuda}</span></span>
          </label>
          {aberto[tipo] && (
            <FormularioLancamento
              tipo={tipo}
              caixaId={caixaId}
              onCancelar={() => setAberto((a) => ({ ...a, [tipo]: false }))}
              onLancado={(l) => {
                setAberto((a) => ({ ...a, [tipo]: false }));
                mudou(`${ROTULO_LANCAMENTO[l.tipo]} de ${formatarMoeda(l.valor)} lançada. Conte o dinheiro que sobrou na gaveta.`);
              }}
            />
          )}
        </div>
      ))}

      {!somenteLeitura && !podeLancar && (
        <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Seu perfil só consulta os lançamentos desse caixa.</span>
      )}

      {erro && <div role="alert" style={caixaErro}>{erro}</div>}

      {lista && lista.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-faint)' }}>
                <th style={{ padding: '6px 8px' }}>Lançamento</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Valor</th>
                <th style={{ padding: '6px 8px' }}>Conta</th>
                <th style={{ padding: '6px 8px' }}>Quem</th>
                <th style={{ padding: '6px 8px' }}>Quando</th>
                <th style={{ padding: '6px 8px' }}>Situação</th>
                {!somenteLeitura && podeEstornar && <th style={{ padding: '6px 8px' }} />}
              </tr>
            </thead>
            <tbody>
              {lista.map((l) => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--line)', opacity: l.estornado ? 0.6 : 1 }}>
                  <td style={{ padding: '7px 8px', fontWeight: 600 }}>{ROTULO_LANCAMENTO[l.tipo]}</td>
                  <td style={{ padding: '7px 8px', textAlign: 'right' }}>{formatarMoeda(l.valor)}</td>
                  <td style={{ padding: '7px 8px' }}>{l.conta || l.descricao || '—'}{l.observacao ? ` · ${l.observacao}` : ''}</td>
                  <td style={{ padding: '7px 8px' }}>{l.criadoPor || '—'}</td>
                  <td style={{ padding: '7px 8px' }}>{formatarDataHora(l.criadoEm)}</td>
                  <td style={{ padding: '7px 8px' }}>
                    {l.tipo === 'ESTORNO' ? `Desfaz #${l.estornadoDeId}: ${l.justificativa || ''}` : l.estornado ? 'Estornado' : '—'}
                  </td>
                  {!somenteLeitura && podeEstornar && (
                    <td style={{ padding: '7px 8px', textAlign: 'right' }}>
                      {l.tipo !== 'ESTORNO' && !l.estornado && (
                        <button type="button" onClick={() => setEstornando(l)} title="Estornar este lançamento"
                          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 600 }}>
                          <RotateCcw size={14} /> Estornar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {estornando && (
        <FormularioEstorno
          caixaId={caixaId}
          lancamento={estornando}
          onCancelar={() => setEstornando(null)}
          onEstornado={() => { setEstornando(null); mudou('Lançamento estornado.'); }}
        />
      )}
    </fieldset>
  );
}
