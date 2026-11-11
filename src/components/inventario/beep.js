// Beep curto pela Web Audio API (sem arquivo de som): agudo para OK, grave e duplo para problema.
let contexto = null;

function tocar(frequencia, duracaoMs, inicioMs = 0) {
  try {
    contexto = contexto || new (window.AudioContext || window.webkitAudioContext)();
    if (contexto.state === 'suspended') contexto.resume();
    const inicio = contexto.currentTime + inicioMs / 1000;
    const oscilador = contexto.createOscillator();
    const ganho = contexto.createGain();
    oscilador.type = 'square';
    oscilador.frequency.value = frequencia;
    ganho.gain.setValueAtTime(0.08, inicio);
    ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracaoMs / 1000);
    oscilador.connect(ganho).connect(contexto.destination);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracaoMs / 1000);
  } catch {
    // navegador sem áudio: segue sem som
  }
}

/** tom: 'verde' | 'laranja' | 'vermelho' | 'cinza' */
export function beep(tom) {
  if (tom === 'verde') {
    tocar(1320, 90);
  } else if (tom === 'cinza') {
    tocar(660, 70);
  } else {
    tocar(330, 140);
    tocar(330, 140, 190);
  }
}
