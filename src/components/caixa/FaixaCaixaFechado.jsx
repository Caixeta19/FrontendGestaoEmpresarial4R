import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Faixa vermelha da tela de Venda quando o caixa de hoje da filial não foi aberto. Quem pode abrir caixa ganha o botão
 * que leva à tela de Caixas abertos; os botões de adicionar item e lançar ficam desabilitados pela própria tela.
 */
export default function FaixaCaixaFechado({ podeAbrir, onAbrir, onAtualizar }) {
  return (
    <div role="alert" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      background: 'rgba(239, 68, 68, 0.14)', border: '1px solid var(--bad, #ef4444)', color: 'var(--bad, #ef4444)',
      padding: '12px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={18} />
        O caixa de hoje ainda não foi aberto. Peça ao gerente para abrir o caixa antes de lançar vendas.
      </span>
      <span style={{ display: 'inline-flex', gap: 8 }}>
        {onAtualizar && (
          <button type="button" onClick={onAtualizar} title="Conferir de novo se o caixa já foi aberto"
            style={{ background: 'transparent', border: '1px solid var(--bad, #ef4444)', color: 'inherit', borderRadius: 6, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} /> Atualizar
          </button>
        )}
        {podeAbrir && (
          <button type="button" onClick={onAbrir}
            style={{ background: 'var(--bad, #ef4444)', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            Abrir caixa
          </button>
        )}
      </span>
    </div>
  );
}
