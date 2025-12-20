'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export const CheckoutForm = () => {
    const { items, totalPrice } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: ''
    });

    useEffect(() => {
        if (user) {
            // Split display name if available, otherwise just use as firstName
            const names = user.displayName?.split(' ') || ['', ''];
            setFormData(prev => ({
                ...prev,
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/checkout/shopier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    customer: formData,
                    totalPrice
                }),
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Shopier payment page
                window.location.href = data.url;
            } else {
                alert('Ödeme başlatılamadı: ' + (data.error || 'Bilinmeyen hata'));
                setLoading(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Bir hata oluştu, lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className={styles.section} style={{ textAlign: 'center' }}>
                <p>Sepetinizde ürün bulunmamaktadır.</p>
                <Button className={styles.submitBtn} onClick={() => window.location.href = '/'}>
                    Alışverişe Dön
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {/* Form Section */}
            <div className={styles.formSection}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Teslimat Bilgileri</h2>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>E-posta</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    className={styles.input}
                                    placeholder="ornek@mail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Telefon</label>
                                <input
                                    required
                                    type="tel"
                                    name="phone"
                                    className={styles.input}
                                    placeholder="05XX XXX XX XX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>Ad</label>
                                <input
                                    required
                                    name="firstName"
                                    className={styles.input}
                                    placeholder="Adınız"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Soyad</label>
                                <input
                                    required
                                    name="lastName"
                                    className={styles.input}
                                    placeholder="Soyadınız"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Adres</label>
                            <input
                                required
                                name="address"
                                className={styles.input}
                                placeholder="Sokak, Mahalle, No"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>Şehir</label>
                                <input
                                    required
                                    name="city"
                                    className={styles.input}
                                    placeholder="İstanbul"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Posta Kodu</label>
                                <input
                                    required
                                    name="zip"
                                    className={styles.input}
                                    placeholder="34000"
                                    value={formData.zip}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoBox}>
                        <p>📢 Ödemenizi güvenli <strong>Shopier</strong> altyapısı ile tamamlayacaksınız.</p>
                    </div>

                    <Button type="submit" size="lg" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'İşleniyor...' : `Ödemeyi Tamamla (${totalPrice.toLocaleString('tr-TR')} ₺)`}
                    </Button>
                </form>
            </div>

            {/* Summary Section */}
            <div className={styles.summary}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Sipariş Özeti</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                        {items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>{(item.price * item.quantity).toLocaleString('tr-TR')} ₺</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Ara Toplam</span>
                        <span>{totalPrice.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Kargo</span>
                        <span>Ücretsiz</span>
                    </div>
                    <div className={styles.totalRow}>
                        <span>Toplam</span>
                        <span>{totalPrice.toLocaleString('tr-TR')} ₺</span>
                    </div>
                </div>
            </div>
        </div >
    );
};
