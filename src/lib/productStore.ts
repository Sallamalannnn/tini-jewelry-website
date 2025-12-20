import { PRODUCTS } from './constants';
import {
    firestoreGetProducts,
    firestoreAddProduct,
    firestoreUpdateProduct,
    firestoreDeleteProduct
} from './firestore';
import { compressBase64Image, compressMultipleImages } from './imageCompression';

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    images?: string[];
    model3d?: string;
    description?: string;
    showcaseText?: { title: string; description: string }[];
    showcaseImages?: string[];
    color?: string;
    material?: string;
    stock?: number;
    costPrice?: number; // Geliş Fiyatı (Maliyet)
    createdAt?: any; // Firebase Timestamp or string
}

// Get all products (Firestore + Constants fallback)
export const getProducts = async (): Promise<Product[]> => {
    if (typeof window === 'undefined') return PRODUCTS;

    try {
        const firestoreProducts = await firestoreGetProducts();
        const productMap = new Map<string, Product>();

        PRODUCTS.forEach(p => productMap.set(p.id, p));
        firestoreProducts.forEach(p => productMap.set(p.id, p));

        const allProducts = Array.from(productMap.values());
        console.log(`ProductStore: Loaded ${allProducts.length} products (${firestoreProducts.length} from Firestore).`);

        return allProducts.reverse();
    } catch (e) {
        console.error('Failed to fetch products from Firestore', e);
        return PRODUCTS;
    }
};

// Get New Arrivals (Added in last 3 months)
export const getNewArrivals = async (): Promise<Product[]> => {
    const allProducts = await getProducts();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return allProducts.filter(product => {
        if (!product.createdAt) return true; // Keep old static products for now or filter them out? 
        // User said "ilk defa eklenenler" (newly added ones), so let's check date.

        let date: Date;
        if (product.createdAt.toDate) {
            date = product.createdAt.toDate();
        } else {
            date = new Date(product.createdAt);
        }

        return date >= threeMonthsAgo;
    });
};

// Add new product with image compression
export const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
        console.log('ProductStore: Compressing images...');

        const isBase64 = (str: string) => str.startsWith('data:');

        // Compress main image
        let mainImage = product.image;
        if (isBase64(product.image)) {
            mainImage = await compressBase64Image(product.image, 400);
        }

        // Compress gallery images
        let images = product.images;
        if (product.images?.length) {
            const base64Images = product.images.filter(isBase64);
            if (base64Images.length) {
                const compressed = await compressMultipleImages(base64Images, 300);
                let idx = 0;
                images = product.images.map(img => isBase64(img) ? compressed[idx++] : img);
            }
        }

        // Compress showcase images
        let showcaseImages = product.showcaseImages;
        if (product.showcaseImages?.length) {
            const base64Images = product.showcaseImages.filter(isBase64);
            if (base64Images.length) {
                const compressed = await compressMultipleImages(base64Images, 300);
                let idx = 0;
                showcaseImages = product.showcaseImages.map(img => isBase64(img) ? compressed[idx++] : img);
            }
        }

        const productCompressed = {
            ...product,
            image: mainImage,
            images,
            showcaseImages
        };

        console.log('ProductStore: Saving to Firestore...');
        return await firestoreAddProduct(productCompressed);
    } catch (error) {
        console.error('ProductStore: Failed to add product', error);
        throw error;
    }
};

