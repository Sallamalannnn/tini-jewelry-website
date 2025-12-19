'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, User, Menu } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import styles from './Navbar.module.css';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

import { useAuth } from '@/context/AuthContext';

export const Navbar = () => {
    const { user } = useAuth();
    const pathname = usePathname();
    const isTransparent = pathname === '/' || pathname?.startsWith('/product/');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { toggleCart, totalItems } = useCart();

    return (
        <header className={isTransparent ? styles.headerTransparent : styles.header}>
            <div className={`container ${styles.navbar}`}>
                <div className={styles.navbarTopRow}>
                    {/* Mobile Menu Button */}
                    <button className={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu size={24} />
                    </button>

                    {/* Logo (Left) */}
                    <div className={styles.logoContainer}>
                        <Logo />
                    </div>

                    {/* Primary Desktop Navigation (Middle) */}
                    <nav className={styles.navDesktop}>
                        <Link href="/new-arrivals" className={styles.navLink}>Yeni Gelenler</Link>
                        <Link href="/best-sellers" className={styles.navLink}>Çok Satanlar</Link>
                        <Link href="/gift-ideas" className={styles.navLink}>Hediye Önerileri</Link>
                        <Link href="/sets" className={styles.navLink}>Setler</Link>
                    </nav>

                    {/* Icons (Right) */}
                    <div className={styles.actions}>
                        <button className={styles.actionBtn} aria-label="Ara">
                            <Search size={22} strokeWidth={1.5} />
                        </button>
                        <Link href={user ? "/account" : "/login"} className={styles.actionBtn} aria-label={user ? "Hesabım" : "Giriş Yap"}>
                            <User size={22} strokeWidth={1.5} />
                        </Link>
                        <button
                            className={styles.actionBtn}
                            aria-label="Sepet"
                            onClick={toggleCart}
                        >
                            <ShoppingBag size={22} strokeWidth={1.5} />
                            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                        </button>
                    </div>
                </div>

                {/* Secondary Category Navigation (Row 2) */}
                <nav className={styles.navCategories}>
                    <Link href="/category/kupe" className={styles.navLink}>Küpe</Link>
                    <Link href="/category/yuzuk" className={styles.navLink}>Yüzük</Link>
                    <Link href="/category/kolye" className={styles.navLink}>Kolye</Link>
                    <Link href="/category/bileklik" className={styles.navLink}>Bileklik</Link>
                </nav>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className={styles.mobileNav}>
                    <nav className={styles.mobileLinks}>
                        <div className={styles.mobileCategoryTitle}>KOLEKSİYONLAR</div>
                        <Link href="/new-arrivals" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Yeni Gelenler</Link>
                        <Link href="/best-sellers" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Çok Satanlar</Link>
                        <Link href="/gift-ideas" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Hediye Önerileri</Link>
                        <Link href="/sets" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Setler</Link>

                        <div className={styles.mobileCategoryTitle}>KATEGORİLER</div>
                        <Link href="/category/kupe" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Küpe</Link>
                        <Link href="/category/yuzuk" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Yüzük</Link>
                        <Link href="/category/kolye" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Kolye</Link>
                        <Link href="/category/bileklik" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Bileklik</Link>
                    </nav>
                </div>
            )}
        </header>
    );
};
