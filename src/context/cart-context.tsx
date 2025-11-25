'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';

// It's important to use NEXT_PUBLIC_ for client-side environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (quantity: number, productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  handleCheckout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const cartCollectionRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/carts`) : null, [user, firestore]);
  const { data: firestoreCartItems, isLoading: isCartLoading } = useCollection<{productId: string, quantity: number}>(cartCollectionRef);
  
  const productsCollectionRef = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading: areProductsLoading } = useCollection<Product>(productsCollectionRef);

  const cartItems = useMemo(() => {
    if (!user) return localCartItems;
    if (isCartLoading || areProductsLoading || !firestoreCartItems || !products) return [];

    return firestoreCartItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    }).filter((item): item is CartItem => item !== null);
  }, [user, localCartItems, firestoreCartItems, products, isCartLoading, areProductsLoading]);

  // Sync local cart to firestore on login
  useEffect(() => {
    if (user && localCartItems.length > 0 && !isCartLoading) {
      const batch = writeBatch(firestore);
      localCartItems.forEach(localItem => {
        const firestoreItem = firestoreCartItems?.find(fi => fi.productId === localItem.product.id);
        if (firestoreItem) {
          const newQuantity = firestoreItem.quantity + localItem.quantity;
          const cartItemRef = doc(firestore, `users/${user.uid}/carts/${firestoreItem.id}`);
          batch.update(cartItemRef, { quantity: newQuantity });
        } else {
          const cartItemRef = doc(collection(firestore, `users/${user.uid}/carts`));
          batch.set(cartItemRef, { productId: localItem.product.id, quantity: localItem.quantity });
        }
      });
      batch.commit().then(() => {
        setLocalCartItems([]);
      });
    }
  }, [user, localCartItems, firestoreCartItems, firestore, isCartLoading]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (user) {
      const existingItem = firestoreCartItems?.find(item => item.productId === product.id);
      if (existingItem) {
        const cartItemRef = doc(firestore, `users/${user.uid}/carts/${existingItem.id}`);
        updateDocumentNonBlocking(cartItemRef, { quantity: existingItem.quantity + quantity });
      } else {
        addDocumentNonBlocking(collection(firestore, `users/${user.uid}/carts`), { productId: product.id, quantity });
      }
    } else {
      setLocalCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.product.id === product.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { product, quantity }];
      });
    }
    toast({
      title: "Item Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  }, [user, firestore, firestoreCartItems, toast]);

  const removeFromCart = useCallback((productId: string) => {
    if (user) {
      const cartItem = firestoreCartItems?.find(item => item.productId === productId);
      if (cartItem) {
        const cartItemRef = doc(firestore, `users/${user.uid}/carts/${cartItem.id}`);
        deleteDocumentNonBlocking(cartItemRef);
      }
    } else {
      setLocalCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    }
    toast({
      title: "Item Removed",
      description: "The item has been removed from your cart.",
    });
  }, [user, firestore, firestoreCartItems, toast]);

  const updateQuantity = useCallback((quantity: number, productId: string) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (user) {
      const cartItem = firestoreCartItems?.find(item => item.productId === productId);
      if (cartItem) {
        const cartItemRef = doc(firestore, `users/${user.uid}/carts/${cartItem.id}`);
        updateDocumentNonBlocking(cartItemRef, { quantity });
      }
    } else {
      setLocalCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [user, firestore, firestoreCartItems, removeFromCart]);

  const clearCart = useCallback(() => {
    if (user) {
        const batch = writeBatch(firestore);
        firestoreCartItems?.forEach(item => {
            const cartItemRef = doc(firestore, `users/${user.uid}/carts/${item.id}`);
            batch.delete(cartItemRef);
        });
        batch.commit();
    } else {
        setLocalCartItems([]);
    }
  }, [user, firestore, firestoreCartItems]);

  const handleCheckout = async () => {
    toast({ title: 'Redirecting to checkout...' });
    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js has not loaded yet.');
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        toast({ title: 'Checkout Error', description: error.message, variant: 'destructive' });
      }
    } catch (error) {
      const err = error as Error;
      toast({ title: 'Checkout Error', description: err.message, variant: 'destructive' });
    }
  };


  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    handleCheckout,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
