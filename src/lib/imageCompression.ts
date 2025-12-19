/**
 * Compress a Base64 image to fit within Firestore limits
 * @param base64String - Original Base64 string
 * @param maxSizeKB - Max size in KB (default 800KB to be safe under 1MB)
 * @returns Compressed Base64 string
 */
export const compressBase64Image = async (
    base64String: string,
    maxSizeKB: number = 800
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            // Calculate new dimensions (max 1200px width/height)
            let width = img.width;
            let height = img.height;
            const maxDimension = 1200;

            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = (height / width) * maxDimension;
                    width = maxDimension;
                } else {
                    width = (width / height) * maxDimension;
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Try different quality levels until size is acceptable
            let quality = 0.9;
            let compressed = canvas.toDataURL('image/jpeg', quality);

            while (compressed.length > maxSizeKB * 1024 && quality > 0.1) {
                quality -= 0.1;
                compressed = canvas.toDataURL('image/jpeg', quality);
            }

            console.log(`Image compressed: ${(base64String.length / 1024).toFixed(0)}KB -> ${(compressed.length / 1024).toFixed(0)}KB`);
            resolve(compressed);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = base64String;
    });
};

/**
 * Compress multiple Base64 images
 */
export const compressMultipleImages = async (
    base64Images: string[],
    maxSizeKB: number = 800
): Promise<string[]> => {
    const promises = base64Images.map(img => compressBase64Image(img, maxSizeKB));
    return Promise.all(promises);
};
