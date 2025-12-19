'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { getProducts, Product } from '@/lib/productStore';
import styles from '../collections/page.module.css';

export default function SetsPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await getProducts();
            // Filter products that contain "Set" in their name or category
            setProducts(data.filter(p =>
                p.name.toLowerCase().includes('set') ||
                p.category?.toLowerCase() === 'set'
            ));
        };
        load();
    }, []);

    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Setler</h1>
                <p className={styles.subtitle}>
                    Mükemmel uyum için tasarlanmış, birbiriyle uyumlu parça kombinasyonlarımız.
                </p>
            </header>

            <div className={styles.grid}>
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>Şu an listelenecek set bulunmuyor.</div>
                )}
            </div>
        </div>
    );
}
