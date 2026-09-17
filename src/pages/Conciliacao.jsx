import { conciliacaoDemo } from '../data/demoData.js';

const badges = {
  ok: <span className="badge good">Conciliado</span>,
  divergencia: <span className="badge bad">Divergência</span>,
  pendente: <span className="badge warn">Pendente</span>,
};

export default function Conciliacao() {
  return (
    <section className="view">
      <div className="topbar">
        <div>
          <h1>Conciliação de cartões</h1>
          <div className="sub">Cruzamento entre vendas e extratos das operadoras (US-105)</div>
        </div>
        <div className="topbar-actions"><button className="btn ghost">Importar extrato</button></div>
      </div>
      <div className="kpi-row">
        <div className="kpi"><div className="lbl">Transações conciliadas</div><div className="val mono" style={{ color: 'var(--good)' }}>184</div></div>
        <div className="kpi"><div className="lbl">Pendentes</div><div className="val mono" style={{ color: 'var(--warn)' }}>6</div></div>
        <div className="kpi"><div className="lbl">Divergências</div><div className="val mono" style={{ color: 'var(--bad)' }}>2</div></div>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Data</th><th>Operadora</th><th>NSU</th><th>Venda</th><th>Valor venda</th><th>Valor extrato</th><th>Status</th></tr></thead>
            <tbody>
              {conciliacaoDemo.map((c) => (
                <tr key={c.nsu}>
                  <td className="mono">{c.data}</td>
                  <td>{c.op}</td>
                  <td className="mono">{c.nsu}</td>
                  <td>{c.venda}</td>
                  <td className="mono">{c.vv}</td>
                  <td className="mono">{c.ve}</td>
                  <td>{badges[c.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
