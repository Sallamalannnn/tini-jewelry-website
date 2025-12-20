'use client';

import React from 'react';
import Image from 'next/image';
import styles from './ComingSoon.module.css';

export default function ComingSoon() {
    return (
        <div className={styles.container}>
            <div className={styles.overlay} />

            <main className={styles.content}>
                <div className={styles.logoWrapper}>
                    <h1 className={styles.brandName}>TINI</h1>
                    <span className={styles.brandSubtitle}>GİYİM VE AKSESUAR</span>
                </div>

                <div className={styles.glassCard}>
                    <h2 className={styles.title}>Parıltıya Hazır Olun</h2>
                    <p className={styles.description}>
                        Sizler için en nadide parçaları hazırlıyoruz.
                        TINI GİYİM VE AKSESUAR çok yakında yeni koleksiyonuyla yayında olacak.
                    </p>

                    <div className={styles.statusBadge}>
                        <span className={styles.pulse}></span>
                        Yapım Aşamasında
                    </div>
                </div>

                <footer className={styles.footer}>
                    <p>&copy; 2024 TINI GİYİM VE AKSESUAR. Tüm Hakları Saklıdır.</p>
                </footer>
            </main>
        </div>
    );
}
