import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api';
import { formatPrice } from '../utils';

// El cliente ve solo sus propios pedidos (no los de nadie más).
export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('cargando');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getMyOrders()
      .then((data) => {
        setOrders(data.orders || []);
        setStatus('listo');
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setStatus('error');
      });
  }, []);

  return (
    <main id="contenido" tabIndex={-1} className="container section">
      <h1>Mis pedidos</h1>

      {status === 'cargando' && <p>Cargando tus pedidos…</p>}

      {status === 'error' && (
        <p role="alert" className="field-error">
          {errorMessage || 'No se pudieron cargar tus pedidos.'}
        </p>
      )}

      {status === 'listo' && orders.length === 0 && (
        <p>
          Todavía no has hecho ningún pedido. <Link to="/">Ver el catálogo</Link>
        </p>
      )}

      {status === 'listo' && orders.length > 0 && (
        <div className="cart-table-wrapper subsection-spacing">
          <table className="cart-table">
            <caption className="sr-only">Lista de tus pedidos anteriores</caption>
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Total</th>
                <th scope="col">Estado</th>
                <th scope="col">Fecha</th>
                <th scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <th scope="row">#{order.id}</th>
                  <td>{formatPrice(order.total_cents)}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.created_at).toLocaleString('es-MX')}</td>
                  <td>
                    <Link
                      to={`/order-confirmation/${order.id}`}
                      aria-label={`Ver detalle del pedido número ${order.id}`}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
