'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { getProducts, Product } from '@/lib/productStore';
import styles from '../collections/page.module.css';

export default function GiftIdeasPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await getProducts();
            // Filter products that could be good gifts
            setProducts(data.filter(p => p.price < 5000));
        };
        load();
    }, []);

    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Hediye Önerileri</h1>
                <p className={styles.subtitle}>
                    Sevdiklerinizi mutlu edecek, anlam yüklü tasarımlarımız.
                </p>
            </header>

            <div className={styles.grid}>
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>Yükleniyor...</div>
                )}
            </div>
        </div>
    );
}
