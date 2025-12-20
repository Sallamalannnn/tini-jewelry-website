'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    User,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    userData: any | null;
    loading: boolean;
    userDataLoading: boolean;
    logout: () => Promise<void>;
    updateUserProfile: (data: any) => Promise<void>;
    addAddress: (address: any) => Promise<void>;
    updateAddress: (id: string, address: any) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    userDataLoading: true,
    logout: async () => { },
    updateUserProfile: async () => { },
    addAddress: async () => { },
    updateAddress: async () => { },
    deleteAddress: async () => { },
});

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [userDataLoading, setUserDataLoading] = useState(true);

    useEffect(() => {
        let unsubscribeUserData: (() => void) | undefined;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Listen to personal data from Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                unsubscribeUserData = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        setUserData({ addresses: [] });
                    }
                    setUserDataLoading(false);
                });
            } else {
                setUserData(null);
                setUserDataLoading(false);
                if (unsubscribeUserData) unsubscribeUserData();
            }

            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUserData) unsubscribeUserData();
        };
    }, []);

    const updateUserProfile = async (data: any) => {
        if (!user) return;
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { ...data, updatedAt: new Date() }, { merge: true });
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    const addAddress = async (address: any) => {
        if (!user) return;
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const currentAddresses = userData?.addresses || [];
            const newAddress = { ...address, id: Date.now().toString() };
            await setDoc(userDocRef, {
                addresses: [...currentAddresses, newAddress],
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Add address error:', error);
            throw error;
        }
    };

    const updateAddress = async (id: string, address: any) => {
        if (!user) return;
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const currentAddresses = userData?.addresses || [];
            const updatedAddresses = currentAddresses.map((addr: any) =>
                addr.id === id ? { ...address, id } : addr
            );
            await setDoc(userDocRef, {
                addresses: updatedAddresses,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Update address error:', error);
            throw error;
        }
    };

    const deleteAddress = async (id: string) => {
        if (!user) return;
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const currentAddresses = userData?.addresses || [];
            const updatedAddresses = currentAddresses.filter((addr: any) => addr.id !== id);
            await setDoc(userDocRef, {
                addresses: updatedAddresses,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Delete address error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            userDataLoading,
            logout,
            updateUserProfile,
            addAddress,
            updateAddress,
            deleteAddress
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
