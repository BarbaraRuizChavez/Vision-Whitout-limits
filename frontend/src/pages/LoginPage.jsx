import { useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef(null);

  const redirectTo = location.state?.from || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <main id="contenido" tabIndex={-1} className="auth-card">
        <h1>Iniciar sesión</h1>

        {error && (
          <div className="error-summary" ref={errorRef} tabIndex={-1} role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="f-email">Correo electrónico</label>
            <input
              id="f-email"
              type="email"
              autoComplete="email"
              placeholder="Ingrese su correo"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label htmlFor="f-password">Contraseña</label>
            <input
              id="f-password"
              type="password"
              autoComplete="current-password"
              placeholder="Ingrese su contraseña"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="divider">o</div>
        <GoogleLoginButton onError={(msg) => { setError(msg); requestAnimationFrame(() => errorRef.current?.focus()); }} />

        <p className="link-row">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </main>
    </div>
  );
}
