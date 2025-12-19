'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

import { auth } from '@/lib/firebase';
import { firestoreCreateUser } from '@/lib/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        setIsLoading(true);
        try {
            let user;

            // Eğer giriş yapılmışsa ve e-posta eşleşiyorsa mevcut oturumu kullan (Tamir Modu)
            if (auth.currentUser && auth.currentUser.email === email) {
                user = auth.currentUser;
                console.log('Mevcut oturum kullanılıyor, veritabanı onarılıyor...');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
            }

            // Update auth profile
            await updateProfile(user, {
                displayName: `${name} ${surname}`
            });

            // Create user document in Firestore
            await firestoreCreateUser(user.uid, email, name, surname);

            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            window.location.href = '/login';
        } catch (err: any) {
            console.error('Registration details:', err);

            if (err.code === 'permission-denied') {
                setError('Veritabanı yazma izni yok. Lütfen Firebase Console -> Firestore -> Kurallar (Rules) kısmını güncelleyin.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Bu e-posta adresi zaten kullanımda.');
            } else {
                setError(err.message || 'Kayıt sırasında bir hata oluştu.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`container ${styles.page}`}>
            <div className={styles.card}>
                <h1 className={styles.title}>Kayıt Ol</h1>
                <p className={styles.subtitle}>Tını ayrıcalıklarından yararlanmak için hesap oluşturun.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <Input
                            label="Ad"
                            type="text"
                            placeholder="Adınız"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Soyad"
                            type="text"
                            placeholder="Soyadınız"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            required
                        />
                    </div>

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
                    <Input
                        label="Şifre Tekrar"
                        type="password"
                        placeholder="******"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" size="lg" disabled={isLoading} className={styles.submitBtn}>
                        {isLoading ? 'Hesap Oluşturuluyor...' : 'Üye Ol'}
                    </Button>
                </form>

                <div className={styles.footer}>
                    Zaten hesabınız var mı? <Link href="/login" className={styles.link}>Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
}
