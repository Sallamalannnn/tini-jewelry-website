import { db } from './firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    orderBy,
    Timestamp,
    getDoc
} from 'firebase/firestore';

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Order {
    id: string; // Firestore Doc ID or Custom ID
    userId: string;
    date: Date; // Converted from Timestamp
    total: number;
    status: 'Hazırlanıyor' | 'Kargoda' | 'Teslim Edildi' | 'İptal Edildi' | 'İade Talebi';
    items: OrderItem[];
    shippingCode?: string;
    shippingAddress: {
        title: string;
        address: string;
        city: string;
        zip: string;
    };
    paymentId?: string; // Shopier Order ID
}

const ORDERS_COLLECTION = 'orders';

// Get Orders for a specific User
export const getUserOrders = async (userId: string): Promise<Order[]> => {
    try {
        const q = query(
            collection(db, ORDERS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.createdAt as Timestamp).toDate(),
            } as Order;
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }
};

// Create a new Order
export const createOrder = async (orderData: Omit<Order, 'id' | 'date'> & { userId: string }) => {
    try {
        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
            ...orderData,
            createdAt: Timestamp.now(),
            status: 'Hazırlanıyor' // Default status
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

// Update Order Shipping Code (Simulating what the webhook would do)
export const updateOrderShippingCode = async (orderId: string, shippingCode: string) => {
    try {
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(orderRef, {
            shippingCode: shippingCode,
            status: 'Kargoda'
        });
        return true;
    } catch (error) {
        console.error('Error updating shipping code:', error);
        return false;
    }
};

// Check if an order exists and belongs to the user (for security/validation in returns)
export const verifyOrderOwner = async (orderId: string, userId: string): Promise<boolean> => {
    try {
        const orderRef = doc(db, ORDERS_COLLECTION, orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists() && orderSnap.data().userId === userId) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};
