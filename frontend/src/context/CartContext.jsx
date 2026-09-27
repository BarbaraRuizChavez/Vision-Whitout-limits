import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // Texto que LiveAnnouncer lee en voz alta (aria-live) cada vez que cambia.
  const [announcement, setAnnouncement] = useState('');

  // Agregar producto al carrito. `quantity` es opcional (por defecto 1) para
  // que sirva tanto para ProductCard (agrega de 1 en 1) como para
  // ProductDetailPage (permite elegir cantidad antes de agregar).
  const addToCart = (product, quantity = 1) => {
    const targetId = product.productId || product.id;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => (item.productId || item.id) === targetId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }

      const newItem = {
        id: targetId,
        productId: targetId,
        name: product.name || 'Producto',
        priceCents: product.priceCents || product.price_cents || 0,
        slug: product.slug || '',
        quantity
      };

      return [...prevItems, newItem];
    });

    const nombre = product.name || 'Producto';
    setAnnouncement(
      quantity === 1
        ? `${nombre} agregado al carrito.`
        : `${quantity} unidades de ${nombre} agregadas al carrito.`
    );
  };

  // Alias de addToCart: así ProductDetailPage.jsx (que llama addItem(product, quantity))
  // y ProductCard.jsx (que llama addToCart(product)) funcionan con la misma lógica.
  const addItem = addToCart;

  const updateQuantity = (id, newQuantity) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if ((item.productId || item.id) === id) {
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
    setAnnouncement('Cantidad del carrito actualizada.');
  };

  const removeItem = (id) => {
    const item = items.find((i) => (i.productId || i.id) === id);
    setItems((prevItems) =>
      prevItems.filter((item) => (item.productId || item.id) !== id)
    );
    setAnnouncement(`${item?.name || 'Producto'} eliminado del carrito.`);
  };

  const clearCart = () => {
    setItems([]);
    setAnnouncement('Carrito vaciado.');
  };

  const totalCents = items.reduce(
    (sum, item) => sum + (item.priceCents || 0) * item.quantity,
    0
  );

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  // Alias de totalCount: Header.jsx espera "totalItems".
  const totalItems = totalCount;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalCents,
        totalCount,
        totalItems,
        announcement
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
