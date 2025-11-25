'use client';

import React, { createContext, useReducer, useEffect } from 'react';
import type { Product, CartItem as CartItemType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type State = {
  items: CartItemType[];
};

type Action =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_STATE'; payload: State };

const initialState: State = {
  items: [],
};

const cartReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += 1;
        return { ...state, items: newItems };
      }
      const newItem: CartItemType = {
        id: action.payload.id,
        name: action.payload.name,
        price: action.payload.price,
        quantity: 1,
        imageId: action.payload.imageId,
      };
      return { ...state, items: [...state.items, newItem] };
    }
    case 'UPDATE_QUANTITY': {
        if (action.payload.quantity <= 0) {
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload.id),
            };
        }
        return {
            ...state,
            items: state.items.map((item) =>
                item.id === action.payload.id
                ? { ...item, quantity: action.payload.quantity }
                : item
            ),
        };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_STATE':
        return action.payload;
    default:
      return state;
  }
};

export const CartContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  handleCheckout: () => Promise<void>;
}>({
  state: initialState,
  dispatch: () => null,
  handleCheckout: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(storedCart) });
      }
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const handleCheckout = async () => {
    if (state.items.length === 0) {
        toast({ title: 'Your cart is empty', variant: 'destructive' });
        return;
    }
    toast({ title: 'Redirecting to checkout...' });
    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: state.items.map(item => ({ product: {
            id: item.id,
            name: item.name,
            price: item.price,
            description: '', // You may need to fetch this if required by checkout
            imageUrl: '',
            category: '',
            imageId: item.imageId
        }, quantity: item.quantity })) }),
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


  return (
    <CartContext.Provider value={{ state, dispatch, handleCheckout }}>
      {children}
    </CartContext.Provider>
  );
};
