import { useState } from 'react';
import { baixarComprovante } from '../../services/financeiroApi';
import { STATUS_FILTRO, ORIGEM_BAIXA, badgeConta, dataBR, formatarMoeda, mensagemErro } from './utilContasPagar.js';

/**
 * Filtros + tabela de contas. Os botões seguem `permissoes` (o backend confere de novo).
 * `acao(tipo, conta)` abre o modal correspondente no orquestrador.
 */
export default function ListaContasPagar({ contas, filtros, onFiltros, permissoes, destaque, bancoPorConta = {}, acao, showToast }) {
  const [baixando, setBaixando] = useState(null);

  const abrirComprovante = async (c) => {
    if (baixando) return;
    if (!c.temComprovante && c.comprovanteUrl) {
      window.open(c.comprovanteUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setBaixando(c.id);
    try {
      await baixarComprovante(c.id);
    } catch (e) {
      showToast(mensagemErro(e), true);
    } finally {
      setBaixando(null);
    }
  };

  const mudar = (campo) => (e) => onFiltros({ ...filtros, [campo]: e.target.value });

  return (
    <>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', padding: '12px 14px' }}>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="f-status">Status</label>
          <select id="f-status" value={filtros.status} onChange={mudar('status')}>
            {STATUS_FILTRO.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </div>
        <div className="field" style={{ margin: 0 }}><label htmlFor="f-de">Vencimento de</label><input id="f-de" type="date" value={filtros.vencimentoDe} onChange={mudar('vencimentoDe')} /></div>
        <div className="field" style={{ margin: 0 }}><label htmlFor="f-ate">até</label><input id="f-ate" type="date" value={filtros.vencimentoAte} onChange={mudar('vencimentoAte')} /></div>
        <div className="field" style={{ margin: 0, flex: 1, minWidth: 200 }}>
          <label htmlFor="f-busca">Buscar</label>
          <input id="f-busca" placeholder="Descrição ou fornecedor" value={filtros.busca} onChange={mudar('busca')} />
        </div>
        {permissoes.gerenciar && <button type="button" className="btn solid" onClick={() => acao('nova')}>Nova conta</button>}
      </div>

      {contas.length === 0 ? (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-faint)' }}>
          {filtros.status || filtros.vencimentoDe || filtros.vencimentoAte || filtros.busca
            ? 'Nenhuma conta encontrada com esses filtros.'
            : 'Nenhuma conta a pagar. Cadastre a primeira.'}
        </div>
      ) : (
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Descrição</th><th>Fornecedor</th><th>Vencimento</th><th>Valor</th><th>Status</th><th>Pago em</th><th>Banco</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {contas.map((c) => {
                const [classe, texto] = badgeConta(c);
                const pendente = c.status === 'ABERTO' || c.status === 'DIVERGENTE';
                return (
                  <tr key={c.id} style={destaque[c.id] ? { background: 'var(--good-soft)', transition: 'background .4s' } : undefined}>
                    <td><b>{c.descricao}</b>{c.categoria ? <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{c.categoria}</div> : null}</td>
                    <td>{c.fornecedor}</td>
                    <td className="mono">{dataBR(c.vencimento)}</td>
                    <td className="mono">
                      {formatarMoeda(c.valor)}
                      {c.status === 'DIVERGENTE' && bancoPorConta[c.id] != null && (
                        <div style={{ fontSize: 12, color: 'var(--bad)' }}>Banco: {formatarMoeda(bancoPorConta[c.id])}</div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${classe}`}>{texto}</span>
                      {c.status === 'BAIXADO' && c.origemBaixa && (
                        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{ORIGEM_BAIXA[c.origemBaixa] || c.origemBaixa}</div>
                      )}
                    </td>
                    <td className="mono">{dataBR(c.dataPagamento)}</td>
                    <td>{c.banco || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" className="btn sm" onClick={() => acao('historico', c)}>Histórico</button>
                        {permissoes.gerenciar && pendente && <button type="button" className="btn sm" onClick={() => acao('editar', c)}>Editar</button>}
                        {permissoes.baixaManual && pendente && <button type="button" className="btn sm" onClick={() => acao('baixa', c)}>Baixa manual</button>}
                        {permissoes.gerenciar && pendente && <button type="button" className="btn sm danger" onClick={() => acao('cancelar', c)}>Cancelar</button>}
                        {permissoes.baixaManual && c.status === 'BAIXADO' && <button type="button" className="btn sm" onClick={() => acao('reabrir', c)}>Reabrir</button>}
                        {c.status === 'BAIXADO' && (c.temComprovante || c.comprovanteUrl) && (
                          <button type="button" className="btn sm" disabled={baixando === c.id} onClick={() => abrirComprovante(c)}>
                            {baixando === c.id ? 'Abrindo…' : 'Comprovante'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
