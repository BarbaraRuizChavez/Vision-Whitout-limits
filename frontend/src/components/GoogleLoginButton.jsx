import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Botón "Continuar con Google". Requiere que index.html haya cargado el
// script de Google Identity Services y que exista VITE_GOOGLE_CLIENT_ID
// en frontend/.env. Si falta la variable, se muestra un botón deshabilitado
// con una nota, en vez de fallar en silencio.
export default function GoogleLoginButton({ onError }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          await loginWithGoogle(response.credential);
        } catch (err) {
          onError?.(err.message);
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
      locale: 'es',
    });
  }, [clientId]);

  if (!clientId) {
    return (
      <button type="button" className="button-google" disabled title="Falta configurar VITE_GOOGLE_CLIENT_ID">
        Continuar con Google
      </button>
    );
  }

  return <div ref={buttonRef} />;
}
