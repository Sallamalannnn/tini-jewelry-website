import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from './productStore';

const COLLECTION_NAME = 'products';

// Helper: Remove undefined values (Firestore doesn't accept them)
const removeUndefined = (obj: any): any => {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
            cleaned[key] = obj[key];
        }
    });
    return cleaned;
};


// Get all products from Firestore
export const firestoreGetProducts = async (): Promise<Product[]> => {
    try {
        console.log('Firestore: Fetching all products...');
        const productsRef = collection(db, COLLECTION_NAME);
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data()
            } as Product);
        });

        console.log(`Firestore: Loaded ${products.length} products`);
        return products;
    } catch (error) {
        console.error('Firestore: Failed to fetch products', error);
        return [];
    }
};

// Get single product by ID
export const firestoreGetProduct = async (id: string): Promise<Product | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Product;
        }
        return null;
    } catch (error) {
        console.error('Firestore: Failed to fetch product', error);
        return null;
    }
};

// Add new product
export const firestoreAddProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
        console.log('Firestore: Adding product:', product.name);
        const productsRef = collection(db, COLLECTION_NAME);

        // Remove undefined values before saving
        const cleanProduct = removeUndefined({
            ...product,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        const docRef = await addDoc(productsRef, cleanProduct);

        console.log('Firestore: Product added with ID:', docRef.id);
        return {
            id: docRef.id,
            ...product
        };
    } catch (error) {
        console.error('Firestore: Failed to add product', error);
        throw error;
    }
};

// Update existing product
export const firestoreUpdateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
    try {
        console.log('Firestore: Updating product:', id);
        const docRef = doc(db, COLLECTION_NAME, id);

        // Remove undefined values before updating
        const cleanProduct = removeUndefined({
            ...product,
            updatedAt: Timestamp.now()
        });
        await setDoc(docRef, cleanProduct, { merge: true });
        console.log('Firestore: Product updated/upserted successfully');
    } catch (error) {
        console.error('Firestore: Failed to update product', error);
        throw error;
    }
};

// Delete product
export const firestoreDeleteProduct = async (id: string): Promise<void> => {
    try {
        console.log('Firestore: Deleting product:', id);
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
        console.log('Firestore: Product deleted successfully');
    } catch (error) {
        console.error('Firestore: Failed to delete product', error);
        throw error;
    }
};

// Add stock notification request
export const firestoreAddStockNotification = async (email: string, productId: string, productName: string): Promise<void> => {
    try {
        console.log('Firestore: Adding stock notification request for:', email);
        const notificationsRef = collection(db, 'stock_notifications');

        await addDoc(notificationsRef, {
            email,
            productId,
            productName,
            createdAt: Timestamp.now(),
            notified: false
        });

        console.log('Firestore: Stock notification request added successfully');
    } catch (error) {
        console.error('Firestore: Failed to add stock notification request', error);
        throw error;
    }
};

// Create User in Firestore
export const firestoreCreateUser = async (uid: string, email: string, name: string, surname: string): Promise<void> => {
    try {
        console.log('Firestore: Creating user document:', uid);
        const userRef = doc(db, 'users', uid);

        await setDoc(userRef, {
            email,
            displayName: `${name} ${surname}`,
            firstName: name,
            lastName: surname,
            role: 'customer',
            createdAt: Timestamp.now()
        }, { merge: true });

        console.log('Firestore: User document created successfully');
    } catch (error) {
        console.error('Firestore: Failed to create user document', error);
        throw error;
    }
};

// Get all users
export const firestoreGetUsers = async (): Promise<any[]> => {
    try {
        console.log('Firestore: Fetching all users...');
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const users: any[] = [];
        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`Firestore: Loaded ${users.length} users`);
        return users;
    } catch (error) {
        console.error('Firestore: Failed to fetch users', error);
        return [];
    }
};

