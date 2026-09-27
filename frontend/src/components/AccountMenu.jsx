import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

// Menú desplegable de la cuenta: botón con avatar + nombre que abre un menú
// con "Mis pedidos", "Configurar mi perfil" y "Salir". Accesible por teclado:
// Escape cierra y regresa el foco al botón; clic fuera también cierra.
export default function AccountMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  return (
    <div className="account-menu" ref={wrapperRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className="account-menu-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <UserAvatar user={user} />
        <span>{user.firstName || user.name?.split(' ')[0]}</span>
        <span aria-hidden="true" className="account-menu-caret">▾</span>
      </button>

      {open && (
        <div className="account-menu-dropdown" role="menu">
          <Link to="/mis-pedidos" role="menuitem" className="account-menu-item" onClick={() => setOpen(false)}>
            Mis pedidos
          </Link>
          <Link to="/perfil" role="menuitem" className="account-menu-item" onClick={() => setOpen(false)}>
            Configurar mi perfil
          </Link>
          <button
            type="button"
            role="menuitem"
            className="account-menu-item account-menu-logout"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Salir
          </button>
        </div>
      )}
    </div>
  );
}
