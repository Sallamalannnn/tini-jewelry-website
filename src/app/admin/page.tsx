import styles from './page.module.css';

export default function AdminDashboard() {
    return (
        <div>
            <h1 className={styles.title}>Genel Bakış</h1>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Toplam Satış</h3>
                    <p className={styles.statValue}>124.500 ₺</p>
                    <span className={styles.statTrend}>+12% bu ay</span>
                </div>
                <div className={styles.statCard}>
                    <h3>Siparişler</h3>
                    <p className={styles.statValue}>45</p>
                    <span className={styles.statTrend}>+5 yeni</span>
                </div>
                <div className={styles.statCard}>
                    <h3>Ürünler</h3>
                    <p className={styles.statValue}>12</p>
                    <span className={styles.statTrend}>Stok durumu iyi</span>
                </div>
            </div>

            <div className={styles.quickActions}>
                <h2>Hızlı İşlemler</h2>
                <div className={styles.actionGrid}>
                    <a href="/admin/products/new" className={styles.actionCard}>
                        <span className={styles.actionIcon}>+</span>
                        <span className={styles.actionText}>Yeni Ürün Ekle</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
