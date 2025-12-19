'use client';

import { useState } from 'react';
import { ShoppingBag, Heart, Share2, Bell, CheckCircle2, Loader2, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { requestStockNotification } from '@/lib/productStore';
import { ARTryOnModal } from '@/components/product/ARTryOnModal';
import { StarDust } from '../../../components/ui/StarDust';
import styles from './page.module.css';

// Client Component to handle interaction
export const ProductDetailActions = ({ product }: { product: any }) => {
    const { addItem } = useCart();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isAROpen, setIsAROpen] = useState(false);
    const [triggerDust, setTriggerDust] = useState(0);

    const isOutOfStock = product.stock === 0;

    const handleNotifyMe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            await requestStockNotification(email, product.id, product.name);
            setIsSuccess(true);
            setEmail('');
        } catch (error) {
            alert('Bir hata oluştu, lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.productActionsWrapper} style={{ isolation: 'isolate', position: 'relative' }}>
            <div className={styles.actions} style={{ overflow: 'visible' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Button
                        size="lg"
                        className={styles.addToCartBtn}
                        style={{ width: '100%' }}
                        disabled={isOutOfStock}
                        onClick={() => {
                            if (!isOutOfStock) {
                                addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image
                                });
                                setTriggerDust(prev => prev + 1);
                            }
                        }}
                    >
                        {isOutOfStock ? (
                            'Stokta Yok'
                        ) : (
                            <>
                                <ShoppingBag size={20} style={{ marginRight: '8px' }} />
                                Sepete Ekle
                            </>
                        )}
                    </Button>
                    <StarDust trigger={triggerDust} />
                </div>

                <button className={styles.iconBtn} aria-label="Favorilere Ekle">
                    <Heart size={22} />
                </button>
                <button className={styles.iconBtn} aria-label="Paylaş" onClick={() => setIsAROpen(true)}>
                    <Camera size={22} color="var(--color-primary)" />
                </button>
            </div>

            <Button
                variant="outline"
                size="lg"
                style={{ width: '100%', marginTop: '15px', borderColor: '#b8860b', color: '#b8860b', display: 'flex', gap: '10px' }}
                onClick={() => setIsAROpen(true)}
            >
                <Sparkles size={20} /> Sanal Deneme (AR) Başlat
            </Button>

            <ARTryOnModal
                isOpen={isAROpen}
                onClose={() => setIsAROpen(false)}
                productImage={product.image}
                productCategory={product.category}
            />

            {isOutOfStock && (
                <div className={styles.notifyContainer}>
                    {isSuccess ? (
                        <div className={styles.notifySuccess}>
                            <CheckCircle2 size={20} />
                            <span>Talebiniz alındı! Stok yenilendiğinde haber vereceğiz.</span>
                        </div>
                    ) : (
                        <>
                            <div className={styles.notifyTitle}>
                                <Bell size={18} />
                                Gelince Haber Ver
                            </div>
                            <form className={styles.notifyForm} onSubmit={handleNotifyMe}>
                                <input
                                    type="email"
                                    placeholder="E-posta adresiniz"
                                    className={styles.notifyInput}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="submit"
                                    className={styles.notifySubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'GÖNDER'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
