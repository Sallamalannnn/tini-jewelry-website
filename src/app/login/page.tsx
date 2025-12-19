'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = '/account';
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Geçersiz e-posta veya şifre.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`container ${styles.page}`}>
            <div className={styles.card}>
                <h1 className={styles.title}>Giriş Yap</h1>
                <p className={styles.subtitle}>Hesabınıza erişmek için bilgilerinizi girin.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    <Input
                        label="E-posta"
                        type="email"
                        placeholder="ornek@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Şifre"
                        type="password"
                        placeholder="******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className={styles.forgotPassword}>
                        <Link href="/forgot-password">Şifremi Unuttum</Link>
                    </div>

                    <Button type="submit" size="lg" disabled={isLoading} className={styles.submitBtn}>
                        {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </Button>
                </form>

                <div className={styles.footer}>
                    Hesabınız yok mu? <Link href="/register" className={styles.link}>Kayıt Ol</Link>
                </div>
            </div>
        </div>
    );
}
