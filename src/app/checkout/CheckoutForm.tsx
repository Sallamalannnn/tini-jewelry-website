'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

export const CheckoutForm = () => {
    const { items, totalPrice } = useCart();
    const { user, userData, loading: authLoading, userDataLoading, addAddress } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Yeni Adres',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: ''
    });

    // Auto-select first address if available
    useEffect(() => {
        if (!userDataLoading && user) {
            const hasAddresses = userData?.addresses?.length > 0;

            if (hasAddresses) {
                if (!selectedAddressId && !isAddingNewAddress) {
                    setSelectedAddressId(userData.addresses[0].id);
                    setIsAddingNewAddress(false);
                }
            } else {
                setIsAddingNewAddress(true);
            }
        }
    }, [userData, userDataLoading, user]);

    // Sync formData with selected address
    useEffect(() => {
        if (selectedAddressId && userData?.addresses) {
            const selected = userData.addresses.find((a: any) => a.id === selectedAddressId);
            if (selected) {
                setFormData({
                    ...selected,
                    email: user?.email || ''
                });
            }
        }
    }, [selectedAddressId, userData, user]);

    // Simplified useEffect for initial data
    useEffect(() => {
        if (user && !formData.email) {
            setFormData(prev => ({ ...prev, email: user.email || '' }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // If adding a new address and logged in, save it to profile
            if (user && isAddingNewAddress) {
                await addAddress(formData);
            }

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

    if (authLoading || (user && userDataLoading)) {
        return (
            <div className={styles.section} style={{ textAlign: 'center', padding: '4rem' }}>
                <p>Bilgileriniz yükleniyor...</p>
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

                        {!user ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p style={{ marginBottom: '1.5rem', color: '#888' }}>
                                    Ödemeye devam etmek için lütfen giriş yapın veya kayıt olun.
                                </p>
                                <Button onClick={() => window.location.href = '/login'} style={{ width: '100%' }}>
                                    Giriş Yap / Kayıt Ol
                                </Button>
                            </div>
                        ) : (
                            <>
                                {userData?.addresses?.length > 0 && !isAddingNewAddress ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div className={styles.addressGrid}>
                                            {userData.addresses.map((addr: any) => (
                                                <div
                                                    key={addr.id}
                                                    className={`${styles.addressCard} ${selectedAddressId === addr.id ? styles.selected : ''}`}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                >
                                                    <div className={styles.addressCardHeader}>
                                                        <strong>{addr.title}</strong>
                                                        {selectedAddressId === addr.id && <span className={styles.checkIcon}>✓</span>}
                                                    </div>
                                                    <p>{addr.firstName} {addr.lastName}</p>
                                                    <p>{addr.address}</p>
                                                    <p>{addr.zip} {addr.city}</p>
                                                    <p>{addr.phone}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => {
                                                setIsAddingNewAddress(true);
                                                setSelectedAddressId(null);
                                                setFormData({ ...formData, title: 'Yeni Adres', firstName: '', lastName: '', phone: '', address: '', city: '', zip: '' });
                                            }}
                                            style={{ marginTop: '0.5rem' }}
                                        >
                                            + Yeni Adres Ekle
                                        </Button>
                                    </div>
                                ) : (
                                    <div className={styles.formContainer}>
                                        <div className={styles.row}>
                                            <div className={styles.field}>
                                                <label className={styles.label}>E-posta</label>
                                                <input required type="email" name="email" className={styles.input} value={formData.email} onChange={handleChange} placeholder="ornek@mail.com" />
                                            </div>
                                            <div className={styles.field}>
                                                <label className={styles.label}>Telefon</label>
                                                <input required type="tel" name="phone" className={styles.input} value={formData.phone} onChange={handleChange} placeholder="05XX XXX XX XX" />
                                            </div>
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.field}>
                                                <label className={styles.label}>Ad</label>
                                                <input required name="firstName" className={styles.input} value={formData.firstName} onChange={handleChange} />
                                            </div>
                                            <div className={styles.field}>
                                                <label className={styles.label}>Soyad</label>
                                                <input required name="lastName" className={styles.input} value={formData.lastName} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Adres</label>
                                            <input required name="address" className={styles.input} value={formData.address} onChange={handleChange} />
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.field}>
                                                <label className={styles.label}>Şehir</label>
                                                <input required name="city" className={styles.input} value={formData.city} onChange={handleChange} />
                                            </div>
                                            <div className={styles.field}>
                                                <label className={styles.label}>Posta Kodu</label>
                                                <input required name="zip" className={styles.input} value={formData.zip} onChange={handleChange} />
                                            </div>
                                        </div>
                                        {userData?.addresses?.length > 0 && (
                                            <Button
                                                variant="outline"
                                                type="button"
                                                onClick={() => setIsAddingNewAddress(false)}
                                                style={{ marginTop: '1rem', width: '100%' }}
                                            >
                                                Vazgeç ve Kayıtlı Adres Seç
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className={styles.infoBox}>
                        <p>📢 Ödemenizi güvenli <strong>Shopier</strong> altyapısı ile tamamlayacaksınız. <strong>TINI GİYİM VE AKSESUAR</strong> güvencesiyle.</p>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className={styles.submitBtn}
                        disabled={loading || (!user && !formData.email) || (!selectedAddressId && !formData.address)}
                    >
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
