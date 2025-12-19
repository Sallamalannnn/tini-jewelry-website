'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { getNewArrivals, Product } from '@/lib/productStore';
import styles from '../collections/page.module.css';

export default function NewArrivalsPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await getNewArrivals();
            setProducts(data);
        };
        load();
    }, []);

    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Yeni Gelenler</h1>
                <p className={styles.subtitle}>
                    En son eklenen parçalarımızı keşfedin. Tasarımın en yeni hali sizinle.
                </p>
            </header>

            {/* Ürün Grid */}
            <div className={styles.grid}>
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>Henüz ürün bulunmuyor.</div>
                )}
            </div>
        </div>
    );
}
