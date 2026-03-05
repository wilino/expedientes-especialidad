import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/use-auth';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isInitializing, login } = useAuth();
  const [correo, setCorreo] = useState('admin@expedientes.local');
  const [password, setPassword] = useState('Admin@2026');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || '/';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(correo, password);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo iniciar sesión';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="panel login-card" onSubmit={onSubmit}>
        <p className="eyebrow">Sistema legal</p>
        <h1>Iniciar sesión</h1>
        <p className="muted">
          Accede a expedientes, auditoría y reportes con control RBAC.
        </p>

        <label className="field">
          Correo
          <input
            type="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="field">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
