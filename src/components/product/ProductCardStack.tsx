'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from 'framer-motion';
import styles from './ProductCardStack.module.css';
import { Real3DViewer } from './Real3DViewer';

interface ProductCardStackProps {
    images: string[];
    modelUrl?: string;
    onImageChange?: (src: string) => void;
    materialVariant?: string;
}


interface CardData {
    id: string;
    src: string;
}

export const ProductCardStack = ({ images, modelUrl, onImageChange, materialVariant = 'gold' }: ProductCardStackProps) => {

    // Helper to generate cards
    const generateCards = (baseImages: string[], offset: number = 0): CardData[] => {
        // ... code ...
        // Ensure at least some images exist to avoid errors
        const safeImages = baseImages.length > 0 ? baseImages : ['/placeholder.png'];

        return [...safeImages, ...safeImages, ...safeImages].slice(0, 5).map((img, i) => ({
            id: `${i}-${offset}`,
            src: img
        }));
    };

    const [activeCards, setActiveCards] = useState<CardData[]>(() => generateCards(images, 0));

    // Reset cards when images prop changes (e.g. switching products)
    useEffect(() => {
        setActiveCards(generateCards(images, 0));
    }, [images]);

    // Calculate front card src early
    const frontCardSrc = activeCards.length > 0 ? activeCards[activeCards.length - 1].src : null;

    // Notify parent about image change
    useEffect(() => {
        if (frontCardSrc && onImageChange) {
            onImageChange(frontCardSrc);
        }
    }, [frontCardSrc, onImageChange]);

    const [historyCards, setHistoryCards] = useState<CardData[]>([]);

    // Lightbox State
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [is3DMode, setIs3DMode] = useState(false);

    // Shared Drag Value
    const magneticDragX = useMotionValue(0);

    // --- Logic ---

    const removeCard = (id: string, velocity: number) => {
        const cardToRemove = activeCards.find(c => c.id === id);
        if (cardToRemove) {
            setHistoryCards((prev) => [...prev, cardToRemove]);
            setActiveCards((prev) => {
                const updated = prev.filter((c) => c.id !== id);
                if (updated.length < 2 && images.length > 0) {
                    const freshCards = generateCards(images, Date.now());
                    return [...freshCards, ...updated];
                }
                return updated;
            });
        }
        animate(magneticDragX, 0, { type: "spring", stiffness: 300, damping: 20 });
    };

    const restoreCard = () => {
        if (historyCards.length === 0) return;
        const lastRemoved = historyCards[historyCards.length - 1];
        setHistoryCards((prev) => prev.slice(0, -1));
        setActiveCards((prev) => [...prev, lastRemoved]);
    };

    // Card Navigation Handlers
    const handleNext = () => {
        if (activeCards.length > 0) {
            const frontCard = activeCards[activeCards.length - 1];
            removeCard(frontCard.id, -1000);
        } else {
            setActiveCards(() => generateCards(images, Date.now()));
        }
    };

    const handlePrev = () => {
        if (historyCards.length > 0) {
            restoreCard();
        } else if (activeCards.length > 0) {
            // Infinite Reverse Logic
            const currentFront = activeCards[activeCards.length - 1];
            const currentIndex = images.indexOf(currentFront.src);
            const prevIndex = currentIndex === -1
                ? images.length - 1
                : (currentIndex - 1 + images.length) % images.length;

            const prevImage = images[prevIndex];
            const newCard: CardData = { id: `infinite-prev-${Date.now()}`, src: prevImage };
            setActiveCards((prev) => [...prev, newCard]);
        }
    };

    const handleThumbnailClick = (targetSrc: string) => {
        const cleanActive = activeCards.filter(c => c.src !== targetSrc);
        setHistoryCards(prev => prev.filter(c => c.src !== targetSrc));
        const newCard = { id: `jump-${targetSrc}-${Date.now()}`, src: targetSrc };
        setActiveCards([...cleanActive, newCard]);
    };

    // Lightbox Navigation Handlers
    const handleLightboxNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!fullscreenImage) return;
        setIs3DMode(false);
        const currentIndex = images.indexOf(fullscreenImage);
        const nextIndex = (currentIndex + 1) % images.length;
        setFullscreenImage(images[nextIndex]);
    };

    const handleLightboxPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!fullscreenImage) return;
        setIs3DMode(false);
        const currentIndex = images.indexOf(fullscreenImage);
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setFullscreenImage(images[prevIndex]);
    };

    // frontCardSrc moved up

    return (
        <div className={styles.container} data-variant={materialVariant}>
            {/* Lightbox Overlay */}
            <AnimatePresence>
                {fullscreenImage && (
                    <motion.div
                        className={styles.lightboxOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setFullscreenImage(null); setIs3DMode(false); }}
                    >
                        <motion.button
                            className={styles.closeBtn}
                            whileHover={{ rotate: 90 }}
                            onClick={() => { setFullscreenImage(null); setIs3DMode(false); }}
                            title="Kapat"
                        >
                            ✕
                        </motion.button>

                        <motion.button
                            className={`${styles.toggle3dBtn} ${is3DMode ? styles.toggle3dBtnActive : ''}`}
                            onClick={(e) => { e.stopPropagation(); setIs3DMode(!is3DMode); }}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {is3DMode ? 'Görsele Dön' : '3D Materyali İncele'}
                        </motion.button>

                        <motion.button
                            className={`${styles.lightboxNavBtn} ${styles.prevBtn}`}
                            whileHover={{ scale: 1.1 }}
                            onClick={handleLightboxPrev}
                            title="Önceki"
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </motion.button>

                        <motion.button
                            className={`${styles.lightboxNavBtn} ${styles.nextBtn}`}
                            whileHover={{ scale: 1.1 }}
                            onClick={handleLightboxNext}
                            title="Sonraki"
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </motion.button>

                        {is3DMode ? (
                            <div className={styles.canvas3d} onClick={(e) => e.stopPropagation()}>
                                <Real3DViewer modelUrl={modelUrl} />
                            </div>
                        ) : (
                            <motion.img
                                key={fullscreenImage}
                                src={fullscreenImage}
                                className={styles.lightboxImage}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Stack */}
            <div className={styles.cardStack}>
                <div className={styles.controls}>
                    <button className={styles.arrowBtn} onClick={handlePrev}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button className={styles.arrowBtn} onClick={handleNext}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>

                <AnimatePresence mode='popLayout'>
                    {activeCards.map((card, index) => {
                        const isFront = index === activeCards.length - 1;
                        return (
                            <Card
                                key={card.id}
                                src={card.src}
                                index={index}
                                total={activeCards.length}
                                isFront={isFront}
                                magneticDragX={magneticDragX}
                                onRemove={(vel) => removeCard(card.id, vel)}
                                onRestore={() => restoreCard()}
                                onTap={() => isFront && setFullscreenImage(card.src)}
                                materialVariant={materialVariant}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className={styles.thumbnails} data-variant={materialVariant}>
                {images.map((img, i) => (
                    <div
                        key={i}
                        className={`${styles.thumb} ${frontCardSrc === img ? styles.activeThumb : ''}`}
                        onClick={() => handleThumbnailClick(img)}
                    >
                        <img src={img} alt={`Thumbnail ${i}`} className={styles.thumbImage} />
                    </div>
                ))}
            </div>

            <p className={styles.hint}>Kartları fırlatın veya incelemek için tıklayın</p>
        </div>
    );
};

// --- Sub-Components ---

interface CardProps {
    src: string;
    index: number;
    total: number;
    isFront: boolean;
    magneticDragX: any;
    onRemove: (velocity: number) => void;
    onRestore: () => void;
    onTap: () => void;
    materialVariant?: string;
}

const Card = ({ src, index, total, isFront, magneticDragX, onRemove, onRestore, onTap, materialVariant }: CardProps) => {
    const offset = total - 1 - index;
    const scale = 1 - offset * 0.02;

    const rotationValues = [0, -4, 4, -2, 2];
    const xValues = [0, -2, 2, -1, 1];
    const safeOffset = Math.min(offset, 4);
    const baseRotation = rotationValues[safeOffset];
    const baseX = xValues[safeOffset];
    const baseY = offset * 4;

    const x = useMotionValue(0);
    const rotateFront = useTransform(x, [-200, 200], [-5, 5]);

    const handleDrag = (_: any, info: PanInfo) => {
        if (isFront) {
            x.set(info.offset.x);
            magneticDragX.set(info.offset.x);
        }
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (isFront) {
            const threshold = 100;
            if (info.offset.x < -threshold) {
                onRemove(info.velocity.x);
            } else if (info.offset.x > threshold) {
                onRestore();
                x.set(0);
                magneticDragX.set(0);
            } else {
                x.set(0);
                magneticDragX.set(0);
            }
        }
    };

    return (
        <motion.div
            style={{
                zIndex: index,
                x: isFront ? x : baseX,
                y: baseY,
                rotate: isFront ? rotateFront : baseRotation,
                cursor: isFront ? 'zoom-in' : 'default',
            }}
            className={styles.card}
            data-variant={materialVariant}
            drag={isFront ? 'x' : false}
            dragConstraints={{ left: -1000, right: 1000 }}
            dragElastic={0.6}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onTap={() => isFront && onTap()}
            whileTap={{ cursor: 'grabbing' }}
            layout
            initial={{ scale: scale, opacity: 0, x: -1000, rotate: -25 }}
            animate={{
                scale: isFront ? 1 : scale,
                y: baseY,
                opacity: 1,
                x: isFront ? 0 : baseX,
                rotate: isFront ? 0 : baseRotation
            }}
            exit={{
                zIndex: 100,
                x: -4000,
                rotate: -25,
                opacity: 1,
                transition: { duration: 0.4, ease: "easeIn" }
            }}
            transition={{
                layout: { type: "spring", stiffness: 300, damping: 30 },
                default: { type: "spring", stiffness: 300, damping: 25 }
            }}
        >
            <img src={src} alt="Product" className={styles.image} draggable={false} />
            {isFront && <div className={styles.shineEffect} />}
            <div className={styles.sparkle} style={{ top: '20%', left: '20%', animationDelay: '0s' }} />
            <div className={styles.sparkle} style={{ top: '80%', left: '80%', animationDelay: '1s' }} />
            <div className={styles.sparkle} style={{ top: '30%', right: '15%', animationDelay: '2s' }} />
        </motion.div>
    );
};
