'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Sepet Öğesi Tipi
export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    toggleCart: () => void;
    isCartOpen: boolean;
    totalPrice: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Hydration fix: Sadece client tarafında localStorage okuması yapalım
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem('tini_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to parse cart from local storage', error);
            }
        }
    }, []);

    // Sepet değiştiğinde localStorage'a kaydet
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('tini_cart', JSON.stringify(items));
        }
    }, [items, isMounted]);

    const addItem = (product: Omit<CartItem, 'quantity'>) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true); // Ürün eklenince sepeti aç
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(id);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const toggleCart = () => setIsCartOpen((prev) => !prev);

    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    // Initial render sırasında children dönmeli, aksi takdirde sayfa boş görünür
    // Client-side mount olduktan sonra etkileşim başlar
    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                toggleCart,
                isCartOpen,
                totalPrice,
                totalItems,
            }}
        >
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
