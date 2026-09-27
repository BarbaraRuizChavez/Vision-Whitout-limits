import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../api';
import { formatPrice } from '../utils';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('cargando');

  useEffect(() => {
    getOrder(orderId)
      .then((result) => {
        setData(result);
        setStatus('listo');
      })
      .catch(() => setStatus('error'));
  }, [orderId]);

  if (status === 'cargando') {
    return (
      <main id="contenido" tabIndex={-1} className="container section">
        <p>Cargando confirmación…</p>
      </main>
    );
  }

  if (status === 'error' || !data) {
    return (
      <main id="contenido" tabIndex={-1} className="container section">
        <h1>No encontramos ese pedido</h1>
        <Link to="/">Volver al catálogo</Link>
      </main>
    );
  }

  const { order, items } = data;

  return (
    <main id="contenido" tabIndex={-1} className="container section">
      <div className="confirmation-box" role="status">
        <h1>¡Gracias, {order.customer_name.split(' ')[0]}!</h1>
        <p>Tu pedido fue registrado correctamente.</p>
      </div>

      <section className="section-spaced" aria-labelledby="resumen-pedido">
        <h2 id="resumen-pedido">Resumen del pedido</h2>
        <table className="cart-table">
          <caption className="sr-only">Productos incluidos en el pedido {order.id}</caption>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <th scope="row" className="table-row-heading-normal">
                  {item.product_name}
                </th>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.unit_price_cents * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cart-summary">
          <div className="cart-summary-box">
            <div className="total-row">
              <span>Total</span>
              <span>{formatPrice(order.total_cents)}</span>
            </div>
          </div>
        </div>
      </section>

      <p className="section-spaced">
        <Link to="/" className="button button-secondary">
          Volver al catálogo
        </Link>
      </p>
    </main>
  );
}
