'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GoldenRoseVine } from './GoldenRoseVine';
import styles from './InteractiveShowcase.module.css';

interface InteractiveShowcaseProps {
    images: string[];
    name: string;
    texts?: { title: string; description: string }[];
    materialVariant?: string;
}

interface ShowcaseSectionProps {
    image: string;
    index: number;
    title?: string;
    description?: string;
    materialVariant?: string;
}

const ShowcaseSection = ({ image, index, title, description, materialVariant = 'sarı' }: ShowcaseSectionProps) => {
    const isEven = index % 2 === 0;
    const colorKey = (materialVariant || 'sarı').toLowerCase();

    const defaultTitle = index === 0 ? "ZARAFETİN\nTINISINI KEŞFET" :
        index === 1 ? "USTALIKLA\nİŞLENMİŞ DETAYLAR" :
            "SİZE ÖZEL\nBİR DENEYİM";

    const defaultDesc = "Tini Jewelry koleksiyonu ile tarzınızı yansıtın. Her parça, benzersiz bir hikaye anlatır ve ışığınızı ortaya çıkarır.";

    return (
        <motion.div
            className={styles.section}
            data-align={isEven ? "left" : "right"}
            data-material={colorKey}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 0.8 }}
        >
            {/* Background Image Layer (Absolute) */}
            <div className={`${styles.bgContainer} ${styles[colorKey] || styles.sarı}`}>

                <motion.img
                    src={image}
                    alt={`Showcase ${index}`}
                    className={styles.bgImage}
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                />
                <div className={styles.overlayGradient} />
            </div>

            {/* Text Overlay Layer (Relative, Z-Index 10) */}
            <div className={`${styles.contentOverlay} ${isEven ? styles.alignLeft : styles.alignRight}`}>

                <motion.h3
                    className={styles.sectionTitle}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    {title || defaultTitle}
                </motion.h3>

                <motion.p
                    className={styles.sectionDesc}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {description || defaultDesc}
                </motion.p>
            </div>
        </motion.div>
    );
};

export const InteractiveShowcase = ({ images, name, texts, materialVariant = 'gold' }: InteractiveShowcaseProps) => {
    // If no images, don't render
    if (!images || images.length === 0) return null;

    return (
        <section className={styles.container} data-material={(materialVariant || 'sarı').toLowerCase()}>
            <div className={styles.header}>
                <h2 className={styles.mainTitle}>DETAYLARI<br /><span>KEŞFET</span></h2>
            </div>

            <div className={styles.list}>
                <GoldenRoseVine variant={materialVariant} />
                {images.map((img, idx) => (
                    <ShowcaseSection
                        key={idx}
                        image={img}
                        index={idx}
                        title={texts?.[idx]?.title}
                        description={texts?.[idx]?.description}
                        materialVariant={materialVariant}
                    />
                ))}
            </div>
        </section>
    );
};
