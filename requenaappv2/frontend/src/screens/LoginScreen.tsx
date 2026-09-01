import { useState, type FormEvent } from 'react';
import { useSession } from '../context/SessionContext';
import logo from '../assets/requena-logo.png';
import './LoginScreen.css';

export function LoginScreen() {
  const { login } = useSession();
  const [cnpj, setCnpj] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(cnpj, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <img src={logo} alt="REQUENA" className="login-logo" />
      <h3 style={{ margin: '0 0 4px' }}>Acesso do comprador</h3>
      <p className="text-muted" style={{ margin: '0 0 24px', fontSize: 13 }}>
        Entre com o CNPJ e a senha fornecidos pela REQUENA.
      </p>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="field">
          <label>CNPJ</label>
          <input className="input" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} autoComplete="username" />
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
      <p className="text-muted" style={{ fontSize: 11.5, marginTop: 20, textAlign: 'center' }}>
        Ainda não tem acesso? Fale com seu representante REQUENA.
      </p>
    </div>
  );
}
