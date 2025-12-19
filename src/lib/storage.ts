import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a Base64 image to Firebase Storage
 * @param base64String - Data URL (data:image/png;base64,...)
 * @param path - Storage path (e.g., "products/123.png")
 * @returns Download URL
 */
export const uploadBase64Image = async (base64String: string, path: string): Promise<string> => {
    try {
        console.log(`Storage: Uploading to ${path}...`);
        const storageRef = ref(storage, path);

        // Upload base64 string
        const snapshot = await uploadString(storageRef, base64String, 'data_url');

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Storage: Upload successful!', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error('Storage: Upload failed', error);
        throw error;
    }
};

/**
 * Upload multiple images and return their URLs
 */
export const uploadMultipleImages = async (
    base64Images: string[],
    basePath: string
): Promise<string[]> => {
    const uploadPromises = base64Images.map((base64, index) => {
        const extension = base64.split(';')[0].split('/')[1] || 'png';
        const path = `${basePath}/${Date.now()}_${index}.${extension}`;
        return uploadBase64Image(base64, path);
    });

    return Promise.all(uploadPromises);
};
