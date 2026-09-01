import { useState, type FormEvent } from 'react';
import { useAdminSession } from '../context/AdminSessionContext';
import logo from '../assets/requena-logo.png';

export function LoginScreen() {
  const { login } = useAdminSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <img src={logo} alt="REQUENA" className="admin-login-logo" />
        <h3 style={{ margin: '0 0 4px', textAlign: 'center' }}>Painel de controle</h3>
        <p className="text-muted" style={{ margin: '0 0 8px', fontSize: 13, textAlign: 'center' }}>
          Acesso restrito à equipe REQUENA
        </p>
        <div className="field">
          <label>Usuário</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div className="field">
          <label>Senha</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p style={{ color: '#e88', fontSize: 12.5, margin: 0 }}>{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
