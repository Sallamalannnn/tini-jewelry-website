'use client';

import { useState, useEffect } from 'react';
import { Eye, CheckCircle, Clock, Truck, X, FileText, Download, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BlockchainCertificate } from '@/components/order/BlockchainCertificate';
import styles from '../page.module.css';

// Mock Orders Data
const MOCK_ORDERS = [
    {
        id: 'SIP-2023-001',
        customer: 'Mehmet Yılmaz',
        email: 'mehmet@example.com',
        date: '18 Ara 2023',
        total: 12500,
        status: 'Teslim Edildi',
        payment: 'Ödendi',
        address: 'Atatürk Cad. No:123, Çankaya, Ankara',
        items: [
            { name: 'Altın Minimalist Kolye', qty: 1, price: 8500 },
            { name: 'İnci Damla Küpe', qty: 1, price: 4000 }
        ]
    },
    {
        id: 'SIP-2023-002',
        customer: 'Ayşe Demir',
        email: 'ayse@example.com',
        date: '18 Ara 2023',
        total: 4200,
        status: 'Kargoda',
        payment: 'Ödendi',
        address: 'Levent Mah. Sedir Sok. No:5, Beşiktaş, İstanbul',
        items: [
            { name: 'Gümüş İstiridye Küpe', qty: 1, price: 4200 }
        ]
    },
    {
        id: 'SIP-2023-003',
        customer: 'Can Özkan',
        email: 'can@example.com',
        date: '17 Ara 2023',
        total: 8500,
        status: 'Hazırlanıyor',
        payment: 'Bekliyor',
        address: 'Mavişehir Sitesi B-Blok D:12, Karşıyaka, İzmir',
        items: [
            { name: 'Sarmal Altın Bileklik', qty: 1, price: 8500 }
        ]
    }
];

