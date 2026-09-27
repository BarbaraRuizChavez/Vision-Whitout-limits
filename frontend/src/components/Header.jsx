import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AccountMenu from './AccountMenu';

export default function Header() {
  const { totalItems } = useCart();
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="container top-bar-inner">
          <NavLink to="/" className="brand">
            Vision Without Limits <span className="tagline">Bastón y lentes inteligentes</span>
          </NavLink>
        </div>
      </div>
      <div className="nav-strip">
        <div className="nav-strip-inner">
          <nav className="main-nav" aria-label="Navegación principal">
            <ul>
              <li>
                <NavLink to="/" end>
                  Inicio
                </NavLink>
              </li>
              <li>
                <NavLink to="/#conocenos">Conócenos</NavLink>
              </li>
              <li>
                <NavLink to="/#bastones">Bastones</NavLink>
              </li>
              <li>
                <NavLink to="/#lentes">Lentes</NavLink>
              </li>
              {isAdmin && (
                <>
                  <li>
                    <NavLink to="/admin/pedidos">Pedidos</NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/productos">Productos</NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="flex-row-gap-1">
            <NavLink to="/cart" className="cart-link">
              <img src="/images/car.png" alt="" aria-hidden="true" className="cart-icon" />
              <span></span>
              <span className="sr-only">
                {totalItems === 1 ? '1 artículo' : `${totalItems} artículos`} en el carrito
              </span>
              <span aria-hidden="true">({totalItems})</span>
            </NavLink>

            {user ? (
              <AccountMenu user={user} logout={logout} />
            ) : (
              <NavLink to="/login">Iniciar sesión</NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
