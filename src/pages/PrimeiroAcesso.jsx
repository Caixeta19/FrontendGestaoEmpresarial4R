import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext.jsx';
import { alterarSenha } from '../services/vendasApi'; // Importação nomeada correta

export default function PrimeiroAcesso() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  async function handleAlterar(e) {
    e.preventDefault();

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      showToast('Preencha todos os campos.', true);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      showToast('A nova senha e a confirmação não coincidem.', true);
      return;
    }

    if (novaSenha.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.', true);
      return;
    }

    try {
      await alterarSenha(senhaAtual, novaSenha);

      showToast('Senha alterada com sucesso! Faça login com sua nova senha.', false);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (err) {
      showToast(err?.mensagem || 'Erro ao alterar a senha. Verifique a senha atual.', true);
    }
  }

  return (
    <div id="login-screen">
      <div className="login-hero">
        <div className="wordmark">
          <div className="mark">4R</div>
          <span>Solutions</span>
        </div>
        <div className="hero-copy">
          <div className="kicker">PRIMEIRO ACESSO · SEGURANÇA</div>
          <h1>Defina sua nova senha de acesso.</h1>
          <p>Por motivos de segurança, é obrigatória a alteração da senha temporária no seu primeiro acesso ao sistema.</p>
        </div>
      </div>
      <div className="login-form-wrap">
        <form className="login-form" onSubmit={handleAlterar}>
          <h2>Alteração de Senha</h2>
          <p>Insira a senha padrão atual e escolha uma nova senha segura.</p>

          <div className="field">
            <label>Senha Atual</label>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Digite a senha temporária"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Nova Senha</label>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Digite sua nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Confirmar Nova Senha</label>
            <div className="pw-row">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Confirme a nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPass((v) => !v)}>
                {showPass ? 'ocultar' : 'mostrar'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Salvar Nova Senha
          </button>
          
          <div className="login-foot">O sistema será redirecionado após a alteração.</div>
        </form>
      </div>
    </div>
  );
}