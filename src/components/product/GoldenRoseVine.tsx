'use client';

import { motion } from 'framer-motion';

interface GoldenRoseVineProps {
    variant?: string; // 'sarı', 'beyaz', 'pembe', 'siyah'
}

const DetailedRose = ({ color, gradientId }: { color: string, gradientId: string }) => (
    <g>
        {/* Outer Petals - More pointed/angled */}
        <path d="M0,-12 L-10,-2 C-18,5 -10,18 0,18 C10,18 18,5 10,-2 Z" fill={`url(#${gradientId})`} />
        <path d="M0,-12 L-10,-2 C-18,5 -10,18 0,18 C10,18 18,5 10,-2 Z" fill={`url(#${gradientId})`} transform="rotate(72)" />
        <path d="M0,-12 L-10,-2 C-18,5 -10,18 0,18 C10,18 18,5 10,-2 Z" fill={`url(#${gradientId})`} transform="rotate(144)" />
        <path d="M0,-12 L-10,-2 C-18,5 -10,18 0,18 C10,18 18,5 10,-2 Z" fill={`url(#${gradientId})`} transform="rotate(216)" />
        <path d="M0,-12 L-10,-2 C-18,5 -10,18 0,18 C10,18 18,5 10,-2 Z" fill={`url(#${gradientId})`} transform="rotate(288)" />

        {/* Middle Petals - Sharp edges */}
        <path d="M0,-7 L-6,0 C-10,5 -5,10 0,10 C5,10 10,5 6,0 Z" fill="#fff" opacity="0.25" />
        <path d="M0,-7 L-6,0 C-10,5 -5,10 0,10 C5,10 10,5 6,0 Z" fill="#fff" opacity="0.25" transform="rotate(120)" />
        <path d="M0,-7 L-6,0 C-10,5 -5,10 0,10 C5,10 10,5 6,0 Z" fill="#fff" opacity="0.25" transform="rotate(240)" />

        {/* Center Bud - More defined */}
        <path d="M-3,-3 L0,-6 L3,-3 L0,3 Z" fill={`url(#${gradientId})`} stroke="#fff" strokeWidth="0.5" />
        <path d="M-2,-2 L0,-4 L2,-2" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.8" />
    </g>
);

export const GoldenRoseVine = ({ variant = 'sarı' }: GoldenRoseVineProps) => {
    const isSilver = variant === 'beyaz';
    const isRose = variant === 'pembe';
    const isBlack = variant === 'siyah';
    const isRed = variant === 'kırmızı';

    // Define gradients based on variant
    const getGradientColors = () => {
        if (isSilver) return { stop1: '#757575', stop2: '#e0e0e0', stop3: '#ffffff' };
        if (isRose) return { stop1: '#b76e79', stop2: '#e0bfb8', stop3: '#ffffff' };
        if (isBlack) return { stop1: '#000000', stop2: '#434343', stop3: '#666666' };
        if (isRed) return { stop1: '#440000', stop2: '#880808', stop3: '#FF0000' };
        return { stop1: '#996515', stop2: '#D4AF37', stop3: '#fcf6ba' }; // Default Gold
    };

    const colors = getGradientColors();
    const gradientId = `vineGradient-${variant}`;

    return (
        <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '160px',
            transform: 'translateX(-50%)',
            zIndex: 1,
            pointerEvents: 'none',
            opacity: 0.8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden'
        }}>
            {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} style={{ width: '100%', height: '1000px', flexShrink: 0 }}>
                    <svg viewBox="0 0 100 1000" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.stop1} />
                                <stop offset="50%" stopColor={colors.stop2} />
                                <stop offset="100%" stopColor={colors.stop3} />
                            </linearGradient>
                        </defs>

                        {/* Thicker, sharper Stem */}
                        <path
                            d="M50,0 C85,200 15,300 50,500 C85,700 15,800 50,1000"
                            stroke={`url(#${gradientId})`}
                            strokeWidth="4"
                            strokeLinecap="round"
                        />

                        {/* Roses with pointed petals */}
                        <g transform="translate(50, 200) scale(2)">
                            <DetailedRose color={colors.stop2} gradientId={gradientId} />
                        </g>

                        {/* Pointed Leaves */}
                        <path d="M50,300 L85,280 L70,330 L50,300" fill={`url(#${gradientId})`} opacity="0.8" />
                        <path d="M50,350 L15,330 L35,380 L50,350" fill={`url(#${gradientId})`} opacity="0.6" />

                        <g transform="translate(55, 550) scale(1.8) rotate(30)">
                            <DetailedRose color={colors.stop2} gradientId={gradientId} />
                        </g>

                        {/* More Pointed Leaves */}
                        <path d="M50,650 L90,620 L75,690 L50,650" fill={`url(#${gradientId})`} opacity="0.8" />

                        <g transform="translate(45, 850) scale(2) rotate(-20)">
                            <DetailedRose color={colors.stop2} gradientId={gradientId} />
                        </g>
                    </svg>
                </div>
            ))}
        </div>
    );
};
