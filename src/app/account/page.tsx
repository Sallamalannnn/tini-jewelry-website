'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { MapPin, CreditCard, Heart, ShoppingBag, Settings, LogOut, Package, Plus, RefreshCcw, X, Info, Truck } from 'lucide-react';

// Mock Data (Removed in favor of Real Data, but keeping struct for reference if needed)
// const MOCK_ORDERS = ...

const MOCK_ADDRESSES = [
    { id: 1, title: 'Ev Adresim', address: 'Atatürk Cad. No:123 Daire:4, Çankaya, Ankara', phone: '0555 123 45 67' },
    { id: 2, title: 'İş Adresi', address: 'Levent Plaza Kat:12, Beşiktaş, İstanbul', phone: '0212 987 65 43' },
];

const MOCK_CARDS = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', holder: 'Test Kullanıcı' },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '08/24', holder: 'Test Kullanıcı' },
];

const MOCK_WISHLIST = [
    { id: '1', name: 'Zümrüt Safir Kolye', price: 12500, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=500' },
    { id: '2', name: 'İnci Küpe Seti', price: 4200, image: 'https://images.unsplash.com/photo-1535633302704-b02f4f147981?q=80&w=500' },
];

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserOrders, createOrder, Order, createReturnRequest } from '@/lib/orderStore';

type TabType = 'orders' | 'addresses' | 'payments' | 'wishlist' | 'profile';

