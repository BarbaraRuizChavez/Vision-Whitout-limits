import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api';
import { formatPrice } from '../utils';

const FIELDS = [
  { name: 'name', label: 'Nombre completo', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Correo electrónico', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Teléfono', type: 'tel', autoComplete: 'tel' },
  { name: 'address', label: 'Dirección', type: 'text', autoComplete: 'street-address' },
  { name: 'city', label: 'Ciudad', type: 'text', autoComplete: 'address-level2' },
  { name: 'postalCode', label: 'Código postal', type: 'text', autoComplete: 'postal-code' },
];

export default function CheckoutPage() {
  const { items, totalCents, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: '', address: '', city: '', postalCode: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const errorSummaryRef = useRef(null);

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Escribe tu nombre completo.';
    if (!form.email.trim()) newErrors.email = 'Escribe tu correo electrónico.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'El correo no parece válido.';
    if (!form.phone.trim()) newErrors.phone = 'Escribe un teléfono de contacto.';
    if (!form.address.trim()) newErrors.address = 'Escribe tu dirección.';
    if (!form.city.trim()) newErrors.city = 'Escribe tu ciudad.';
    if (!form.postalCode.trim()) newErrors.postalCode = 'Escribe tu código postal.';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    setSubmitError('');

    if (Object.keys(newErrors).length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer: form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };
      const result = await createOrder(payload);
      clearCart();
      navigate(`/order-confirmation/${result.orderId}`, { replace: true });
    } catch (err) {
      setSubmitError(err.message);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main id="contenido" tabIndex={-1} className="container section">
        <h1>Confirmar pedido</h1>
        <p>No hay productos en tu carrito.</p>
        <Link to="/" className="button button-primary">
          Ver catálogo
        </Link>
      </main>
    );
  }

  const hasErrors = Object.keys(errors).length > 0 || submitError;

  return (
    <main id="contenido" tabIndex={-1} className="container section">
      <h1>Confirmar pedido</h1>

      {hasErrors && (
        <div className="error-summary" ref={errorSummaryRef} tabIndex={-1} role="alert">
          <h2>Revisa lo siguiente antes de continuar</h2>
          <ul>
            {submitError && <li>{submitError}</li>}
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <a href={`#campo-${field}`}>{message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {FIELDS.map((field) => (
            <div className="form-field" key={field.name}>
              <label htmlFor={`campo-${field.name}`}>{field.label}</label>
              <input
                id={`campo-${field.name}`}
                type={field.type}
                autoComplete={field.autoComplete}
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
              />
              {errors[field.name] && (
                <span className="field-error" id={`error-${field.name}`}>
                  {errors[field.name]}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="form-field">
          <label htmlFor="campo-notes">Notas de entrega (opcional)</label>
          <textarea
            id="campo-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="cart-summary">
          <div className="cart-summary-box">
            <div className="total-row">
              <span>Total</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
            <button type="submit" className="button button-primary" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
