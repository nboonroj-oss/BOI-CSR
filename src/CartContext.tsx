import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from './types';

interface CartContextType {
  cart: Project[];
  addToCart: (project: Project) => void;
  removeFromCart: (projectId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Project[]>([]);

  const addToCart = (project: Project) => {
    if (!cart.find(p => p.id === project.id)) {
      setCart([...cart, project]);
    }
  };

  const removeFromCart = (projectId: string) => {
    setCart(cart.filter(p => p.id !== projectId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
