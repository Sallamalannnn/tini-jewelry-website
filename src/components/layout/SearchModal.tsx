'use client';

import { useState, useEffect } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';
import styles from './SearchModal.module.css';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={32} strokeWidth={1} />
                </button>

                <div className={styles.content}>
                    <h2 className={styles.title}>NE ARIYORSUNUZ?</h2>
                    <div className={styles.inputWrapper}>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Ürün, koleksiyon veya kategori ara..."
                            className={styles.input}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button className={styles.searchBtn}>
                            <SearchIcon size={24} />
                        </button>
                    </div>

                    <div className={styles.suggestions}>
                        <p>Popüler Aramalar:</p>
                        <div className={styles.tags}>
                            <span>Zümrüt Kolye</span>
                            <span>İnci Küpe</span>
                            <span>Altın Yüzük</span>
                            <span>Yeni Koleksiyon</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
