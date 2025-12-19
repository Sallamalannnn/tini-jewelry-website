import { useState, useEffect } from 'react';

interface DominantColorResult {
    bgColor: string;
    textColor: string;
}

// Simple hook to extract dominant color from an image URL using canvas
export function useDominantColor(imageUrl: string | null): DominantColorResult {
    const [result, setResult] = useState<DominantColorResult>({ bgColor: '#ffffff', textColor: '#1a1a1a' });

    useEffect(() => {
        if (!imageUrl) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Resize to specific size to sample pixels
            const size = 50;
            canvas.width = size;
            canvas.height = size;

            // Draw image
            ctx.drawImage(img, 0, 0, size, size);

            // Get pixel data
            const imageData = ctx.getImageData(0, 0, size, size).data;
            const colorScores: { [key: string]: number } = {};
            let maxScore = 0;
            let dominantColor = { r: 255, g: 255, b: 255 };

            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const a = imageData[i + 3];

                if (a < 128) continue;

                // Convert RGB to HSL (Calculated on the fly)
                const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
                const max = Math.max(rNorm, gNorm, bNorm);
                const min = Math.min(rNorm, gNorm, bNorm);
                const l = (max + min) / 2;

                // Ignore very bright (Whites) and very dark (Blacks)
                if (l > 0.90 || l < 0.10) continue;

                let s = 0;
                if (max !== min) {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                }

                // Ignore low saturation (Grays, Beiges, washed out colors)
                // Threshold 0.15 filters out subtle neutrals
                if (s < 0.15) continue;

                // Quantize colors to group similar shades
                const step = 20;
                const roundedR = Math.floor(r / step) * step;
                const roundedG = Math.floor(g / step) * step;
                const roundedB = Math.floor(b / step) * step;

                const key = `${roundedR},${roundedG},${roundedB}`;

                // Weight the score by Saturation^2 to strongly favor vibrant colors
                const weight = s * s;
                colorScores[key] = (colorScores[key] || 0) + weight;

                if (colorScores[key] > maxScore) {
                    maxScore = colorScores[key];
                    dominantColor = { r: roundedR, g: roundedG, b: roundedB };
                }
            }

            // Fallback if no vibrant color found (e.g. B&W image)
            if (maxScore === 0) {
                dominantColor = { r: 245, g: 245, b: 245 };
            }

            const { r, g, b } = dominantColor;

            // Mix with 20% white for background
            const mix = 0.2;
            const softR = Math.round(r + (255 - r) * mix);
            const softG = Math.round(g + (255 - g) * mix);
            const softB = Math.round(b + (255 - b) * mix);

            // Calculate Luminance (Perceived Brightness) of the final background
            // Formula: 0.299*R + 0.587*G + 0.114*B
            const luminance = (0.299 * softR + 0.587 * softG + 0.114 * softB);

            // Determine text color based on background brightness
            // Threshold 128 is standard, but 140 is safer for readability
            const newTextColor = luminance > 140 ? '#1a1a1a' : '#ffffff';

            setResult({
                bgColor: `rgb(${softR}, ${softG}, ${softB})`,
                textColor: newTextColor
            });
        };

        img.onerror = () => {
            setResult({ bgColor: '#ffffff', textColor: '#1a1a1a' });
        }
    }, [imageUrl]);

    return result;
}
