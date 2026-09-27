import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api';
import { formatPrice } from '../utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('cargando');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getOrders()
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
      <h1>Pedidos recibidos</h1>

      {status === 'cargando' && <p>Cargando pedidos…</p>}

      {status === 'error' && (
        <p role="alert" className="field-error">
          {errorMessage || 'No se pudieron cargar los pedidos. Verifica que el servidor de la API esté encendido.'}
        </p>
      )}

      {status === 'listo' && orders.length === 0 && (
        <p>Todavía no hay pedidos registrados.</p>
      )}

      {status === 'listo' && orders.length > 0 && (
        <div className="cart-table-wrapper subsection-spacing">
          <table className="cart-table">
            <caption className="sr-only">Lista de todos los pedidos registrados</caption>
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Correo</th>
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
                  <td>{order.customer_name}</td>
                  <td>{order.email}</td>
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
