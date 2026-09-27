import { useCart } from '../context/CartContext';

export default function LiveAnnouncer() {
  const { announcement } = useCart();
  return (
    <div aria-live="polite" role="status" className="sr-only">
      {announcement}
    </div>
  );
}