export default function AccountPage() {
    const { user, userData, logout, loading, addAddress, updateAddress, deleteAddress } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('orders');

    // Real Orders State
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Address management state
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState({
        title: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        zip: ''
    });

    // Return/Cancel Modal State
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Fetch Orders when User is ready
    useEffect(() => {
        const fetchOrders = async () => {
            if (user?.uid) {
                setLoadingOrders(true);
                const userOrders = await getUserOrders(user.uid);
                setOrders(userOrders);
                setLoadingOrders(false);
            }
        };
        fetchOrders();
    }, [user]);

    const handleCreateTestOrder = async () => {
        if (!user) {
            alert('Lütfen önce giriş yapın.');
            return;
        }
        try {
            console.log('Test siparişi oluşturuluyor...', user.uid);
            const orderId = await createOrder({
                userId: user.uid,
                total: 2500,
                status: 'Hazırlanıyor',
                items: [{ id: '1', name: 'Test Ürünü - Altın Kolye', price: 2500, quantity: 1 }],
                shippingAddress: { title: 'Ev', address: 'Test Adresi', city: 'İstanbul', zip: '34000' }
            });
            console.log('Sipariş oluşturuldu, ID:', orderId);

            // Refresh orders
            console.log('Siparişler güncelleniyor...');
            const userOrders = await getUserOrders(user.uid);
            setOrders(userOrders);
            alert('Test siparişi oluşturuldu! Siparişlerim sekmesini kontrol edin.');
        } catch (error) {
            console.error('Sipariş Hatası:', error);
            alert('Sipariş oluşturulamadı. Detaylar için konsola bakın.');
        }
    };

    if (loading || !user) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Yükleniyor...</div>;
    }

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAddressId) {
                await updateAddress(editingAddressId, addressForm);
            } else {
                await addAddress(addressForm);
            }
            setIsAddingAddress(false);
            setEditingAddressId(null);
            setAddressForm({ title: '', firstName: '', lastName: '', phone: '', address: '', city: '', zip: '' });
        } catch (error) {
            alert('Adres kaydedilirken bir hata oluştu.');
        }
    };

    const handleEditAddress = (addr: any) => {
        setAddressForm(addr);
        setEditingAddressId(addr.id);
        setIsAddingAddress(true);
    };

    const handleDeleteAddress = async (id: string) => {
        if (window.confirm('Bu adresi silmek istediğinize emin misiniz?')) {
            try {
                await deleteAddress(id);
            } catch (error) {
                alert('Adres silinirken bir hata oluştu.');
            }
        }
    };

    const navItems = [
        { id: 'orders', label: 'Siparişlerim', icon: Package },
        { id: 'addresses', label: 'Adreslerim', icon: MapPin },
        { id: 'payments', label: 'Ödeme Yöntemlerim', icon: CreditCard },
        { id: 'wishlist', label: 'Favorilerim', icon: Heart },
        { id: 'profile', label: 'Profil Ayarları', icon: Settings },
    ];

    return (
        <div className={`container ${styles.page}`}>
            <h1 className={styles.title}>Hesabım</h1>

            <div className={styles.layout}>
                {/* Sidebar Navigation */}
                <aside className={styles.sidebar}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>{user.displayName?.charAt(0) || user.email?.charAt(0)}</div>
                        <div className={styles.userName}>{user.displayName || 'Değerli Üyemiz'}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                    </div>
                    <nav className={styles.nav}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
                                onClick={() => setActiveTab(item.id as TabType)}
                            >
                                <item.icon size={18} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                                {item.label}
                            </button>
                        ))}
                        <button className={`${styles.navItem} ${styles.logout}`} onClick={handleLogout}>
                            <LogOut size={18} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                            Çıkış Yap
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={styles.content}>
                    {/* Orders Section */}
                    {activeTab === 'orders' && (
                        <div className={styles.section}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className={styles.sectionTitle}>Sipariş Geçmişi</h2>
                                <Button size="sm" variant="outline" onClick={handleCreateTestOrder} style={{ fontSize: '0.7rem' }}>+ Test Siparişi Ekle</Button>
                            </div>

                            {loadingOrders ? (
                                <p>Siparişler yükleniyor...</p>
                            ) : orders.length > 0 ? (
                                <div className={styles.orderList}>
                                    {orders.map(order => (
                                        <div key={order.id} className={styles.orderCard}>
                                            <div className={styles.orderHeader}>
                                                <span className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
                                                <span className={`${styles.status} ${styles[order.status.toLowerCase().replace(/\s/g, '').replace(/ç/g, 'c').replace(/ı/g, 'i').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ğ/g, 'g')] || styles.hazirlaniyor}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className={styles.orderDetails}>
                                                <span>{order.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                <span>{order.total.toLocaleString('tr-TR')} ₺</span>
                                            </div>
                                            {order.shippingCode && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#0066cc', backgroundColor: '#f0f7ff', padding: '4px 8px', borderRadius: '4px' }}>
                                                    <Truck size={14} />
                                                    <span>Kargo Kodu: <strong>{order.shippingCode}</strong></span>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedOrderId(order.id);
                                                        setShowReturnModal(true);
                                                    }}
                                                >
                                                    <RefreshCcw size={14} style={{ marginRight: '6px' }} />
                                                    İade/İptal
                                                </Button>
                                                <Button variant="outline" size="sm">Detaylar</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Henüz bir siparişiniz bulunmuyor.</p>
                            )}
                        </div>
                    )}

                    {/* Addresses Section */}
                    {activeTab === 'addresses' && (
                        <div className={styles.section}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Adres Bilgilerim</h2>
                                {!isAddingAddress && (
                                    <Button variant="outline" size="sm" onClick={() => setIsAddingAddress(true)}>
                                        <Plus size={16} style={{ marginRight: '8px' }} /> Yeni Adres Ekle
                                    </Button>
                                )}
                            </div>

                            {isAddingAddress ? (
                                <form onSubmit={handleSaveAddress} className={styles.profileForm} style={{ maxWidth: '100%' }}>
                                    <div className={styles.row}>
                                        <div className={styles.field}>
                                            <label>Adres Başlığı (örn: Evim)</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.title}
                                                onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label>Telefon</label>
                                            <input
                                                required
                                                type="tel"
                                                value={addressForm.phone}
                                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.field}>
                                            <label>Ad</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.firstName}
                                                onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label>Soyad</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.lastName}
                                                onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Adres</label>
                                        <input
                                            required
                                            type="text"
                                            value={addressForm.address}
                                            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.field}>
                                            <label>Şehir</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label>Posta Kodu</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.zip}
                                                onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <Button type="submit">{editingAddressId ? 'Güncelle' : 'Kaydet'}</Button>
                                        <Button type="button" variant="outline" onClick={() => {
                                            setIsAddingAddress(false);
                                            setEditingAddressId(null);
                                            setAddressForm({ title: '', firstName: '', lastName: '', phone: '', address: '', city: '', zip: '' });
                                        }}>Vazgeç</Button>
                                    </div>
                                </form>
                            ) : (
                                <div className={styles.grid}>
                                    {userData?.addresses?.length > 0 ? (
                                        userData.addresses.map((addr: any) => (
                                            <div key={addr.id} className={styles.cardItem}>
                                                <div className={styles.cardHeader}>
                                                    <span className={styles.cardTitle}><MapPin size={16} /> {addr.title}</span>
                                                </div>
                                                <p className={styles.cardContent}><strong>{addr.firstName} {addr.lastName}</strong></p>
                                                <p className={styles.cardContent}>{addr.address}</p>
                                                <p className={styles.cardContent}>
                                                    {addr.zip} {addr.city}
                                                </p>
                                                <p className={styles.cardContent}><strong>Tel:</strong> {addr.phone}</p>
                                                <div className={styles.cardActions}>
                                                    <button className={styles.actionLink} onClick={() => handleEditAddress(addr)}>Düzenle</button>
                                                    <button
                                                        className={`${styles.actionLink} ${styles.delete}`}
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                    >Sil</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#888' }}>
                                            Henüz kayıtlı bir adresiniz bulunmuyor.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payments Section */}
                    {activeTab === 'payments' && (
                        <div className={styles.section}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Kayıtlı Kartlarım</h2>
                                <Button variant="outline" size="sm">
                                    <Plus size={16} style={{ marginRight: '8px' }} /> Yeni Kart Ekle
                                </Button>
                            </div>
                            <div className={styles.grid}>
                                {MOCK_CARDS.map(card => (
                                    <div key={card.id} className={styles.cardItem}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.cardTitle}><CreditCard size={18} /> **** **** **** {card.last4}</span>
                                        </div>
                                        <p className={styles.cardContent}>{card.type} - {card.holder}</p>
                                        <p className={styles.cardContent}><strong>Son Kullanma:</strong> {card.expiry}</p>
                                        <div className={styles.cardActions}>
                                            <button className={`${styles.actionLink} ${styles.delete}`}>Kaldır</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Wishlist Section */}
                    {activeTab === 'wishlist' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Favori Ürünlerim</h2>
                            {MOCK_WISHLIST.length > 0 ? (
                                <div className={styles.wishlistGrid}>
                                    {MOCK_WISHLIST.map(item => (
                                        <div key={item.id} className={styles.wishlistItem}>
                                            <div className={styles.wishlistImage}>
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className={styles.wishlistInfo}>
                                                <span className={styles.wishlistName}>{item.name}</span>
                                                <span className={styles.wishlistPrice}>{item.price.toLocaleString('tr-TR')} ₺</span>
                                                <Button size="sm" style={{ width: '100%', marginTop: '8px' }}>Sepete Ekle</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Favorilerinize henüz bir ürün eklemediniz.</p>
                            )}
                        </div>
                    )}

                    {/* Profile Section */}
                    {activeTab === 'profile' && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Profil Bilgileri</h2>
                            <form className={styles.profileForm}>
                                <div className={styles.field}>
                                    <label>Ad Soyad</label>
                                    <input type="text" defaultValue={user.displayName || ''} className={styles.input} />
                                </div>
                                <div className={styles.field}>
                                    <label>E-posta</label>
                                    <input type="email" defaultValue={user.email || ''} className={styles.input} disabled />
                                </div>
                                <Button style={{ marginTop: '1rem' }}>Bilgileri Güncelle</Button>
                            </form>
                        </div>
                    )}
                </main>
            </div>

            {/* Return/Cancel Modal */}
            {
                showReturnModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowReturnModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.closeModalBtn} onClick={() => setShowReturnModal(false)}>
                                <X size={20} />
                            </button>
                            <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                İade / İptal Talebi
                            </h2>
                            <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                <span style={{ fontWeight: '600', color: '#000' }}>#{selectedOrderId}</span> numaralı siparişiniz için iade talebiniz bize ulaştığında, <strong>Shopier Paneli</strong> üzerinden siparişinize özel bir <strong>İade Kargo Kodu</strong> oluşturulacaktır.
                                <br /><br />
                                Bu kod, kayıtlı iletişim bilgileriniz (SMS/E-mail) üzerinden tarafınıza iletilecektir.
                            </p>

                            <div style={{ backgroundColor: '#f0f7ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #cce3ff', display: 'flex', gap: '10px', alignItems: 'start' }}>
                                <Info size={20} color="#0066cc" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <p style={{ fontSize: '0.85rem', color: '#004c99', margin: 0 }}>
                                    <strong>Önemli:</strong> Lütfen iade kargo kodu size ulaşmadan kargo şubesine gitmeyiniz. Kod ile gönderimleriniz <strong>ücretsizdir</strong> ve iade sürecini hızlandırır.
                                </p>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const reason = formData.get('reason') as string;
                                const details = formData.get('details') as string;

                                setIsSubmittingReturn(true);

                                try {
                                    if (!selectedOrderId || !user) return;

                                    await createReturnRequest({
                                        orderId: selectedOrderId,
                                        userId: user.uid,
                                        reason,
                                        details
                                    });

                                    setIsSubmittingReturn(false);
                                    alert(`Talebiniz Kaydedildi!\n\nShopier üzerinden iade kargo kodunuz oluşturulup size iletilecektir. Takip numaranızı e-posta adresinizden kontrol edebilirsiniz.`);

                                    // Refresh the list to show new status
                                    const userOrders = await getUserOrders(user.uid);
                                    setOrders(userOrders);
                                    setShowReturnModal(false);
                                } catch (error) {
                                    setIsSubmittingReturn(false);
                                    alert('Talebiniz iletilemedi. Lütfen tekrar deneyin.');
                                }
                            }}>
                                <div className={styles.field} style={{ marginBottom: '1rem' }}>
                                    <label>İade Nedeni</label>
                                    <select name="reason" className={styles.select} required defaultValue="">
                                        <option value="" disabled>Seçiniz</option>
                                        <option value="vazgectim">Vazgeçtim</option>
                                        <option value="beden">Beden Uymadı</option>
                                        <option value="kusurlu">Ürün Kusurlu/Hasarlı</option>
                                        <option value="yanlis">Yanlış Ürün Geldi</option>
                                    </select>
                                </div>

                                <div className={styles.field} style={{ marginBottom: '1rem' }}>
                                    <label>Ek Açıklama (Opsiyonel)</label>
                                    <textarea
                                        name="details"
                                        className={styles.textarea}
                                        placeholder="Ürün durumu hakkında bilgi verebilirsiniz..."
                                    ></textarea>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <Button type="button" variant="outline" onClick={() => setShowReturnModal(false)} disabled={isSubmittingReturn}>Vazgeç</Button>
                                    <Button type="submit" disabled={isSubmittingReturn}>
                                        {isSubmittingReturn ? 'İletiliyor...' : 'Talebi Gönder'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div >
    );
}
