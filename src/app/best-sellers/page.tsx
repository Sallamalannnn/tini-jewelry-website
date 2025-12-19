'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { getProducts, Product } from '@/lib/productStore';
import styles from '../collections/page.module.css';

export default function BestSellersPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await getProducts();
            // Just simulate best sellers for now
            setProducts(data.slice(0, 6));
        };
        load();
    }, []);

    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Çok Satanlar</h1>
                <p className={styles.subtitle}>
                    En çok tercih edilen ve sevilen parçalarımız burada toplandı.
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
