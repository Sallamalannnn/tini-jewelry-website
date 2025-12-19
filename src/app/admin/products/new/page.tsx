'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Wand2, Box, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addProduct } from '@/lib/productStore';
import { generateProductContent } from '@/lib/gemini';
import styles from './page.module.css';

export default function NewProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [showcaseImages, setShowcaseImages] = useState<string[]>([]);
    const [modelFile, setModelFile] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAiTextGenerating, setIsAiTextGenerating] = useState(false);

    // Form States for AI Population
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('0');
    const [sku, setSku] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Kolye');
    const [material, setMaterial] = useState('gold');
    const [style, setStyle] = useState('Modern');
    const [color, setColor] = useState('Sarı');

    const [showcaseTitle1, setShowcaseTitle1] = useState('');
    const [showcaseDesc1, setShowcaseDesc1] = useState('');
    const [showcaseTitle2, setShowcaseTitle2] = useState('');
    const [showcaseDesc2, setShowcaseDesc2] = useState('');


    // Hidden file inputs
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const showcaseImageInputRef = useRef<HTMLInputElement>(null);
    const modelInputRef = useRef<HTMLInputElement>(null);

    const [aiPrompt, setAiPrompt] = useState<string>(''); // Kullanıcıdan gelen ekstra prompt

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

    const handleAiTextGenerate = async () => {
        if (images.length === 0) {
            alert('Lütfen önce bir ürün görseli yükleyin.');
            return;
        }

        setIsAiTextGenerating(true);
        try {
            // Send image to our secure backend API
            const response = await fetch('/api/analyze-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: images[0],
                    customPrompt: aiPrompt
                }),
            });

            const content = await response.json();

            if (content.error) {
                const details = content.details ? `\nDetay: ${content.details}` : '';
                throw new Error(`${content.error}${details}`);
            }

            // Auto-fill fields from API response
            setName(content.urun_adi);
            setDescription(content.aciklama);
            setPrice(content.fiyat || '');
            setSku(content.sku || '');

            if (content.renk) setColor(content.renk);
            if (content.materyal) setMaterial(content.materyal);
            if (content.kategori) setCategory(content.kategori);
            if (content.tarz) setStyle(content.tarz);

            if (content.showcaseText && content.showcaseText.length > 0) {
                setShowcaseTitle1(content.showcaseText[0].title);
                setShowcaseDesc1(content.showcaseText[0].description);

                if (content.showcaseText.length > 1) {
                    setShowcaseTitle2(content.showcaseText[1].title);
                    setShowcaseDesc2(content.showcaseText[1].description);
                }
            }

            alert('AI Analizi Tamamlandı! ✨');

        } catch (error: any) {
            console.error('AI Text Generation Error:', error);
            alert(`AI Hatası: ${error.message || 'Bilinmeyen hata'}`);
        } finally {
            setIsAiTextGenerating(false);
        }
    };


    const handleAiGenerate = async () => {
        if (images.length === 0) {
            alert('Lütfen önce en az bir ürün görseli yükleyin.');
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch(images[0]);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('image', blob);

            const apiRes = await fetch('/api/ai/generate', {
                method: 'POST',
                body: formData
            });

            const data = await apiRes.json();

            if (data.success) {
                setShowcaseImages([...showcaseImages, data.imageUrl]);
            } else {
                alert('Hata: ' + (data.error || 'Bilinmeyen hata'));
            }

        } catch (error) {
            console.error('Generasyon hatası:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsGenerating(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // We use state values instead of formData since we controlled them
        try {
            const newProduct = {
                name,
                price: parseFloat(price),
                category,
                image: images[0] || '/placeholder.png',
                images: images.length > 0 ? images : undefined,
                model3d: modelFile || undefined,
                description,
                color,
                material,
                stock: parseInt(stock) || 0,
                showcaseImages: showcaseImages.length > 0 ? showcaseImages : undefined,
                showcaseText: [
                    { title: showcaseTitle1, description: showcaseDesc1 },
                    { title: showcaseTitle2, description: showcaseDesc2 }
                ].filter(t => t.title && t.description)
            };

            await addProduct(newProduct);

            alert('Ürün başarıyla eklendi!');
            setIsLoading(false);
            router.push('/admin/products');
        } catch (error) {
            console.error('Form: Save FAILED!', error);
            alert(`Kaydetme başarısız! Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
            setIsLoading(false);
        }
    };

    const handleAiImageGenerate = async () => {
        if (images.length === 0) {
            alert('Lütfen önce bir ürün görseli yükleyin.');
            return;
        }

        setIsAiTextGenerating(true); // Reuse loading state or create new one
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: images[0],
                    customPrompt: aiPrompt
                }),
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error + (data.details ? `\nDetay: ${data.details}` : ""));
            }

            if (data.image) {
                // Oluşturulan resmi vitrin görsellerine ekle
                setShowcaseImages([...showcaseImages, data.image]);
                alert('✨ Harika! Yapay zeka yeni ürün görselini oluşturdu ve listeye ekledi.');
            } else {
                alert(`Görsel Prompt Hazırlandı ama resim döndürülemedi:\n${data.message}`);
            }

        } catch (error: any) {
            console.error('AI Image Error:', error);
            alert(`Görsel Hatası: ${error.message}`);
        } finally {
            setIsAiTextGenerating(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link href="/admin/products" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        <span>Ürünlere Dön</span>
                    </Link>
                    <h1 className={styles.title}>Yeni Ürün Ekle</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                    <input
                        type="text"
                        placeholder="AI için özel talimat (Örn: Eğlenceli tonla yaz)"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                            width: '300px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Button
                            type="button"
                            onClick={handleAiTextGenerate}
                            disabled={isAiTextGenerating}
                            style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                color: '#000',
                                fontWeight: 'bold',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                            }}
                        >
                            {isAiTextGenerating ? (
                                <Loader2Icon size={18} className="animate-spin" />
                            ) : (
                                <Sparkles size={18} style={{ marginRight: '5px' }} />
                            )}
                            Doldur
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAiImageGenerate}
                            disabled={isAiTextGenerating}
                            style={{
                                background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
                                color: '#fff',
                                fontWeight: 'bold',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(0, 198, 255, 0.3)'
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} />
                                <span>Görsel</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    {/* Sol Kolon: Temel Bilgiler */}
                    <div className={styles.colStack}>
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Temel Bilgiler</h2>
                            <Input
                                name="name"
                                label="Ürün Adı (veya AI için ipucu)"
                                placeholder="Örn: Altın Kolye"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                            <div className={styles.row}>
                                <Input
                                    name="price"
                                    label="Fiyat (₺)"
                                    type="number"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    required
                                />
                                <Input
                                    name="stock"
                                    label="Stok Adedi"
                                    type="number"
                                    placeholder="0"
                                    value={stock}
                                    onChange={e => setStock(e.target.value)}
                                    required
                                />
                                <Input
                                    name="sku"
                                    label="Stok Kodu (SKU)"
                                    placeholder="KLY-001"
                                    value={sku}
                                    onChange={e => setSku(e.target.value)}
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Açıklama</label>
                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    rows={6}
                                    placeholder="Ürün açıklaması..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Yeni Bölüm: Ürün Özellikleri (Detaylar) */}
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Ürün Özellikleri (Detaylar)</h2>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Renk</label>
                                    <select name="color" className={styles.select} value={color} onChange={e => setColor(e.target.value)}>
                                        <option value="Sarı">Sarı / Altın</option>
                                        <option value="Beyaz">Beyaz / Gümüş</option>
                                        <option value="Pembe">Pembe / Rose</option>
                                        <option value="Siyah">Siyah</option>
                                        <option value="Kırmızı">Kırmızı</option>
                                        <option value="Karışık">Karışık / Renkli</option>
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Materyal</label>
                                    <select name="material" className={styles.select} value={material} onChange={e => setMaterial(e.target.value)}>
                                        <option value="gold">Altın / Gold</option>
                                        <option value="silver">Gümüş / Silver</option>
                                        <option value="rose_gold">Rose Gold</option>
                                        <option value="white gold">Beyaz Altın</option>
                                        <option value="platinum">Platin</option>
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Tarz (AI İçin)</label>
                                    <select name="style" className={styles.select} value={style} onChange={e => setStyle(e.target.value)}>
                                        <option value="Modern">Modern</option>
                                        <option value="Klasik">Klasik</option>
                                        <option value="Vintage">Vintage / Retro</option>
                                        <option value="Minimalist">Minimalist</option>
                                        <option value="Gösterişli">Gösterişli / Abiye</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Kolon: Görsel ve Kategori */}
                    <div className={styles.colStack}>
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Ürün Görselleri</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                                İlk görsel ana resim olarak kullanılacaktır.
                            </p>

                            <div className={styles.imageGrid}>
                                {images.map((img, index) => (
                                    <div key={index} className={styles.imagePreview}>
                                        <div className={styles.imageNumber}>{index + 1}</div>
                                        <button
                                            type="button"
                                            className={styles.removeImageBtn}
                                            onClick={() => removeImage(index)}
                                        >
                                            ×
                                        </button>
                                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className={styles.imageUploadBtn}
                                    onClick={() => mainImageInputRef.current?.click()}
                                >
                                    <Upload size={24} color="var(--color-text-muted)" />
                                    <span>Görsel Ekle</span>
                                </button>
                                <input
                                    type="file"
                                    ref={mainImageInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'main')}
                                />
                            </div>

                            {/* 3D Model Upload Section */}
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
                                <h3 className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Box size={16} /> 3D Model (Opsiyonel)
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                                    Ürün detayında 3D inceleme için .glb veya .gltf dosyası yükleyin.
                                </p>

                                {modelFile ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                                        <Box size={20} color="#16a34a" />
                                        <span style={{ fontSize: '0.9rem', flex: 1, color: '#166534' }}>model.glb (Yüklendi)</span>
                                        <button
                                            type="button"
                                            onClick={() => setModelFile(null)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => modelInputRef.current?.click()}
                                            style={{ width: '100%', borderStyle: 'dashed' }}
                                        >
                                            <Upload size={16} style={{ marginRight: '8px' }} />
                                            3D Dosya Seç (.glb)
                                        </Button>
                                        <input
                                            type="file"
                                            ref={modelInputRef}
                                            style={{ display: 'none' }}
                                            accept=".glb,.gltf"
                                            onChange={(e) => handleFileChange(e, 'model')}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Detayları Keşfet (Showcase) Ayarları */}
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Detayları Keşfet (Showcase)</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                                Kendi görsellerinizi yükleyin veya AI metinleri kullanın.
                            </p>

                            <div className={styles.imageGrid}>
                                {showcaseImages.map((img, index) => (
                                    <div key={index} className={styles.imagePreview}>
                                        <div className={styles.imageNumber}>{index + 1}</div>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                        <button
                                            type="button"
                                            className={styles.removeImageBtn}
                                            onClick={() => setShowcaseImages(showcaseImages.filter((_, i) => i !== index))}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className={styles.imageUploadBtn}
                                    onClick={() => showcaseImageInputRef.current?.click()}
                                >
                                    <Upload size={24} color="var(--color-text-muted)" />
                                    <span>Manuel Ekle</span>
                                </button>
                                <input
                                    type="file"
                                    ref={showcaseImageInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'showcase')}
                                />
                            </div>

                            <div className={styles.field} style={{ marginTop: '20px' }}>
                                <label className={styles.label}>Tanıtım Başlığı 1</label>
                                <Input placeholder="Örn: Kusursuz Işıltı" value={showcaseTitle1} onChange={e => setShowcaseTitle1(e.target.value)} />
                                <div style={{ height: 8 }}></div>
                                <label className={styles.label}>Tanıtım Açıklaması 1</label>
                                <textarea className={styles.textarea} rows={3} placeholder="Detaylı açıklama..." value={showcaseDesc1} onChange={e => setShowcaseDesc1(e.target.value)} />
                            </div>

                            <div className={styles.field} style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                <label className={styles.label}>Tanıtım Başlığı 2</label>
                                <Input placeholder="Örn: El İşçiliği" value={showcaseTitle2} onChange={e => setShowcaseTitle2(e.target.value)} />
                                <div style={{ height: 8 }}></div>
                                <label className={styles.label}>Tanıtım Açıklaması 2</label>
                                <textarea className={styles.textarea} rows={3} placeholder="Detaylı açıklama..." value={showcaseDesc2} onChange={e => setShowcaseDesc2(e.target.value)} />
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Diğer</h2>
                            <div className={styles.field}>
                                <label className={styles.label}>Kategori</label>
                                <select name="category" className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
                                    <option>Kolye</option>
                                    <option>Küpe</option>
                                    <option>Yüzük</option>
                                    <option>Bileklik</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>İptal</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Helper component for loading icon if not available
function Loader2Icon({ className, style, size }: { className?: string, style?: any, size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
