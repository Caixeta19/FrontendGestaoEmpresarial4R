import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { EVENTO_CAIXA_MUDOU } from '../../services/api';
import { permissoesCaixa, situacaoCaixa } from '../../services/financeiroApi';
import { hoje } from '../relatorios/utilRelatorios';

const chaveDispensa = () => `syscor_aviso_caixa_${hoje()}`;
const lerDispensa = () => { try { return sessionStorage.getItem(chaveDispensa()) === '1'; } catch { return false; } };
const gravarDispensa = () => { try { sessionStorage.setItem(chaveDispensa(), '1'); } catch { /* sem storage: o aviso volta na próxima tela */ } };

/**
 * Aviso no topo para quem abre caixa da própria filial (gerente): "Caixa de hoje não aberto" com atalho, e o aviso de
 * caixa de dia anterior ainda aberto. Sem filial no cadastro, ou sem poder de abrir, não aparece. Falha na consulta não
 * mostra nada: o aviso é conveniência, quem barra a venda é o backend.
 */
export default function AvisoCaixaGerente() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [situacao, setSituacao] = useState(null);
  const [dispensado, setDispensado] = useState(lerDispensa);

  const carregar = useCallback(async () => {
    try {
      const { filialId } = await permissoesCaixa();
      if (!filialId) { setSituacao(null); return; }
      setSituacao(await situacaoCaixa(filialId));
    } catch {
      setSituacao(null);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => {
    window.addEventListener(EVENTO_CAIXA_MUDOU, carregar);
    return () => window.removeEventListener(EVENTO_CAIXA_MUDOU, carregar);
  }, [carregar]);

  if (!situacao || !situacao.podeAbrir || dispensado) return null;
  const naoAberto = !situacao.aberto;
  const avisos = situacao.avisos || [];
  if (!naoAberto && avisos.length === 0) return null;
  const naTelaDeCaixas = pathname.startsWith('/financeiro/caixa');

  return (
    <div role="alert" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      background: 'rgba(245, 158, 11, 0.14)', border: '1px solid #f59e0b', color: '#f59e0b',
      padding: '10px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, marginBottom: 16,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <AlertTriangle size={17} />
        {naoAberto && <span>Caixa de hoje não aberto: a filial só vende depois da abertura.</span>}
        {avisos.map((a) => <span key={a}>{a}</span>)}
      </span>
      <span style={{ display: 'inline-flex', gap: 8 }}>
        {!naTelaDeCaixas && (
          <button type="button" onClick={() => navigate('/financeiro/caixas-abertos')}
            style={{ background: '#f59e0b', border: 'none', color: '#1f1300', borderRadius: 6, padding: '6px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            {naoAberto ? 'Abrir caixa' : 'Ver caixas'}
          </button>
        )}
        <button type="button" aria-label="Dispensar aviso" title="Dispensar por hoje"
          onClick={() => { gravarDispensa(); setDispensado(true); }}
          style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
          <X size={16} />
        </button>
      </span>
    </div>
  );
}
