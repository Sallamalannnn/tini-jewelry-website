'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Box } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../../new/page.module.css'; // Reuse styles
import editStyles from '../../edit-layout.module.css'; // New overrides
import { getProducts, updateProduct, Product } from '@/lib/productStore';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [images, setImages] = useState<string[]>([]);
    const [showcaseImages, setShowcaseImages] = useState<string[]>([]);
    const [showcaseTexts, setShowcaseTexts] = useState<{ title: string, description: string }[]>([]);
    const [modelFile, setModelFile] = useState<string | null>(null);

    // Form fields state
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Kolye',
        description: '',
        sku: '',
        stockStatus: 'Stokta Var',
        color: 'Sarı',
        material: 'gold',
        stock: '0'
    });

    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const showcaseImageInputRef = useRef<HTMLInputElement>(null);
    const modelInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        if (!id) return;

        const loadProduct = async () => {
            const all = await getProducts();
            const found = all.find(p => p.id === id);

            if (found) {
                setFormData({
                    name: found.name,
                    price: found.price.toString(),
                    category: found.category,
                    description: found.description || '',
                    sku: '',
                    stockStatus: 'Stokta Var',
                    color: found.color || 'Sarı',
                    material: found.material || 'gold',
                    stock: (found.stock ?? 0).toString()
                });

                if (found.images && found.images.length > 0) {
                    setImages(found.images);
                } else if (found.image) {
                    setImages([found.image]);
                }

                if (found.showcaseImages && found.showcaseImages.length > 0) {
                    setShowcaseImages(found.showcaseImages);
                }

                if (found.showcaseText) {
                    setShowcaseTexts(found.showcaseText);
                }

                if (found.model3d) {
                    setModelFile(found.model3d);
                }
            } else {
                alert('Ürün bulunamadı!');
                router.push('/admin/products');
            }
            setIsLoading(false);
        };
        loadProduct();
    }, [id, router]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'showcase' | 'model') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            try {
                if (file.size > 50 * 1024 * 1024) {
                    alert('Dosya boyutu çok yüksek (Max 50MB).');
                    return;
                }

                const base64 = await fileToBase64(file);

                if (target === 'main') {
                    setImages([...images, base64]);
                    setShowcaseTexts([...showcaseTexts, { title: '', description: '' }]);
                } else if (target === 'showcase') {
                    setShowcaseImages([...showcaseImages, base64]);
                } else if (target === 'model') {
                    setModelFile(base64);
                }
            } catch (err) {
                console.error("Dosya dönüştürme hatası:", err);
                alert("Dosya yüklenirken bir hata oluştu.");
            }
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        setShowcaseTexts(showcaseTexts.filter((_, i) => i !== index));
    };

    const updateShowcaseText = (index: number, field: 'title' | 'description', value: string) => {
        const newTexts = [...showcaseTexts];
        if (!newTexts[index]) newTexts[index] = { title: '', description: '' };
        newTexts[index] = { ...newTexts[index], [field]: value };
        setShowcaseTexts(newTexts);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const updatedProduct: Product = {
                id: id,
                name: formData.name,
                price: parseFloat(formData.price),
                category: formData.category,
                image: images[0] || '/placeholder.png',
                images: images.length > 0 ? images : undefined,
                model3d: modelFile || undefined,
                description: formData.description,
                showcaseText: showcaseTexts,
                color: formData.color,
                material: formData.material,
                stock: parseInt(formData.stock) || 0,
                showcaseImages: showcaseImages.length > 0 ? showcaseImages : undefined,
            };

            await updateProduct(updatedProduct);

            alert('Ürün güncellendi!');
            setIsLoading(false);
            router.push('/admin/products');
        } catch (error) {
            console.error(error);
            alert('Güncelleme başarısız.');
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return <div className={styles.container}><div className={styles.header}><h1 className={styles.title}>Yükleniyor...</h1></div></div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin/products" className={styles.backLink}>
                    <ArrowLeft size={20} />
                    <span>Ürünlere Dön</span>
                </Link>
                <h1 className={styles.title}>Ürünü Düzenle</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    {/* Sol Kolon */}
                    <div className={styles.colStack}>
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Temel Bilgiler</h2>
                            <Input name="name" label="Ürün Adı" value={formData.name} onChange={handleChange} required />
                            <div className={styles.row}>
                                <Input name="price" label="Fiyat (₺)" type="number" value={formData.price} onChange={handleChange} required />
                                <Input name="stock" label="Stok Adedi" type="number" value={formData.stock} onChange={handleChange} required />
                                <Input name="sku" label="Stok Kodu (SKU)" value={formData.sku} onChange={handleChange} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Açıklama</label>
                                <textarea name="description" className={styles.textarea} rows={4} value={formData.description} onChange={handleChange}></textarea>
                            </div>
                        </div>

                        {/* Ürün Özellikleri (Detaylar) */}
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Ürün Özellikleri (Detaylar)</h2>
                            <div className={styles.field}>
                                <label className={styles.label}>Renk</label>
                                <select name="color" className={styles.select} value={formData.color} onChange={handleChange}>
                                    <option value="Sarı">Sarı / Altın</option>
                                    <option value="Beyaz">Beyaz / Gümüş</option>
                                    <option value="Pembe">Pembe / Rose</option>
                                    <option value="Siyah">Siyah</option>
                                    <option value="Kırmızı">Kırmızı</option>
                                    <option value="Karışık">Karışık / Renkli</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Materyal Görünümü</label>
                                <select name="material" className={styles.select} value={formData.material} onChange={handleChange}>
                                    <option value="gold">Altın / Gold</option>
                                    <option value="silver">Gümüş / Silver</option>
                                    <option value="rose_gold">Rose Gold</option>
                                    <option value="white gold">Beyaz Altın</option>
                                    <option value="platinum">Platin</option>
                                </select>
                            </div>
                            <Input label="Kargo / Teslimat" placeholder="Örn: 3 İş Günü" />
                        </div>
                    </div>

                    {/* Sağ Kolon */}
                    <div className={styles.colStack}>
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Ürün Görselleri</h2>
                            <div className={editStyles.imageGrid}>
                                {images.map((img, index) => (
                                    <div key={index} className={editStyles.imagePreview}>
                                        <div className={editStyles.imagePreviewWrapper}>
                                            <div className={styles.imageNumber}>{index + 1}</div>
                                            <button type="button" className={styles.removeImageBtn} onClick={() => removeImage(index)}>×</button>
                                            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        </div>

                                        <Input
                                            placeholder="Showcase Başlık"
                                            value={showcaseTexts[index]?.title || ''}
                                            onChange={(e) => updateShowcaseText(index, 'title', e.target.value)}
                                            style={{ fontSize: '0.8rem', padding: '6px' }}
                                        />
                                        <textarea
                                            className={styles.textarea}
                                            rows={2}
                                            placeholder="Showcase Açıklama"
                                            value={showcaseTexts[index]?.description || ''}
                                            onChange={(e) => updateShowcaseText(index, 'description', e.target.value)}
                                            style={{ fontSize: '0.8rem', minHeight: '50px', padding: '6px' }}
                                        ></textarea>
                                    </div>
                                ))}
                                <button type="button" className={`${styles.imageUploadBtn} ${editStyles.imageUploadBtn}`} onClick={() => mainImageInputRef.current?.click()}>
                                    <Upload size={24} /> <span>Ekle</span>
                                </button>
                                <input type="file" ref={mainImageInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'main')} />
                            </div>

                            {/* 3D Model */}
                            <div style={{ marginTop: '20px', borderTop: '1px dashed #eee', paddingTop: '20px' }}>
                                <h3 className={styles.label}>3D Model</h3>
                                {modelFile ? (
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <Box size={20} color="green" /> <span>Model Yüklü</span>
                                        <button type="button" onClick={() => setModelFile(null)} style={{ color: 'red' }}>×</button>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" onClick={() => modelInputRef.current?.click()}>
                                        <Upload size={16} /> 3D Model Yükle
                                    </Button>
                                )}
                                <input type="file" ref={modelInputRef} style={{ display: 'none' }} accept=".glb,.gltf" onChange={(e) => handleFileChange(e, 'model')} />
                            </div>
                        </div>

                        {/* Detayları Keşfet (Showcase) */}
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Detayları Keşfet (Showcase)</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                                Bu görseller detay sayfasındaki animasyonlu vitrinde görünecektir. Ayrı yükleyebilirsiniz.
                            </p>
                            <div className={editStyles.imageGrid}>
                                {showcaseImages.map((img, index) => (
                                    <div key={index} className={editStyles.imagePreview}>
                                        <div className={editStyles.imagePreviewWrapper}>
                                            <div className={styles.imageNumber}>{index + 1}</div>
                                            <button type="button" className={styles.removeImageBtn} onClick={() => setShowcaseImages(showcaseImages.filter((_, i) => i !== index))}>×</button>
                                            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className={`${styles.imageUploadBtn} ${editStyles.imageUploadBtn}`} onClick={() => showcaseImageInputRef.current?.click()}>
                                    <Upload size={24} /> <span>Ekle</span>
                                </button>
                                <input type="file" ref={showcaseImageInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'showcase')} />
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Kategori</h2>
                            <select name="category" className={styles.select} value={formData.category} onChange={handleChange}>
                                <option>Kolye</option>
                                <option>Küpe</option>
                                <option>Yüzük</option>
                                <option>Bileklik</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>İptal</Button>
                    <Button type="submit">Güncelle</Button>
                </div>
            </form>
        </div>
    );
}
