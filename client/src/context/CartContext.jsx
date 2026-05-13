import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mw_cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mw_cart', JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => ({
    items,
    addItem(product, variant, qty = 1) {
      setItems((current) => {
        const index = current.findIndex((item) => item.productId === product.id && item.variantId === variant.variantId);
        if (index === -1) {
          return [...current, {
            productId: product.id,
            variantId: variant.variantId,
            name: product.name,
            image: product.images?.[0] || '',
            variant: `${variant.storage} / ${variant.color} / ${variant.approval}`,
            price: variant.price,
            stock: variant.stock,
            qty
          }];
        }
        return current.map((item, i) => i === index ? { ...item, qty: Math.min(item.qty + qty, variant.stock) } : item);
      });
    },
    updateQty(productId, variantId, qty) {
      setItems((current) => current.map((item) => (
        item.productId === productId && item.variantId === variantId
          ? { ...item, qty: Math.max(1, Math.min(Number(qty), item.stock || 1)) }
          : item
      )));
    },
    removeItem(productId, variantId) {
      setItems((current) => current.filter((item) => item.productId !== productId || item.variantId !== variantId));
    },
    clearCart() {
      setItems([]);
    },
    total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    count: items.reduce((sum, item) => sum + item.qty, 0)
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
