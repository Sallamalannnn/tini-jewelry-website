'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { getProducts, Product } from '@/lib/productStore';
import styles from './page.module.css';

const CATEGORIES = ['Tümü', 'Kolye', 'Küpe', 'Yüzük', 'Bileklik'];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            const data = await getProducts();
            setProducts(data);
            setFilteredProducts(data);
            setIsLoading(false);
        };
        loadProducts();
    }, []);

    useEffect(() => {
        if (activeCategory === 'Tümü') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category === activeCategory));
        }
    }, [activeCategory, products]);

    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Tüm Ürünler</h1>
                <p className={styles.subtitle}>
                    En yeni tasarımlarımızı ve klasikleşmiş parçalarımızı keşfedin.
                </p>
            </header>

            {/* Filtre Alanı */}
            <div className={styles.filters}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}

                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {filteredProducts.length} Ürün
                </span>
            </div>

            {/* Ürün Listesi */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#b8860b', fontSize: '1.2rem', fontWeight: 500 }}>Yükleniyor...</div>
            ) : filteredProducts.length > 0 ? (
                <div className={styles.grid}>
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px', color: '#8B6508', fontSize: '1.1rem' }}>
                    Bu kategoride henüz ürün bulunmuyor.
                </div>
            )}
        </div>
    );
}
