'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css'; // Re-using admin layout styles if possible or inline
import { Save, Truck, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
    const [shippingCost, setShippingCost] = useState('105');
    const [freeShippingThreshold, setFreeShippingThreshold] = useState('1000');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Load settings from local storage on mount
        const savedShippingCost = localStorage.getItem('tini_shipping_cost');
        const savedThreshold = localStorage.getItem('tini_free_shipping_threshold');

        if (savedShippingCost) setShippingCost(savedShippingCost);
        if (savedThreshold) setFreeShippingThreshold(savedThreshold);
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        localStorage.setItem('tini_shipping_cost', shippingCost);
        localStorage.setItem('tini_free_shipping_threshold', freeShippingThreshold);

        // Dispatch a custom event to notify other components (like CartDrawer) immediate update
        window.dispatchEvent(new Event('storage'));

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 className={styles.title} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Mağaza Ayarları</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Kargo ücretleri, limitler ve genel mağaza yapılandırması.</p>
            </div>

            <div style={{
                backgroundColor: '#fff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: '30px',
                maxWidth: '600px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--color-border)' }}>
                    <Truck className="text-secondary" size={24} />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Kargo Yapılandırması</h2>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Standart Kargo Ücreti (TL)</label>
                        <Input
                            type="number"
                            value={shippingCost}
                            onChange={(e) => setShippingCost(e.target.value)}
                            placeholder="Örn: 105"
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '5px' }}>
                            Müşterilerin sepet tutarı ücretsiz kargo limitinin altındaysa ödeyeceği tutar.
                        </p>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ücretsiz Kargo Limiti (TL)</label>
                        <Input
                            type="number"
                            value={freeShippingThreshold}
                            onChange={(e) => setFreeShippingThreshold(e.target.value)}
                            placeholder="Örn: 1000"
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '5px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <Info size={14} />
                            Bu tutarın üzerindeki siparişlerde kargo ücretsiz olacaktır.
                        </p>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Button type="submit" disabled={isSaved}>
                            <Save size={18} style={{ marginRight: '8px' }} />
                            {isSaved ? 'Kaydedildi!' : 'Ayarları Kaydet'}
                        </Button>
                        {isSaved && <span style={{ color: 'green', fontSize: '0.9rem', animation: 'fadeIn 0.5s' }}>Değişiklikler başarıyla uygulandı via LocalStorage.</span>}
                    </div>
                </form>
            </div>
        </div>
    );
}
