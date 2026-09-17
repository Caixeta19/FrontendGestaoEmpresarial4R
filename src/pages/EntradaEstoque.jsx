import { useToast } from '../components/ToastContext.jsx';

export default function EntradaEstoque() {
  const showToast = useToast();

  return (
    <section className="view">
      <div className="topbar">
        <div>
          <h1>Entrada de estoque</h1>
          <div className="sub">Registro de recebimento (US-202)</div>
        </div>
      </div>
      <div className="panel">
        <div className="grid-3">
          <div className="field"><label>Fornecedor</label><input type="text" placeholder="Nome do fornecedor" /></div>
          <div className="field"><label>Nota fiscal</label><input type="text" placeholder="Número da NF-e" /></div>
          <div className="field"><label>Data de recebimento</label><input type="date" defaultValue="2026-08-31" /></div>
        </div>
        <div className="field autocomplete"><label>Produto (SKU)</label><input type="text" placeholder="Buscar produto por SKU ou nome…" /></div>
        <div className="grid-3">
          <div className="field"><label>Quantidade</label><input type="number" placeholder="0" /></div>
          <div className="field"><label>Custo unitário</label><input type="text" placeholder="R$ 0,00" /></div>
          <div className="field"><label>Lote / validade</label><input type="text" placeholder="Opcional" /></div>
        </div>
        <button className="btn solid" onClick={() => showToast('Entrada de estoque registrada.')}>Confirmar entrada</button>
      </div>
    </section>
  );
}
