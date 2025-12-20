'use client';

import { useState, useEffect } from 'react';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchProducts, Product } from '@/lib/productStore';
import styles from './SearchModal.module.css';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsSearching(true);
                const searchResults = await searchProducts(query);
                setResults(searchResults.slice(0, 6)); // Show top 6 live
                setIsSearching(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={32} strokeWidth={1} />
                </button>

                <div className={styles.content}>
                    <h2 className={styles.title}>NE ARIYORSUNUZ?</h2>
                    <form className={styles.inputWrapper} onSubmit={handleSearch}>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Ürün, koleksiyon veya kategori ara..."
                            className={styles.input}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
                        />
                        <button
                            type="button"
                            className={styles.inputCloseBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                setQuery('');
                            }}
                        >
                            <X size={24} />
                        </button>
                        <button type="submit" className={styles.searchBtn}>
                            <SearchIcon size={24} />
                        </button>
                    </form>

                    {results.length > 0 ? (
                        <div className={styles.resultsContainer}>
                            <div className={styles.resultsGrid}>
                                {results.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        className={styles.resultItem}
                                        onClick={onClose}
                                    >
                                        <div className={styles.resultImage}>
                                            <img src={product.image} alt={product.name} />
                                        </div>
                                        <div className={styles.resultInfo}>
                                            <p className={styles.resultName}>{product.name}</p>
                                            <p className={styles.resultPrice}>{product.price.toLocaleString('tr-TR')} ₺</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <button className={styles.viewAllBtn} onClick={handleSearch}>
                                Tüm Sonuçları Gör <ArrowRight size={16} />
                            </button>
                        </div>
                    ) : query.length >= 2 && !isSearching ? (
                        <div className={styles.noResults}>
                            "{query}" için sonuç bulunamadı.
                        </div>
                    ) : (
                        <div className={styles.suggestions}>
                            <p>Popüler Aramalar:</p>
                            <div className={styles.tags}>
                                <span onClick={(e) => { e.stopPropagation(); setQuery('Küpe'); }}>Küpe</span>
                                <span onClick={(e) => { e.stopPropagation(); setQuery('Kolye'); }}>Kolye</span>
                                <span onClick={(e) => { e.stopPropagation(); setQuery('Yüzük'); }}>Yüzük</span>
                                <span onClick={(e) => { e.stopPropagation(); setQuery('Yeni'); }}>Yeni Koleksiyon</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
