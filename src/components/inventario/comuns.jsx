import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import * as api from '../../services/inventarioApi';

/** Peças visuais compartilhadas pelas telas do inventário. */

export function BadgeStatus({ status }) {
  const cor = status === 'FECHADO' ? 'good' : status === 'CANCELADO' ? 'neutral' : 'warn';
  return <span className={`badge ${cor}`}>{api.STATUS_EXECUCAO[status] || status}</span>;
}

export function Kpi({ rotulo, valor, cor, dica }) {
  return (
    <div className="kpi" style={{ padding: '10px 12px' }} title={dica}>
      <div className="lbl">{rotulo}</div>
      <div className="val mono" style={{ color: cor, fontSize: 22 }}>{valor}</div>
    </div>
  );
}

/** Badge com ícone pela cor (good/warn/bad); {@code rotulo} e {@code cor} permitem reaproveitar para o resultado por SKU. */
export function BadgeResultado({ resultado, rotulo, cor: corInformada }) {
  const cor = corInformada || api.corResultado(resultado);
  const Icone = cor === 'good' ? CheckCircle2 : cor === 'bad' ? XCircle : cor === 'warn' ? AlertTriangle : null;
  return (
    <span className={`badge ${cor}`} style={{ whiteSpace: 'nowrap' }}>
      {Icone && <Icone size={12} />} {rotulo || api.rotuloResultado(resultado)}
    </span>
  );
}