export default function OrdersPage() {
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tümü');

    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

    // Load saved data from localStorage on mount
    useEffect(() => {
        const savedOrders = localStorage.getItem('tini_admin_orders');
        if (savedOrders) {
            setOrders(JSON.parse(savedOrders));
        }
    }, []);

    const saveOrders = (updatedOrders: any[]) => {
        setOrders(updatedOrders);
        localStorage.setItem('tini_admin_orders', JSON.stringify(updatedOrders));
    };

    const handleStatusChange = (orderId: string, newStatus: string) => {
        const updatedOrders = orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        );
        saveOrders(updatedOrders);
    };

    const handleBulkStatusChange = (newStatus: string) => {
        if (selectedOrderIds.length === 0) return;
        const updatedOrders = orders.map(order =>
            selectedOrderIds.includes(order.id) ? { ...order, status: newStatus } : order
        );
        saveOrders(updatedOrders);
        setSelectedOrderIds([]);
        alert(`${selectedOrderIds.length} sipariş durumu '${newStatus}' olarak güncellendi.`);
    };

    const handleUpdateExtra = (trackingNo: string, carrier: string, notes: string) => {
        if (!selectedOrder) return;
        const updatedOrders = orders.map(o =>
            o.id === selectedOrder.id ? { ...o, trackingNo, carrier, adminNotes: notes } : o
        );
        saveOrders(updatedOrders);
        setSelectedOrder(updatedOrders.find(o => o.id === selectedOrder.id));
        alert('Sipariş bilgileri güncellendi.');
    };

    const handleExportCSV = () => {
        const targets = selectedOrderIds.length > 0
            ? orders.filter(o => selectedOrderIds.includes(o.id))
            : orders;

        const header = "Sipariş No,Müşteri,E-posta,Tarih,Tutar,Durum,Ödeme\n";
        const rows = targets.map(o =>
            `${o.id},${o.customer},${o.email},${o.date},${o.total},${o.status},${o.payment}`
        ).join("\n");

        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `tini_siparisler_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(o => o.id));
        }
    };

    const toggleSelectOrder = (id: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Teslim Edildi': return '#2e7d32';
            case 'Kargoda': return '#0277bd';
            case 'Hazırlanıyor': return '#fbc02d';
            case 'İptal Edildi': return '#d32f2f';
            default: return 'var(--color-text-muted)';
        }
    };

    const handlePrintInvoice = (order: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>Fatura - ${order.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.5; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo { font-size: 24px; font-weight: bold; color: #b8860b; }
                        .info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .info h3 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 8px; margin-top: 0; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #666; font-size: 13px; }
                        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                        .total-box { margin-left: auto; width: 250px; }
                        .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
                        .grand-total { border-top: 2px solid #eee; margin-top: 10px; padding-top: 10px; font-size: 18px; font-weight: bold; }
                        .footer { margin-top: 50px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">TINI JEWELRY</div>
                        <div style="text-align: right">
                            <h1 style="margin:0; font-size: 20px;">E-ARŞİV FATURA</h1>
                            <p style="margin:5px 0 0; color:#666;">No: ${order.id.replace('SIP', 'INV')}</p>
                        </div>
                    </div>
                    
                    <div class="info">
                        <div>
                            <h3>FATURA BİLGİLERİ</h3>
                            <p><strong>Düzenleme Tarihi:</strong> ${order.date}</p>
                            <p><strong>Ödeme Tipi:</strong> Kredi Kartı</p>
                            <p><strong>Ödeme Durumu:</strong> ${order.payment}</p>
                        </div>
                        <div>
                            <h3>MÜŞTERİ BİLGİLERİ</h3>
                            <p><strong>${order.customer}</strong></p>
                            <p>${order.address}</p>
                            <p>${order.email}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Ürün Adı</th>
                                <th>Adet</th>
                                <th>Birim Fiyat</th>
                                <th style="text-align:right">Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map((item: any) => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.qty}</td>
                                    <td>${item.price.toLocaleString('tr-TR')} ₺</td>
                                    <td style="text-align:right">${(item.price * item.qty).toLocaleString('tr-TR')} ₺</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-box">
                        <div class="total-row">
                            <span>Ara Toplam</span>
                            <span>${order.total.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div class="total-row">
                            <span>KDV (%20)</span>
                            <span>Dahil</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>GENEL TOPLAM</span>
                            <span>${order.total.toLocaleString('tr-TR')} ₺</span>
                        </div>
                    </div>

                    <div class="footer">
                        Bu belge 213 sayılı V.U.K. hükümlerine göre elektronik ortamda oluşturulmuştur. <br>
                        Tını Jewelry - www.tinijewelry.com
                    </div>

                    <script>
                        window.onload = () => {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handlePrintLabel = (order: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>Kargo Etiketi - ${order.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; display: flex; justify-content: center; }
                        .label { width: 100mm; height: 150mm; border: 2px solid #000; padding: 10mm; box-sizing: border-box; position: relative; }
                        .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 5mm; margin-bottom: 5mm; }
                        .barcode { height: 25mm; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px); margin: 5mm 0; width: 100%; }
                        .section { border-bottom: 1px solid #ccc; padding: 4mm 0; }
                        .title { font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 2mm; }
                        .content { font-size: 16px; font-weight: bold; line-height: 1.4; }
                        .courier-logo { font-size: 28px; font-weight: 900; border: 4px solid #000; padding: 5px 20px; text-align: center; margin-top: 10mm; display: inline-block; }
                        @media print { body { padding: 0; } .label { border-width: 1px; } }
                    </style>
                </head>
                <body>
                    <div class="label">
                        <div class="header-row">
                            <div style="font-weight: 900; font-size: 20px;">TINI JEWELRY</div>
                            <div style="font-size: 12px;">${order.date}</div>
                        </div>
                        
                        <div class="barcode"></div>
                        <div style="text-align: center; font-size: 14px; margin-bottom: 5mm; font-weight: bold;">* ${order.id} *</div>

                        <div class="section">
                            <div class="title">GÖNDERİCİ</div>
                            <div class="content" style="font-size: 12px;">TINI JEWELRY LTD. ŞTİ.<br>Merkez Mah. No:1, Takı Sokak<br>İstanbul, TR</div>
                        </div>

                        <div class="section">
                            <div class="title">ALICI (DELIVERY TO)</div>
                            <div class="content">
                                ${order.customer.toUpperCase()}<br>
                                <span style="font-weight: normal; font-size: 14px;">
                                    ${order.address}
                                </span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="title">İLETIŞİM</div>
                            <div class="content" style="font-size: 14px;">${order.email}</div>
                        </div>

                        <div style="text-align: center;">
                            <div class="courier-logo">YURTİÇİ KARGO</div>
                        </div>

                        <div style="position: absolute; bottom: 10mm; left: 10mm; right: 10mm; font-size: 9px; color: #666; text-align: center; border-top: 1px solid #eee; pt: 2mm;">
                            BU BİR OTOMATİK OLUŞTURULMUŞ KARGO ETİKETİDİR.
                        </div>
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const openDetails = (order: any) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'Tümü' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Statistics Calculation
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const activeOrders = orders.filter(o => o.status === 'Hazırlanıyor' || o.status === 'Kargoda').length;
    const completedOrders = orders.filter(o => o.status === 'Teslim Edildi').length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 className={styles.title}>Sipariş Yönetimi</h1>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    Son güncelleme: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '5px' }}>Toplam Ciro</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{totalRevenue.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '5px' }}>Toplam Sipariş</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{orders.length}</div>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '5px' }}>Aktif Siparişler</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbc02d' }}>{activeOrders}</div>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '5px' }}>Tamamlanan</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>{completedOrders}</div>
                </div>
            </div>

            {/* Toolbar: Search & Filter */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                <input
                    type="text"
                    placeholder="Sipariş No, Müşteri veya E-posta ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        flex: 1,
                        fontSize: '0.9rem'
                    }}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        minWidth: '150px',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                    }}
                >
                    <option value="Tümü">Tüm Durumlar</option>
                    <option value="Hazırlanıyor">Hazırlanıyor</option>
                    <option value="Kargoda">Kargoda</option>
                    <option value="Teslim Edildi">Teslim Edildi</option>
                    <option value="İptal Edildi">İptal Edildi</option>
                </select>

                {/* Bulk Actions */}
                {selectedOrderIds.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#fff8e1', padding: '5px 15px', borderRadius: '8px', border: '1px solid #ffe082' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedOrderIds.length} seçildi:</span>
                        <select
                            onChange={(e) => handleBulkStatusChange(e.target.value)}
                            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                            defaultValue=""
                        >
                            <option value="" disabled>Durum Değiştir...</option>
                            <option value="Hazırlanıyor">Hazırlanıyor Yap</option>
                            <option value="Kargoda">Kargoya Ver</option>
                            <option value="Teslim Edildi">Teslim Edildi Yap</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={handleExportCSV}>
                            <Download size={16} style={{ marginRight: '8px' }} /> Seçilenleri Excel'e Aktar
                        </Button>
                    </div>
                )}
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
                            <th style={{ padding: '15px', width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th style={{ padding: '15px' }}>Sipariş No</th>
                            <th style={{ padding: '15px' }}>Müşteri</th>
                            <th style={{ padding: '15px' }}>Tarih</th>
                            <th style={{ padding: '15px' }}>Tutar</th>
                            <th style={{ padding: '15px' }}>Ödeme</th>
                            <th style={{ padding: '15px' }}>Durum Güncelle</th>
                            <th style={{ padding: '15px' }}>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    style={{
                                        borderBottom: '1px solid var(--color-border)',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                >
                                    <td style={{ padding: '15px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrderIds.includes(order.id)}
                                            onChange={() => toggleSelectOrder(order.id)}
                                        />
                                    </td>
                                    <td style={{ padding: '15px', fontWeight: '600' }}>#{order.id}</td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: '500' }}>{order.customer}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.email}</div>
                                    </td>
                                    <td style={{ padding: '15px', color: 'var(--color-text-muted)' }}>{order.date}</td>
                                    <td style={{ padding: '15px', fontWeight: '600' }}>{order.total.toLocaleString('tr-TR')} ₺</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            backgroundColor: order.payment === 'Ödendi' ? '#e8f5e9' : '#fff3e0',
                                            color: order.payment === 'Ödendi' ? '#2e7d32' : '#ef6c00'
                                        }}>
                                            {order.payment}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--color-border)',
                                                fontSize: '0.85rem',
                                                color: getStatusColor(order.status),
                                                fontWeight: '600',
                                                backgroundColor: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="Hazırlanıyor">Hazırlanıyor</option>
                                            <option value="Kargoda">Kargoda</option>
                                            <option value="Teslim Edildi">Teslim Edildi</option>
                                            <option value="İptal Edildi">İptal Edildi</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <button
                                            onClick={() => openDetails(order)}
                                            style={{
                                                background: 'none',
                                                border: '1px solid var(--color-border)',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                color: 'var(--color-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <FileText size={16} />
                                            Belgeler
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                    Aradığınız kriterlere uygun sipariş bulunamadı.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal (Pop-up) */}
            {isModalOpen && selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 30px',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#fcfcfc'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Sipariş Detayı & Belgeler</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Sipariş No: #{selectedOrder.id}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '30px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                            <div>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ürünler</h3>
                                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                    {selectedOrder.items?.map((item: any, idx: number) => (
                                        <div key={idx} style={{
                                            padding: '12px',
                                            borderBottom: idx !== selectedOrder.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span>{item.name} <strong style={{ color: 'var(--color-text-muted)' }}>x{item.qty}</strong></span>
                                            <span style={{ fontWeight: '600' }}>{item.price.toLocaleString('tr-TR')} ₺</span>
                                        </div>
                                    ))}
                                    <div style={{ padding: '12px', backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>Toplam</span>
                                        <span style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>{selectedOrder.total.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '25px' }}>
                                    <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teslimat Adresi</h3>
                                    <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: 'var(--radius-sm)', lineHeight: '1.6' }}>
                                        {selectedOrder.address}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Müşteri Bilgileri</h3>
                                    <p style={{ fontWeight: '600' }}>{selectedOrder.customer}</p>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{selectedOrder.email}</p>
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>Kargo & Yönetim</h3>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Kargo Takip No</label>
                                        <input
                                            type="text"
                                            placeholder="Örn: 12345678"
                                            defaultValue={selectedOrder.trackingNo || ''}
                                            id="modalTrackingNo"
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Kargo Firması</label>
                                        <select id="modalCarrier" defaultValue={selectedOrder.carrier || 'Yurtiçi Kargo'} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                            <option>Yurtiçi Kargo</option>
                                            <option>Aras Kargo</option>
                                            <option>MNG Kargo</option>
                                            <option>UPS Kargo</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Admin Notları</label>
                                        <textarea
                                            id="modalNotes"
                                            rows={4}
                                            placeholder="Müşteriye özel notlar..."
                                            defaultValue={selectedOrder.adminNotes || ''}
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', resize: 'none' }}
                                        />
                                    </div>

                                    <Button
                                        style={{ width: '100%', marginBottom: '10px' }}
                                        onClick={() => {
                                            const tracking = (document.getElementById('modalTrackingNo') as HTMLInputElement).value;
                                            const carrier = (document.getElementById('modalCarrier') as HTMLSelectElement).value;
                                            const notes = (document.getElementById('modalNotes') as HTMLTextAreaElement).value;
                                            handleUpdateExtra(tracking, carrier, notes);
                                        }}
                                    >
                                        Bilgileri Kaydet
                                    </Button>

                                    <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>Belgeler</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        style={{ width: '100%', justifyContent: 'flex-start', gap: '10px' }}
                                        onClick={() => handlePrintInvoice(selectedOrder)}
                                    >
                                        <Download size={16} /> Faturayı İndir (PDF)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        style={{ width: '100%', justifyContent: 'flex-start', gap: '10px' }}
                                        onClick={() => handlePrintLabel(selectedOrder)}
                                    >
                                        <Printer size={16} /> Kargo Etiketi Yazdır
                                    </Button>
                                    <Button variant="primary" size="sm" style={{ width: '100%', marginTop: '10px' }} onClick={() => setIsModalOpen(false)}>
                                        Kapat
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
