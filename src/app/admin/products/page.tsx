'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Check, Loader2, AlertTriangle, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getProducts, updateProduct, deleteProduct, Product } from '@/lib/productStore';
import styles from './page.module.css';

const CATEGORIES = ['Kolye', 'Küpe', 'Yüzük', 'Bileklik'];
const LOW_STOCK_THRESHOLD = 5;

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        const loadProducts = async () => {
            const data = await getProducts();
            // Ensure every product has a stock and costPrice value (fallback to 0)
            const sanitized = data.map(p => ({ ...p, stock: p.stock ?? 0, costPrice: p.costPrice ?? 0 }));
            setProducts(sanitized);
        };
        loadProducts();
    }, []);

    const lowStockItems = products.filter(p => (p.stock ?? 0) < LOW_STOCK_THRESHOLD);

    const handleChange = (id: string, field: keyof Product, value: any) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
        setEditingId(id);
    };


    const handleSave = async (product: Product) => {
        setSavingId(product.id);
        try {
            await updateProduct(product);
            setEditingId(null);
            alert('Ürün ve maliyet bilgileri başarıyla güncellendi.');
        } catch (error) {
            console.error('Update failed:', error);
            alert('Güncelleme başarısız oldu.');
        } finally {
            setSavingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            try {
                await deleteProduct(id);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                alert('Silme işlemi başarısız oldu.');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Ürün ve Maliyet Yönetimi</h1>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        Yeni Ürün Ekle
                    </Button>
                </Link>
            </div>

            {lowStockItems.length > 0 && (
                <div className={styles.summary}>
                    <div className={styles.alertBox}>
                        <AlertTriangle className={styles.alertIcon} size={24} />
                        <div>
                            <strong>Düşük Stok Uyarısı!</strong>
                            <p>{lowStockItems.length} ürünün stoğu {LOW_STOCK_THRESHOLD}'in altına düşmüş durumda.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Görsel</th>
                            <th>Ürün Adı</th>
                            <th>Fiyat (₺)</th>
                            <th style={{ width: '100px', backgroundColor: '#fff3e0' }}>Maliyet (₺)</th>
                            <th style={{ width: '120px', backgroundColor: '#e8f5e9' }}>Net Kar</th>
                            <th style={{ width: '100px' }}>Stok</th>
                            <th style={{ width: '120px' }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const isBeingEdited = editingId === product.id;
                            const isSaving = savingId === product.id;
                            const isLowStock = (product.stock ?? 0) < LOW_STOCK_THRESHOLD;

                            const cost = product.costPrice || 0;
                            const price = product.price || 0;
                            const profit = price - cost;
                            const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : 0;

                            return (
                                <tr key={product.id} className={`${isSaving ? styles.saving : ''} ${isLowStock ? styles.lowStock : ''}`}>
                                    <td>
                                        <div className={styles.imagePlaceholder}>
                                            <img src={product.image} alt={product.name} className={styles.image} />
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className={styles.inlineInput}
                                            value={product.name}
                                            onChange={(e) => handleChange(product.id, 'name', e.target.value)}
                                        />
                                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>{product.category}</div>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className={styles.inlineInput}
                                            value={product.price}
                                            onChange={(e) => handleChange(product.id, 'price', Number(e.target.value))}
                                        />
                                    </td>
                                    <td style={{ backgroundColor: '#fff8e1' }}>
                                        <input
                                            type="number"
                                            className={styles.inlineInput}
                                            style={{ backgroundColor: 'transparent', fontWeight: 'bold' }}
                                            value={product.costPrice}
                                            placeholder="0"
                                            onChange={(e) => handleChange(product.id, 'costPrice', Number(e.target.value))}
                                        />
                                    </td>
                                    <td style={{ backgroundColor: '#f1f8e9' }}>
                                        <div style={{ fontWeight: 'bold', color: profit > 0 ? 'green' : 'red' }}>
                                            {profit.toLocaleString('tr-TR')} ₺
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                            %{margin} Kar
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className={styles.inlineInput}
                                            value={product.stock}
                                            onChange={(e) => handleChange(product.id, 'stock', Number(e.target.value))}
                                        />
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            {isBeingEdited ? (
                                                <button
                                                    className={styles.saveBtn}
                                                    onClick={() => handleSave(product)}
                                                    disabled={isSaving}
                                                    title="Kaydet"
                                                >
                                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                </button>
                                            ) : (
                                                <Link href={`/admin/products/edit/${product.id}`}>
                                                    <button className={`${styles.actionBtn} ${styles.edit}`} title="Detaylı Düzenle">
                                                        <Edit2 size={18} />
                                                    </button>
                                                </Link>
                                            )}

                                            <button
                                                className={`${styles.actionBtn} ${styles.delete}`}
                                                title="Sil"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
