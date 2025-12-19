'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { firestoreGetUsers } from '@/lib/firestore';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await firestoreGetUsers();
            setUsers(data);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        // Handle Firebase Timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h1 className={styles.title}>Kullanıcı Yönetimi</h1>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    Toplam {users.length} kayıtlı üye
                </div>
            </div>

            <div style={{
                backgroundColor: '#fff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ padding: '15px' }}>Ad Soyad</th>
                            <th style={{ padding: '15px' }}>E-posta</th>
                            <th style={{ padding: '15px' }}>Kayıt Tarihi</th>
                            <th style={{ padding: '15px' }}>Rol</th>
                            <th style={{ padding: '15px' }}>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{user.displayName || `${user.firstName} ${user.lastName}`}</td>
                                <td style={{ padding: '15px' }}>{user.email}</td>
                                <td style={{ padding: '15px', color: 'var(--color-text-muted)' }}>{formatDate(user.createdAt)}</td>
                                <td style={{ padding: '15px' }}>{user.role === 'admin' ? 'Yönetici' : 'Müşteri'}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        backgroundColor: '#e8f5e9',
                                        color: '#2e7d32'
                                    }}>
                                        Aktif
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
