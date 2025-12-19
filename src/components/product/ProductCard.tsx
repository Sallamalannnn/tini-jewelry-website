'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import styles from './ProductCard.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    material?: string;
    color?: string;
    stock?: number;
}

export const ProductCard = ({ product }: { product: Product }) => {
    const { addItem } = useCart();
    const isOutOfStock = product.stock === 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Link'e tıklamayı engelle
        if (isOutOfStock) return;
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });
    };

    return (
        <div className={isOutOfStock ? `${styles.card} ${styles.outOfStockCard}` : styles.card} data-color={(product.color || 'Sarı').toLowerCase()}>


            <div className={styles.imageContainer}>
                <Link href={`/product/${product.id}`}>
                    <div className={styles.imageWrapper}>
                        {/* Using simple img tag for external urls if domain not configured in next.config, 
                             but Image is better. Assuming we configure domains or use local. 
                             For now using div bg or img tag. */}
                        <img src={product.image} alt={product.name} className={styles.image} />

                        {isOutOfStock && (
                            <div className={styles.outOfStockOverlay}>
                                <span>STOKTA YOK</span>
                            </div>
                        )}
                    </div>
                </Link>
                {!isOutOfStock && (
                    <button
                        className={styles.quickAdd}
                        aria-label="Sepete Ekle"
                        onClick={handleAddToCart}
                    >
                        <ShoppingBag size={18} />
                    </button>
                )}
            </div>
            <div className={styles.info}>
                <p className={styles.category}>{product.category}</p>
                <Link href={`/product/${product.id}`}>
                    <h3 className={styles.name}>{product.name}</h3>
                </Link>
                <p className={styles.price}>{product.price.toLocaleString('tr-TR')} ₺</p>
            </div>
        </div>
    );
};

