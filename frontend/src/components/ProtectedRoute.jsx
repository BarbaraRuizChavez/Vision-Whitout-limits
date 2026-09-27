import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envuelve una página que requiere sesión iniciada. Si además se pasa
// `role`, exige que el usuario tenga exactamente ese rol (ej. "administrador").
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return (
      <main id="contenido" tabIndex={-1} className="container section">
        <h1>Acceso restringido</h1>
        <p role="alert">No tienes permiso para ver esta página.</p>
      </main>
    );
  }

  return children;
}
