'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { searchProducts, Product } from '@/lib/productStore';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            const results = await searchProducts(query);
            setProducts(results);
            setLoading(false);
        };
        fetchResults();
    }, [query]);

    return (
        <div className="container section">
            <h1 style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '2.5rem',
                marginBottom: '2rem',
                textAlign: 'center'
            }}>
                {query ? `"${query}" Arama Sonuçları` : 'Tüm Ürünler'}
            </h1>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>Aranıyor...</div>
            ) : products.length > 0 ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>
                        Üzgünüz, aradığınız kriterlere uygun ürün bulamadık.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <SearchResults />
        </Suspense>
    );
}
