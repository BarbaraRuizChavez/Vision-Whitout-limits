import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalCents } = useCart();

  if (!items || items.length === 0) {
    return (
      <main id="contenido" className="container section">
        <h2>Tu Carrito de Compras</h2>
        <p className="empty-state">Tu carrito está vacío actualmente.</p>
        <Link to="/" className="button button-primary">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  return (
    <main id="contenido" className="container section">
      <h2>Tu Carrito de Compras</h2>

      <div className="cart-table-wrapper subsection-spacing">
        <table className="cart-table">
          <caption className="sr-only">Productos en tu carrito, con cantidad y subtotal de cada uno</caption>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Precio unitario</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Subtotal</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const id = item.productId || item.id;
              const price = item.priceCents ?? item.price_cents ?? 0;
              const subtotal = price * item.quantity;

              return (
                <tr key={id}>
                  <th scope="row">{item.name}</th>
                  <td>{formatPrice(price)}</td>
                  <td>
                    <div className="quantity-field">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => updateQuantity(id, item.quantity - 1)}
                        aria-label={`Disminuir cantidad de ${item.name}`}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => updateQuantity(id, item.quantity + 1)}
                        aria-label={`Aumentar cantidad de ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{formatPrice(subtotal)}</td>
                  <td>
                    <button type="button" className="button-danger-text" onClick={() => removeItem(id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="cart-summary">
        <div className="cart-summary-box">
          <div className="total-row">
            <span>Total</span>
            <span>{formatPrice(totalCents)}</span>
          </div>
          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={clearCart}>
              Vaciar carrito
            </button>
            <Link to="/checkout" className="button button-primary">
              Proceder al pago
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
