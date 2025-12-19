'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { getProducts, Product } from '@/lib/productStore';
import styles from './page.module.css';

export default function CollectionsPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await getProducts();
            setProducts(data);
        };
        load();
    }, []);

    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Tüm Koleksiyonlar</h1>
                <p className={styles.subtitle}>
                    Zamansız tasarımlar, modern dokunuşlar. Size özel seçkilerimizi keşfedin.
                </p>
            </header>

            {/* Filtre Alanı (Görsel Mock - İleride aktif edilebilir) */}
            <div className={styles.filters}>
                <button className={styles.filterBtn}>Tümü</button>
                <button className={styles.filterBtn}>Kolyeler</button>
                <button className={styles.filterBtn}>Küpeler</button>
                <button className={styles.filterBtn}>Yüzükler</button>
                <button className={styles.filterBtn}>Bileklikler</button>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {products.length} Ürün Listeleniyor
                </span>
            </div>

            {/* Ürün Grid */}
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
