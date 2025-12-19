'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { ProductCard } from '@/components/product/ProductCard';
import { Marquee } from '@/components/ui/Marquee';
import { HorizontalScroll } from '@/components/home/HorizontalScroll';
import { PRODUCTS } from '@/lib/constants'; // Fallback / Initial State
import { getNewArrivals, Product } from '@/lib/productStore';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch from IndexedDB on client mount
    const loadProducts = async () => {
      const data = await getNewArrivals();
      console.log('Homepage: Updated new arrivals list', data);
      setProducts(data);
    };
    loadProducts();
  }, []);

  return (
    <>
      <Hero />

      <Marquee text="• YENİ SEZON KOLEKSİYONU • ŞİMDİ KEŞFET • ÜCRETSİZ KARGO • ÖZEL TASARIMLAR" speed={15} />

      <HorizontalScroll />

      <section className="section container">
        <h2 style={{
          fontSize: '3rem',
          marginBottom: '0.5rem',
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
          background: 'linear-gradient(135deg, #8B6508 0%, #B8860B 25%, #FFD700 50%, #B8860B 75%, #8B6508 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'textShine 8s linear infinite',
          fontWeight: 700
        }}>Yeni Gelenler</h2>
        <p style={{
          color: '#b8860b',
          textAlign: 'center',
          marginBottom: 'var(--spacing-2xl)',
          fontSize: '1.2rem',
          fontWeight: 500,
          letterSpacing: '0.05em'
        }}>En son eklenen özel parçalarımızı inceleyin.</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-xl)'
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)' }}>
          <Link href="/products" style={{
            display: 'inline-block',
            padding: '14px 48px',
            background: 'linear-gradient(135deg, #d4af37 0%, #c5a028 100%)',
            color: 'white',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)',
            transition: 'all 0.3s ease'
          }}>
            Tüm Ürünleri Gör
          </Link>
        </div>
      </section>


      <section className="section" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: 'var(--spacing-md)',
            fontFamily: 'var(--font-heading)',
            color: '#8B6508'
          }}>Tını Dünyasına Katılın</h2>
          <p style={{
            maxWidth: '600px',
            margin: '0 auto',
            color: '#b8860b',
            fontSize: '1.1rem'
          }}>
            Eşsiz tasarımlar, özel indirimler ve ilham verici içerikler için bültenimize abone olun.
          </p>
        </div>
      </section>

    </>
  );
}
