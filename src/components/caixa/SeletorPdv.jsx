import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { semAcento } from '../relatorios/utilRelatorios';

/**
 * Seleção de PDV (filial) com busca. `value` é o id da filial ('' = nenhum/todos); `onChange` recebe o id (ou '').
 * `rotuloVazio` é o texto da opção que limpa a seleção ("Todos" nos filtros, "Escolha..." no formulário).
 */
export default function SeletorPdv({ filiais, value, onChange, rotuloVazio = 'Todos', largura = 320 }) {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState('');
  const escolhida = filiais.find((f) => String(f.id) === String(value));

  const visiveis = useMemo(() => {
    const t = semAcento(termo);
    return filiais.filter((f) => !t || semAcento(f.nome).includes(t));
  }, [filiais, termo]);

  const escolher = (id) => {
    onChange(id);
    setAberto(false);
    setTermo('');
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: largura }}>
      <div
        onClick={() => setAberto((a) => !a)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setAberto((a) => !a); }}
        style={{
          background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 12px',
          fontSize: 13, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 8,
        }}
      >
        <span>{escolhida ? escolhida.nome : rotuloVazio}</span>
        <ChevronDown size={15} color="var(--text-faint)" />
      </div>

      {aberto && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50, background: 'var(--panel)',
          border: '1px solid var(--line)', borderRadius: 6, boxShadow: '0 10px 25px rgba(0,0,0,0.3)', overflow: 'hidden',
        }}>
          <div style={{ padding: 8, background: 'var(--panel-2)', borderBottom: '1px solid var(--line)' }}>
            <input
              type="text"
              placeholder="Pesquisar loja..."
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              autoFocus
              style={{
                width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 4,
                padding: '6px 8px', color: 'var(--text)', fontSize: 12.5, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            <div
              onClick={() => escolher('')}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: !escolhida ? '#3b82f6' : 'transparent', color: !escolhida ? '#fff' : 'var(--text)',
              }}
            >
              {rotuloVazio}
            </div>
            {visiveis.map((f) => (
              <div
                key={f.id}
                onClick={() => escolher(String(f.id))}
                style={{
                  padding: '8px 16px', cursor: 'pointer', fontSize: 12.5,
                  background: String(f.id) === String(value) ? '#3b82f6' : 'transparent',
                  color: String(f.id) === String(value) ? '#fff' : 'var(--text)',
                }}
              >
                {f.nome}
              </div>
            ))}
            {visiveis.length === 0 && (
              <div style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--text-faint)' }}>Nenhuma loja encontrada.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
