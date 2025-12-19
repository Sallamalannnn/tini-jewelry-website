'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import { ProductDetailActions } from './ProductDetailActions';
import { InteractiveShowcase } from '@/components/product/InteractiveShowcase';
import { ProductCardStack } from '@/components/product/ProductCardStack';
import { getProducts, Product } from '@/lib/productStore';
import styles from './page.module.css';

export default function ProductPage() {
    const params = useParams();
    const id = params?.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    // Prepare images array - use product's images if available
    const galleryImages = useMemo(() => {
        if (!product) return [];
        const imgs = product.images && product.images.length > 0
            ? product.images
            : (product.image ? [product.image] : ['/placeholder.png']);

        return imgs.length > 1
            ? imgs
            : [imgs[0], imgs[0], imgs[0], imgs[0]];
    }, [product]);

    useEffect(() => {
        if (!id) return;

        const loadProduct = async () => {
            const allProducts = await getProducts();
            const found = allProducts.find((p) => p.id === id);

            if (found) {
                setProduct(found);
                const color = (found.color || 'Sarı').toLowerCase();
                document.body.setAttribute('data-theme', color);
            }
            setIsLoading(false);
        };

        loadProduct();

        return () => {
            document.body.removeAttribute('data-theme');
        };
    }, [id]);

    if (isLoading) {
        return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Yükleniyor...</div>;
    }

    if (!product) {
        return <div className={styles.notFound}>Ürün bulunamadı</div>;
    }

    // Determine Color Variant for styling
    const colorVariant = (product.color || 'Sarı').toLowerCase();


    // galleryImages moved up

    return (
        <main className={styles.mainContainer}>
            <div className={styles.ambientBg}>
                <div
                    className={styles.blurredImage}
                    style={{ backgroundImage: `url(${activeImage || galleryImages[0]})` }}
                />
                <div className={styles.overlay} />
            </div>

            <div className={`container ${styles.page}`} data-color={colorVariant}>
                {/* Breadcrumb (Basit) */}
                <nav className={styles.breadcrumb}>
                    <span>Ana Sayfa</span> / <span>Koleksiyon</span> / <span className={styles.active}>{product.name}</span>
                </nav>

                <div className={styles.grid}>
                    {/* Görsel Alanı - Swipable Stack */}
                    <div className={styles.gallery}>
                        <ProductCardStack
                            images={galleryImages}
                            modelUrl={product.model3d}
                            onImageChange={setActiveImage}
                            materialVariant={colorVariant as any}
                        />
                    </div>

                    {/* Bilgi Alanı */}
                    <div className={styles.info}>
                        <h1 className={styles.title}>{product.name}</h1>
                        <p className={styles.price}>{product.price.toLocaleString('tr-TR')} ₺</p>

                        <div className={styles.divider} />

                        <p className={styles.description}>
                            {product.description || "Bu özel tasarım, zarafeti ve modern çizgileri bir araya getiriyor. Günlük kullanım ve özel davetler için mükemmel bir tamamlayıcı."}
                        </p>

                        {/* Client Bileşeni: Sepete Ekleme İşlemleri */}
                        <ProductDetailActions product={product} />

                        <div className={styles.meta}>
                            <div className={styles.metaItem}>
                                <strong>Kategori:</strong> {product.category}
                            </div>
                            <div className={styles.metaItem}>
                                <strong>Materyal:</strong> 14 Ayar Altın
                            </div>
                            <div className={styles.metaItem}>
                                <strong>Kargo:</strong> 3 İş Günü İçinde Ücretsiz Teslimat
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll-Driven Interactive Showcase (Full Width) */}
            <InteractiveShowcase
                images={
                    product.showcaseImages && product.showcaseImages.length > 0
                        ? product.showcaseImages
                        : (product.images && product.images.length > 0 ? product.images : [product.image])
                }
                name={product.name}
                texts={product.showcaseText}
                materialVariant={colorVariant as any}
            />
        </main>
    );
}
