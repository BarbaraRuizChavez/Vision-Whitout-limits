import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '../api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('cargando');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    setStatus('cargando');
    getProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        setStatus('listo');
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  if (status === 'cargando') {
    return (
      <main id="contenido" tabIndex={-1} className="container section">
        <p>Cargando producto…</p>
      </main>
    );
  }

  if (status === 'error' || !product) {
    return (
      <main id="contenido" tabIndex={-1} className="container section">
        <h1>Producto no encontrado</h1>
        <p>
          <Link to="/">Volver al catálogo</Link>
        </p>
      </main>
    );
  }

  return (
    <main id="contenido" tabIndex={-1} className="container section">
      <p>
        <Link to="/">← Volver al catálogo</Link>
      </p>
      <div className="product-detail">
        <div className="product-thumb" role="img" aria-label={product.image_alt}>
          {product.image_url ? (
            <img src={product.image_url} alt="" />
          ) : (
            <span aria-hidden="true" className="product-thumb-emoji">
              {product.category === 'baston' ? '🦯' : '🕶️'}
            </span>
          )}
        </div>
        <div>
          <span className="category-pill">{product.category === 'baston' ? 'Bastón' : 'Lentes'}</span>
          <h1>{product.name}</h1>
          <p className="price product-price-large">
            {formatPrice(product.price_cents)}
          </p>
          <p>{product.description}</p>

          <h2 className="product-features-heading">Características</h2>
          <ul className="feature-list">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addItem(product, quantity);
            }}
          >
            <div className="quantity-field">
              <label htmlFor="cantidad">Cantidad</label>
              <input
                id="cantidad"
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
              <span className="hint">{product.stock} disponibles</span>
            </div>
            <button type="submit" className="button button-primary" disabled={product.stock <= 0}>
              {product.stock <= 0 ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
