import { useState } from 'react';
import { Lock } from 'lucide-react';
import { fecharCaixa } from '../../services/financeiroApi';
import { inputEstiloFormulario } from './estilos';
import { arredondar, formatarMoeda, lerValorBR, mensagemErro, rotuloForma, useSituacaoCaixa } from './utilCaixa';

const MINIMO_OBSERVACAO = 10;
const reais = (n) => Number(n || 0).toFixed(2).replace('.', ',');

/**
 * Conferência e fechamento de um caixa aberto. Só o dinheiro é contado: PIX, Vivo Pay, cartões e boleto liquidam na
 * conciliação e fecham sem diferença. Fechar com diferença exige observação.
 */
export default function PainelFechamento({ caixa, onFechado }) {
  const dinheiro = caixa.formas.find((f) => f.forma === 'DINHEIRO');
  const [contado, setContado] = useState(reais(dinheiro?.contabilizadoEsperado));
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { situacao } = useSituacaoCaixa(caixa.filialId);
  const podeFechar = situacao ? situacao.podeAbrir : true; // sem resposta, o backend decide

  const valor = lerValorBR(contado);
  const valorValido = contado.trim() !== '' && Number.isFinite(valor) && valor >= 0;
  const esperado = Number(dinheiro?.contabilizadoEsperado || 0);
  const diferenca = valorValido ? arredondar(valor - esperado) : null;
  const haDiferenca = diferenca !== null && diferenca !== 0;

  const fechar = async () => {
    setErro('');
    if (!valorValido) {
      setErro('Informe o dinheiro contado na gaveta.');
      return;
    }
    if (haDiferenca && observacao.trim().length < MINIMO_OBSERVACAO) {
      setErro(`O caixa fecha com diferença de ${formatarMoeda(diferenca)}: informe a observação (mín. ${MINIMO_OBSERVACAO} caracteres).`);
      return;
    }
    setEnviando(true);
    try {
      const fechado = await fecharCaixa(
        caixa.id,
        [{ forma: 'DINHEIRO', valorConferido: arredondar(valor) }],
        haDiferenca ? observacao.trim() : undefined,
      );
      onFechado(fechado);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

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
                        onChange={(e) => setContado(e.target.value)}
                        disabled={!podeFechar}
                        aria-label="Dinheiro contado"
                        style={{ ...inputEstiloFormulario, width: 120, fontWeight: 700, padding: '4px 10px' }}
                      />
                    ) : (
                      reais(f.contabilizadoEsperado)
                    )}
                  </td>
                  <td style={{ padding: '12px 0', fontWeight: 600, color: ehDinheiro && haDiferenca ? 'var(--bad, #ef4444)' : 'inherit' }}>
                    {ehDinheiro ? (diferenca === null ? '—' : reais(diferenca)) : '0,00'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {haDiferenca && podeFechar && (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Observação da diferença (mín. {MINIMO_OBSERVACAO} caracteres)
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
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

      {podeFechar ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={fechar}
            disabled={enviando}
            style={{
              background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 24px', fontSize: 13.5,
              fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)', opacity: enviando ? 0.7 : 1,
            }}
          >
            <Lock size={15} /> {enviando ? 'Fechando…' : 'Fechar caixa'}
          </button>
        </div>
      ) : (
        <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
          Seu perfil só consulta esse caixa: quem fecha é o gerente da loja ou a auditoria de caixa.
        </span>
      )}
    </div>
  );
}
