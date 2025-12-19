'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { COLLECTIONS } from '@/lib/constants';
import { getProducts, Product } from '@/lib/productStore';
import styles from './HorizontalScroll.module.css';

export const HorizontalScroll = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [items, setItems] = useState<Product[]>([]);

    useEffect(() => {
        const load = async () => {
            const products = await getProducts();
            setItems(products);
        };
        load();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth * 0.8;
            const newScrollLeft = direction === 'left'
                ? scrollRef.current.scrollLeft - scrollAmount
                : scrollRef.current.scrollLeft + scrollAmount;

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>VİTRİN</h2>

            <div className={styles.carouselWrapper}>
                <button
                    className={`${styles.navButton} ${styles.prevButton}`}
                    onClick={() => scroll('left')}
                    aria-label="Geri"
                >
                    <ChevronLeft size={32} />
                </button>

                <div className={styles.scrollContainer} ref={scrollRef}>
                    {items.length > 0 ? items.map((product) => {
                        const isOutOfStock = product.stock === 0;
                        return (
                            <Link
                                href={`/product/${product.id}`}
                                key={product.id}
                                className={isOutOfStock ? `${styles.card} ${styles.outOfStockCard}` : styles.card}
                                data-color={(product.color || 'Sarı').toLowerCase()}
                            >
                                <div className={styles.imageWrapper}>
                                    <div className={styles.innerWrapper}>
                                        <img src={product.image} alt={product.name} className={styles.image} />
                                        {isOutOfStock && (
                                            <div className={styles.outOfStockOverlay}>
                                                <span>STOKTA YOK</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.info}>
                                    <span className={styles.collectionTitle}>{product.name}</span>
                                    <span className={styles.explore}>{product.price.toLocaleString('tr-TR')} ₺</span>
                                </div>
                            </Link>
                        );
                    }) : (
                        COLLECTIONS.map((collection) => (
                            <Link
                                href="/collections"
                                key={collection.id}
                                className={styles.card}
                                data-color="sarı"
                            >
                                <div className={styles.imageWrapper}>
                                    <div className={styles.innerWrapper}>
                                        <img src={collection.image} alt={collection.title} className={styles.image} />
                                    </div>
                                </div>
                                <div className={styles.info}>
                                    <span className={styles.collectionTitle}>{collection.title}</span>
                                    <span className={styles.explore}>KEŞFET →</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                <button
                    className={`${styles.navButton} ${styles.nextButton}`}
                    onClick={() => scroll('right')}
                    aria-label="İleri"
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </section>
    );
};
