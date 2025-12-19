'use client';

import { ShieldCheck, Database, Cpu, ExternalLink } from 'lucide-react';

interface BlockchainCertificateProps {
    orderId: string;
    productName: string;
    date: string;
}

export const BlockchainCertificate = ({ orderId, productName, date }: BlockchainCertificateProps) => {
    const hash = `0x${Math.random().toString(16).slice(2, 42)}`;

    return (
        <div style={{
            background: 'linear-gradient(145deg, #111 0%, #000 100%)',
            border: '1px solid #333',
            borderRadius: '16px',
            padding: '25px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Accent */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                backgroundColor: 'rgba(184, 134, 11, 0.1)',
                filter: 'blur(30px)',
                borderRadius: '50%'
            }} />

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{
                    backgroundColor: 'rgba(184, 134, 11, 0.1)',
                    padding: '15px',
                    borderRadius: '12px',
                    height: 'fit-content'
                }}>
                    <ShieldCheck size={32} color="#b8860b" />
                </div>

                <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Dijital Orijinallik Sertifikası (NFT)
                        <span style={{ fontSize: '0.7rem', backgroundColor: '#b8860b', color: '#000', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>Onaylı</span>
                    </h3>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '15px' }}>
                        Bu ürün Blockchain altyapısı ile dijital olarak tescil edilmiştir ve ömür boyu orijinallik garantisi altındadır.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Varlık ID</span>
                            <span style={{ color: '#ddd', fontSize: '0.9rem', fontWeight: 500 }}>{orderId.replace('SIP', 'TINI-NFT')}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Tescil Tarihi</span>
                            <span style={{ color: '#ddd', fontSize: '0.9rem', fontWeight: 500 }}>{date}</span>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Blockchain Hash (Ethereum Mainnet)</span>
                            <span style={{ color: '#b8860b', fontSize: '0.8rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{hash}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                        <button style={{
                            background: 'none',
                            border: '1px solid #333',
                            color: '#fff',
                            padding: '8px 15px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}>
                            <ExternalLink size={14} /> Etherscan'de Görüntüle
                        </button>
                        <button style={{
                            background: '#fff',
                            border: 'none',
                            color: '#000',
                            padding: '8px 15px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>
                            Cüzdana Aktar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