// Update existing product with image compression
export const updateProduct = async (product: Product) => {
    try {
        console.log('ProductStore: Compressing images for update...');

        const isBase64 = (str: string) => str && str.startsWith('data:');

        // Compress main image
        let mainImage = product.image;
        if (isBase64(product.image)) {
            mainImage = await compressBase64Image(product.image, 400);
        }

        // Compress gallery images
        let images = product.images;
        if (product.images?.length) {
            const base64Images = product.images.filter(isBase64);
            if (base64Images.length) {
                const compressed = await compressMultipleImages(base64Images, 300);
                let idx = 0;
                images = product.images.map(img => isBase64(img) ? compressed[idx++] : img);
            }
        }

        // Compress showcase images
        let showcaseImages = product.showcaseImages;
        if (product.showcaseImages?.length) {
            const base64Images = product.showcaseImages.filter(isBase64);
            if (base64Images.length) {
                const compressed = await compressMultipleImages(base64Images, 300);
                let idx = 0;
                showcaseImages = product.showcaseImages.map(img => isBase64(img) ? compressed[idx++] : img);
            }
        }

        const productCompressed = {
            ...product,
            image: mainImage,
            images,
            showcaseImages
        };

        const { id, ...productData } = productCompressed;
        await firestoreUpdateProduct(id, productData);
        return productCompressed;
    } catch (error) {
        console.error('ProductStore: Failed to update product', error);
        throw error;
    }
};

// Delete product
export const deleteProduct = async (id: string) => {
    await firestoreDeleteProduct(id);
};

// Search products by name, category, or description
// Helper to normalize strings for search (Turkish char support)
const normalizeForSearch = (text: string) => {
    return text.toLocaleLowerCase('tr-TR')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/i̇/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
};

// Basic Synonym/Root Map for "Smart" Search without AI
const SEARCH_SYNONYMS: Record<string, string[]> = {
    'zarafet': ['zarif', 'ince', 'kibar', 'zerafet'], // 'zerafet' is common typo
    'zerafet': ['zarif', 'zarafet'],
    'zarif': ['zarafet', 'ince', 'kibar'],
    'sik': ['siklik', 'guzel', 'modern', 'moda', 'trend'], // normalized 'şık'
    'siklik': ['sik', 'guzel'],
    'altin': ['gold', 'sari', '14k', '22k'],
    'gold': ['altin', 'sari'],
    'gumus': ['silver', 'gri', 'beyaz', '925'],
    'silver': ['gumus'],
    'kolye': ['zincir', 'gerdanlik', 'ucu'],
    'gerdanlik': ['kolye'],
    'takim': ['set'],
    'set': ['takim'],
    'hediye': ['armagan', 'ozel'],
    'tas': ['pirlanta', 'zirkon', 'swarovski'],
    'dogal': ['naturel', 'gercek']
};

// Search products by name, category, or description with fuzzy scoring and synonym expansion
export const searchProducts = async (query: string): Promise<Product[]> => {
    if (!query || query.trim().length < 2) return [];

    const allProducts = await getProducts();
    const normalizedQuery = normalizeForSearch(query.trim());
    const initialTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

    // Expand search tokens with synonyms
    const searchTokens = new Set<string>(initialTokens);
    initialTokens.forEach(token => {
        const synonyms = SEARCH_SYNONYMS[token];
        if (synonyms) {
            synonyms.forEach(syn => searchTokens.add(syn));
        }
    });

    const scoredProducts = allProducts.map(product => {
        let score = 0;
        const pName = normalizeForSearch(product.name || '');
        const pCategory = normalizeForSearch(product.category || '');
        const pColor = normalizeForSearch(product.color || '');
        const pMaterial = normalizeForSearch(product.material || '');

        // Check for exact phrase match (highest bonus)
        if (pName.includes(normalizedQuery)) score += 20;
        if (pCategory.includes(normalizedQuery)) score += 15;

        // Check each expanded token
        searchTokens.forEach(token => {
            let tokenScore = 0;
            if (pName.includes(token)) tokenScore += 5;
            if (pCategory.includes(token)) tokenScore += 4;
            if (pColor.includes(token)) tokenScore += 3;
            if (pMaterial.includes(token)) tokenScore += 3;

            // Reduce score slightly if it matched via a synonym (original tokens present in query)
            if (!initialTokens.includes(token)) {
                tokenScore = Math.ceil(tokenScore * 0.7); // 70% weight for synonyms
            }

            score += tokenScore;
        });

        return { product, score };
    });

    // Filter out non-matching products and sort by score (descending)
    return scoredProducts
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
};

