'use client';

import Link from 'next/link';
import { Package, Users, Settings, LayoutDashboard, LogOut, Lock, ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './layout.module.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Check session storage on mount to persist login during session
    useEffect(() => {
        const auth = sessionStorage.getItem('admin_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded simple password as requested
        if (password === 'tini123') {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_auth', 'true');
            setError('');
        } else {
            setError('Hatalı şifre');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginBox}>
                    <div className={styles.loginHeader}>
                        <Lock size={32} color="var(--color-primary)" />
                        <h1>Yönetici Girişi</h1>
                        <p>Bu alana sadece yetkili kişiler girebilir.</p>
                    </div>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <Input
                            label="Şifre"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Yönetici şifresi"
                            error={error}
                        />
                        <Button type="submit" style={{ width: '100%' }}>Giriş Yap</Button>
                        <Link href="/" className={styles.backLink}>Siteye Dön</Link>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    TINI <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Admin</span>
                </div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={`${styles.navItem} ${pathname === '/admin' ? styles.active : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Genel Bakış</span>
                    </Link>
                    <Link href="/admin/orders" className={`${styles.navItem} ${pathname.startsWith('/admin/orders') ? styles.active : ''}`}>
                        <ShoppingBag size={20} />
                        <span>Siparişler</span>
                    </Link>
                    <Link href="/admin/products" className={`${styles.navItem} ${pathname.startsWith('/admin/products') ? styles.active : ''}`}>
                        <Package size={20} />
                        <span>Ürünler</span>
                    </Link>
                    <Link href="/admin/users" className={`${styles.navItem} ${pathname.startsWith('/admin/users') ? styles.active : ''}`}>
                        <Users size={20} />
                        <span>Kullanıcılar</span>
                    </Link>
                    <Link href="/admin/settings" className={`${styles.navItem} ${pathname.startsWith('/admin/settings') ? styles.active : ''}`}>
                        <Settings size={20} />
                        <span>Ayarlar</span>
                    </Link>
                </nav>
                <div className={styles.footer}>
                    <button
                        onClick={() => {
                            setIsAuthenticated(false);
                            sessionStorage.removeItem('admin_auth');
                        }}
                        className={styles.navItem}
                        style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'transparent' }}
                    >
                        <LogOut size={20} />
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
