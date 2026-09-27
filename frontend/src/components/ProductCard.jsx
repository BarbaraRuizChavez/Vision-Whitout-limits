import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const imageMap = {
    'baston-plegable-inteligente': '/images/baston.jpeg',
    'lentes-inteligentes': '/images/lentes.jpeg',
    'kit-accesibilidad-completo': '/images/kit.jpeg'
  };

  const imageSrc = product.image_url || imageMap[product.slug] || '/images/baston.png';
  const price = product.price_cents || product.priceCents || 0;

  return (
    <article className="product-card">
      {/* Contenedor de la imagen */}
      <div className="product-card-image">
        <img src={imageSrc} alt={product.name} loading="lazy" />
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-description">{product.description}</p>
        
        <p className="product-card-price">
          {formatPrice(price)}
        </p>

        <div className="product-card-actions">
          <button
            type="button"
            className="button button-primary button-full"
            onClick={() => addToCart(product)}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
}