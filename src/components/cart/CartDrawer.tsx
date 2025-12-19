'use client';

import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import styles from './CartDrawer.module.css';

import { useState, useEffect } from 'react';

// ... imports

export const CartDrawer = () => {
    const { isCartOpen, toggleCart, items, removeItem, updateQuantity, totalPrice } = useCart();
    const [shippingCost, setShippingCost] = useState(105);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);

    useEffect(() => {
        const loadSettings = () => {
            const savedCost = localStorage.getItem('tini_shipping_cost');
            const savedThreshold = localStorage.getItem('tini_free_shipping_threshold');

            if (savedCost) setShippingCost(Number(savedCost));
            if (savedThreshold) setFreeShippingThreshold(Number(savedThreshold));
        };

        loadSettings();

        // Listen for updates from other tabs/components
        window.addEventListener('storage', loadSettings);
        return () => window.removeEventListener('storage', loadSettings);
    }, [isCartOpen]); // Re-check when cart opens just in case

    if (!isCartOpen) return null;

    const finalShippingCost = totalPrice >= freeShippingThreshold ? 0 : shippingCost;

    return (
        <>
            <div className={styles.overlay} onClick={toggleCart} />
            <div className={styles.drawer}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Alışveriş Sepeti ({items.length})</h2>
                    <button onClick={toggleCart} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.items}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            <p>Sepetiniz şu an boş.</p>
                            <Button variant="outline" onClick={toggleCart} style={{ marginTop: '1rem' }}>
                                Alışverişe Başla
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.imageWrapper}>
                                    {/* Local image handling */}
                                    <img src={item.image} alt={item.name} className={styles.image} />
                                </div>
                                <div className={styles.details}>
                                    <h3 className={styles.itemName}>{item.name}</h3>
                                    <p className={styles.itemPrice}>{item.price.toLocaleString('tr-TR')} ₺</p>

                                    <div className={styles.controls}>
                                        <div className={styles.quantity}>
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                <Minus size={14} />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className={styles.removeBtn}
                                            aria-label="Ürünü kaldır"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.summaryRow}>
                            <span>Ara Toplam</span>
                            <span>{totalPrice.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Kargo Ücreti</span>
                            <span style={{ color: finalShippingCost === 0 ? '#2e7d32' : 'inherit', fontWeight: finalShippingCost === 0 ? '600' : 'normal' }}>
                                {finalShippingCost === 0 ? 'Ücretsiz' : `${finalShippingCost.toLocaleString('tr-TR')} ₺`}
                            </span>
                        </div>
                        <div className={styles.total}>
                            <span>Genel Toplam</span>
                            <span className={styles.totalAmount}>{(totalPrice + finalShippingCost).toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <Button
                            size="lg"
                            className={styles.checkoutBtn}
                            onClick={() => {
                                toggleCart();
                                window.location.href = '/checkout';
                            }}
                        >
                            Ödemeye Geç
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};
