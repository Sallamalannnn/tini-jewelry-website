'use client';

import { useState, useRef } from 'react';
import { Camera, Sparkles, Upload, RefreshCcw, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getProducts, Product } from '@/lib/productStore';
import Image from 'next/image';

const STYLES = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        color: '#fff',
        padding: '80px 20px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        fontFamily: "'Inter', sans-serif"
    },
    hero: {
        textAlign: 'center' as const,
        maxWidth: '800px',
        marginBottom: '60px'
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 800,
        background: 'linear-gradient(to right, #b8860b, #daa520, #ffd700)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '15px'
    },
    subtitle: {
        fontSize: '1.2rem',
        color: '#888',
        lineHeight: 1.6
    },
    uploadZone: {
        width: '100%',
        maxWidth: '500px',
        height: '350px',
        border: '2px dashed #333',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: 'rgba(255,255,255,0.02)',
        position: 'relative' as const,
        overflow: 'hidden'
    },
    resultGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        width: '100%',
        maxWidth: '1200px',
        marginTop: '60px'
    },
    card: {
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'transform 0.3s ease'
    }
};

export default function AIStylistPage() {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                setImage(readerEvent.target?.result as string);
                processImage(readerEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (base64: string) => {
        setIsAnalyzing(true);
        try {
            const inventory = await getProducts();
            const res = await fetch('/api/ai-stylist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64, currentInventory: inventory })
            });
            const data = await res.json();
            setResult(data);

            const matched = inventory.filter(p =>
                data.suggestions.some((s: any) => s.productId === p.id)
            );
            setRecommendedProducts(matched);
        } catch (error) {
            alert('Stil analizi başarısız oldu.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={STYLES.container}>
            <div style={STYLES.hero}>
                <h1 style={STYLES.title}>Tını AI Stilist</h1>
                <p style={STYLES.subtitle}>
                    Kıyafetini veya makyajını paylaş, AI danışmanımız sana en uygun mücevheri seçsin.
                    Sana özel, kişisel bir lüks deneyimi.
                </p>
            </div>

            {!image ? (
                <div
                    style={STYLES.uploadZone}
                    onClick={() => fileInputRef.current?.click()}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#b8860b'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#333'}
                >
                    <input type="file" hidden ref={fileInputRef} onChange={handleUpload} accept="image/*" />
                    <div style={{ backgroundColor: 'rgba(184, 134, 11, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
                        <Camera size={40} color="#b8860b" />
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: '5px' }}>Kombinini Yükle</p>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Siyah elbise, gece makyajı veya günlük stil...</p>
                </div>
            ) : (
                <div style={{ position: 'relative', width: '300px', height: '400px', borderRadius: '24px', overflow: 'hidden', border: '2px solid #b8860b' }}>
                    <Image src={image} alt="Look" fill style={{ objectFit: 'cover' }} />
                    {isAnalyzing && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <RefreshCcw size={40} className="animate-spin" color="#b8860b" />
                            <p style={{ marginTop: '15px', fontWeight: 600 }}>Stilin Analiz Ediliyor...</p>
                        </div>
                    )}
                </div>
            )}

            {result && !isAnalyzing && (
                <div style={{ width: '100%', maxWidth: '1200px', marginTop: '80px' }}>
                    <div style={{ backgroundColor: 'rgba(184, 134, 11, 0.05)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(184, 134, 11, 0.2)', marginBottom: '40px' }}>
                        <h2 style={{ color: '#b8860b', fontSize: '1.5rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles size={24} /> Stil Analizin
                        </h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#ddd' }}>{result.analysis}</p>
                    </div>

                    <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '30px', textAlign: 'center' }}>Senin İçin Seçtiklerimiz</h3>
                    <div style={STYLES.resultGrid}>
                        {recommendedProducts.map((product) => {
                            const suggestion = result.suggestions.find((s: any) => s.productId === product.id);
                            return (
                                <div key={product.id} style={STYLES.card}>
                                    <div style={{ position: 'relative', height: '250px', borderRadius: '15px', overflow: 'hidden', marginBottom: '20px' }}>
                                        <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '10px' }}>{product.name}</h4>
                                    <p style={{ color: '#b8860b', fontWeight: 700, fontSize: '1.1rem', marginBottom: '15px' }}>{product.price.toLocaleString('tr-TR')} ₺</p>

                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                                        <p style={{ fontSize: '0.9rem', color: '#999', fontStyle: 'italic' }}>
                                            "{suggestion?.reason}"
                                        </p>
                                    </div>

                                    <Button variant="primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        Ürüne Git <ArrowRight size={16} />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {image && !isAnalyzing && (
                <Button
                    variant="outline"
                    onClick={() => { setImage(null); setResult(null); }}
                    style={{ marginTop: '40px' }}
                >
                    Farklı Bir Görünüm Deneyin
                </Button>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
