'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export const CheckoutForm = () => {
    const { items, totalPrice } = useCart();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('Siparişiniz başarıyla alındı! (Demo)');
        setLoading(false);
        // İdeal senaryoda success sayfasına yönlendirme yapılır
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
                        <h2 className={styles.sectionTitle}>Teslimat Adresi</h2>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>Ad</label>
                                <input required className={styles.input} placeholder="Adınız" />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Soyad</label>
                                <input required className={styles.input} placeholder="Soyadınız" />
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Adres</label>
                            <input required className={styles.input} placeholder="Sokak, Mahalle, No" />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>Şehir</label>
                                <input required className={styles.input} placeholder="İstanbul" />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Posta Kodu</label>
                                <input required className={styles.input} placeholder="34000" />
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Ödeme Bilgileri</h2>
                        <div className={styles.field}>
                            <label className={styles.label}>Kart Numarası</label>
                            <input required className={styles.input} placeholder="0000 0000 0000 0000" maxLength={19} />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>Son Kullanma Tarihi</label>
                                <input required className={styles.input} placeholder="Ay/Yıl" />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>CVC</label>
                                <input required className={styles.input} placeholder="123" maxLength={3} />
                            </div>
                        </div>
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
        </div>
    );
};
