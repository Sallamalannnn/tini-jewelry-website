import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './Hero.module.css';

export const Hero = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay}></div>
            <div className={`container ${styles.content}`}>
                <h1 className={styles.title}>
                    <span className={styles.goldText}>ZAMANSIZ</span><br />
                    <span className={styles.silverText}>Estetik</span>
                </h1>
            </div>
        </section>
    );
};
