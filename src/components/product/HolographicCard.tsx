import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef, useState } from "react";
import styles from "./ProductCardStack.module.css";

interface HolographicCardProps {
    src: string;
}

export const HolographicCard = ({ src }: HolographicCardProps) => {
    const ref = useRef<HTMLDivElement>(null);

    // Mouse position relative to center of card
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth physics for rotation
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    // Map mouse position to rotation (Max 25 degrees tilt)
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["25deg", "-25deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-25deg", "25deg"]);

    // Map sheen opacity and position
    const sheenOpacity = useTransform(mouseYSpring, [-0.5, 0.5], [0.3, 0.6]);
    const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
    const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate percentage from center (-0.5 to 0.5)
        const xPct = (mouseX / width) - 0.5;
        const yPct = (mouseY / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div className={styles.canvas3d}>
            <motion.div
                ref={ref}
                className={styles.card3d}
                style={{
                    rotateX,
                    rotateY,
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Product Image */}
                <img
                    src={src}
                    alt="3D View"
                    className={styles.card3dImage}
                    draggable={false}
                />

                {/* Specular Sheen Layer */}
                <motion.div
                    className={styles.specularSheen}
                    style={{
                        opacity: sheenOpacity,
                        backgroundPosition: `${sheenX}% ${sheenY}%` // Naive shim, really needs gradient movement
                        // For linear gradient, we can just move the opacity or rotate the gradient.
                        // Better approach:
                        // The CSS defines a linear gradient. We can rotate the div or just let opacity handle the "glint".
                    }}
                />
            </motion.div>
        </div>
    );
};
