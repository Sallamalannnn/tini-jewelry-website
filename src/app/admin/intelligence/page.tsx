'use client';

import { useState } from 'react';
import { TrendingUp, Users, Map, Package, BrainCircuit, Zap, BarChart3, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STYLES = {
    card: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #eee',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    },
    statTitle: { fontSize: '0.9rem', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
    statValue: { fontSize: '1.8rem', fontWeight: 800, color: '#111' }
};

export default function IntelligenceDashboard() {
    const [view, setView] = useState('insights');

    return (
        <div style={{ padding: '30px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111', marginBottom: '8px' }}>Tını AI Intelligence</h1>
                    <p style={{ color: '#666' }}>Geleceği öngören satış ve kullanıcı davranış analizleri.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="outline" size="sm">Raporu İndir</Button>
                    <Button variant="primary" size="sm" style={{ backgroundColor: '#000', color: '#fff' }}>
                        <Zap size={16} /> Verileri Güncelle
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div style={STYLES.card}>
                    <div style={STYLES.statTitle}><TrendingUp size={16} color="#2e7d32" /> Trend Skoru</div>
                    <div style={STYLES.statValue}>84 / 100</div>
                    <div style={{ color: '#2e7d32', fontSize: '0.85rem', marginTop: '10px', fontWeight: 600 }}>+12% Geçen aya göre</div>
                </div>
                <div style={STYLES.card}>
                    <div style={STYLES.statTitle}><Users size={16} color="#0277bd" /> Tahmini Müşteri Ortalaması</div>
                    <div style={STYLES.statValue}>12.4K</div>
                    <div style={{ color: '#0277bd', fontSize: '0.85rem', marginTop: '10px', fontWeight: 600 }}>Kararlı Büyüme</div>
                </div>
                <div style={STYLES.card}>
                    <div style={STYLES.statTitle}><Map size={16} color="#ef6c00" /> Aktif İlgi Odağı</div>
                    <div style={STYLES.statValue}>İstanbul</div>
                    <div style={{ color: '#ef6c00', fontSize: '0.85rem', marginTop: '10px', fontWeight: 600 }}>%42 Trafik Payı</div>
                </div>
                <div style={STYLES.card}>
                    <div style={STYLES.statTitle}><Package size={16} color="#b8860b" /> Stok Optimizasyonu</div>
                    <div style={STYLES.statValue}>Kritik</div>
                    <div style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '10px', fontWeight: 600 }}>3 Ürün Stokta Tükeniyor</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                {/* AI Predictions */}
                <div style={STYLES.card}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BrainCircuit color="#b8860b" /> AI Trend Öngörüleri
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { title: 'Altın Minimalist Kolye', trend: 'Yükselişte', prob: '%92', action: 'Stok Artırın' },
                            { title: 'İnci Küpeler', trend: 'Kararlı', prob: '%74', action: 'Kampanya Yapın' },
                            { title: 'Gümüş Bileklikler', trend: 'Düşüşte', prob: '%58', action: 'Fiyat Revize' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', borderRadius: '12px', border: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Tahmin Tutarlılığı: {item.prob}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        backgroundColor: item.trend === 'Yükselişte' ? '#e8f5e9' : item.trend === 'Kararlı' ? '#e1f5fe' : '#fff3e0',
                                        color: item.trend === 'Yükselişte' ? '#2e7d32' : item.trend === 'Kararlı' ? '#0277bd' : '#ef6c00'
                                    }}>
                                        {item.trend}
                                    </span>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111', marginTop: '5px' }}>{item.action}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Regional Interest (Heatmap Mockup) */}
                <div style={STYLES.card}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Bölgesel İlgi Haritası</h3>
                    <div style={{ width: '100%', height: '250px', backgroundColor: '#f0f0f0', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                        {/* Fake Heatmap Blobs */}
                        <div style={{ position: 'absolute', top: '40%', left: '30%', width: '60px', height: '60px', backgroundColor: 'rgba(184, 134, 11, 0.4)', borderRadius: '50%', filter: 'blur(20px)' }} />
                        <div style={{ position: 'absolute', top: '10%', left: '60%', width: '80px', height: '80px', backgroundColor: 'rgba(184, 134, 11, 0.6)', borderRadius: '50%', filter: 'blur(25px)' }} />
                        <div style={{ padding: '20px', fontSize: '0.8rem', color: '#999' }}>Harita Verisi Yükleniyor...</div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.9rem' }}>Marmara Bölgesi</span>
                            <span style={{ fontWeight: 700 }}>%58</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px' }}>
                            <div style={{ width: '58%', height: '100%', backgroundColor: '#b8860b', borderRadius: '3px' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
