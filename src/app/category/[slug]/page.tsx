'use client';

import { useState, useEffect, use } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { getProducts, Product } from '@/lib/productStore';
import styles from '../../collections/page.module.css';

const CATEGORY_MAP: Record<string, string> = {
    'kupe': 'Küpe',
    'yuzuk': 'Yüzük',
    'kolye': 'Kolye',
    'bileklik': 'Bileklik'
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    'kupe': 'Zarafetinizi tamamlayacak, her tarza uygun küpe modellerimiz.',
    'yuzuk': 'Anlam yüklü, modern ve zamansız yüzük tasarımlarımız.',
    'kolye': 'Boynunuzda parlayacak, ince işçilikle hazırlanmış kolyelerimiz.',
    'bileklik': 'Bileğinize şıklık katacak, özel tasarım bileklik koleksiyonumuz.'
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const { slug } = resolvedParams;
    const [products, setProducts] = useState<Product[]>([]);
    const categoryName = CATEGORY_MAP[slug] || slug;
    const description = CATEGORY_DESCRIPTIONS[slug] || 'Tını özel koleksiyonu.';

    useEffect(() => {
        const load = async () => {
            const data = await getProducts();
            setProducts(data.filter(p =>
                p.category?.toLowerCase() === categoryName.toLowerCase()
            ));
        };
        load();
    }, [categoryName]);

    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>{categoryName}</h1>
                <p className={styles.subtitle}>{description}</p>
            </header>

            <div className={styles.grid}>
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
                        Bu kategoride henüz ürün bulunmuyor.
                    </div>
                )}
            </div>
        </div>
    );
}
