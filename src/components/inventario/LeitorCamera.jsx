import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const FORMATOS = ['code_128', 'code_39', 'ean_13', 'ean_8', 'itf', 'qr_code', 'data_matrix'];
/** Mesmo código lido de novo dentro deste intervalo é ignorado (a câmera lê o mesmo quadro várias vezes). */
const INTERVALO_MESMO_CODIGO_MS = 2500;

/**
 * Lê código de barras (Code128/EAN do IMEI na caixa ou na etiqueta) pela câmera do celular e chama onLeitura a cada
 * código novo. Usa o BarcodeDetector do navegador quando existe; senão carrega o @zxing/browser sob demanda.
 * A câmera só abre em HTTPS ou localhost.
 */
export default function LeitorCamera({ onLeitura, onFechar }) {
  const videoRef = useRef(null);
  const [erro, setErro] = useState('');
  const [motor, setMotor] = useState('');
  const ultimaLeitura = useRef({ codigo: '', em: 0 });
  const onLeituraRef = useRef(onLeitura);
  onLeituraRef.current = onLeitura;

  useEffect(() => {
    let ativo = true;
    let stream = null;
    let timer = null;
    let controlesZxing = null;

    const entregar = (codigo) => {
      const texto = String(codigo || '').trim();
      if (!texto) return;
      const agora = Date.now();
      if (texto === ultimaLeitura.current.codigo && agora - ultimaLeitura.current.em < INTERVALO_MESMO_CODIGO_MS) return;
      ultimaLeitura.current = { codigo: texto, em: agora };
      onLeituraRef.current(texto);
    };

    async function iniciar() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErro('Este navegador não permite usar a câmera (a página precisa estar em HTTPS).');
        return;
      }
      try {
        if ('BarcodeDetector' in window) {
          let suportados = [];
          try {
            suportados = (await window.BarcodeDetector.getSupportedFormats?.()) || [];
          } catch {
            suportados = [];
          }
          const formatos = FORMATOS.filter((f) => !suportados.length || suportados.includes(f));
          const detector = new window.BarcodeDetector({ formats: formatos });
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
          if (!ativo) return;
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setMotor('BarcodeDetector');
          timer = setInterval(async () => {
            if (!ativo || !videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const codigos = await detector.detect(videoRef.current);
              if (codigos.length) entregar(codigos[0].rawValue);
            } catch {
              // quadro ilegível: tenta no próximo
            }
          }, 250);
        } else {
          const { BrowserMultiFormatReader } = await import('@zxing/browser');
          if (!ativo) return;
          const leitor = new BrowserMultiFormatReader();
          setMotor('zxing');
          controlesZxing = await leitor.decodeFromVideoDevice(undefined, videoRef.current, (resultado) => {
            if (resultado) entregar(resultado.getText());
          });
          if (!ativo) controlesZxing.stop();
        }
      } catch (e) {
        if (!ativo) return;
        setErro(e?.name === 'NotAllowedError'
          ? 'Permissão da câmera negada. Libere a câmera nas configurações do navegador.'
          : 'Não foi possível abrir a câmera: ' + (e?.message || e));
      }
    }

    iniciar();
    return () => {
      ativo = false;
      if (timer) clearInterval(timer);
      if (controlesZxing) controlesZxing.stop();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bipar pela câmera"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}
    >
      <div className="panel" style={{ width: '100%', maxWidth: 520, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b>Bipar pela câmera</b>
          <button type="button" className="btn sm ghost" onClick={onFechar} aria-label="Fechar câmera">
            <X size={16} />
          </button>
        </div>
        {erro ? (
          <span role="alert" style={{ color: 'var(--bad)', fontSize: 13 }}>{erro}</span>
        ) : (
          <>
            <video ref={videoRef} muted playsInline style={{ width: '100%', borderRadius: 8, background: '#000', aspectRatio: '4 / 3', objectFit: 'cover' }} />
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              Aponte para o código de barras do IMEI (caixa ou etiqueta). Cada código novo é bipado na hora.
              {motor ? ` (${motor})` : ''}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
