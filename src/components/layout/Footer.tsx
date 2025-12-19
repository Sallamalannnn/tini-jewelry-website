import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Instagram, Facebook, Twitter } from 'lucide-react'; // Assuming valid icons
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.grid}`}>
                {/* Brand Section */}
                <div className={styles.col}>
                    <Logo className="mb-4" />
                    <p className={styles.description}>
                        Doğanın ve zarafetin buluştuğu nokta. Tını, size özel tasarımlarla hayatınıza ışıltı katar.
                    </p>
                    <div className={styles.socials}>
                        <Link href="#" className={styles.socialLink}><Instagram size={20} /></Link>
                        <Link href="#" className={styles.socialLink}><Facebook size={20} /></Link>
                        <Link href="#" className={styles.socialLink}><Twitter size={20} /></Link>
                    </div>
                </div>

                {/* Links */}
                <div className={styles.col}>
                    <h4 className={styles.heading}>Alışveriş</h4>
                    <ul className={styles.list}>
                        <li><Link href="/new-arrivals">Yeni Gelenler</Link></li>
                        <li><Link href="/collections">Koleksiyonlar</Link></li>
                        <li><Link href="/sale">İndirimler</Link></li>
                    </ul>
                </div>

                <div className={styles.col}>
                    <h4 className={styles.heading}>Kurumsal</h4>
                    <ul className={styles.list}>
                        <li><Link href="/about">Hakkımızda</Link></li>
                        <li><Link href="/contact">İletişim</Link></li>
                        <li><Link href="/terms">Kullanım Koşulları</Link></li>
                    </ul>
                </div>

                <div className={styles.col}>
                    <h4 className={styles.heading}>Bülten</h4>
                    <p className={styles.text}>En yeni koleksiyonlardan haberdar olun.</p>
                    <form className={styles.form}>
                        <input type="email" placeholder="E-posta adresiniz" className={styles.input} />
                        <button type="submit" className={styles.submitBtn}>Abone Ol</button>
                    </form>
                </div>
            </div>

            <div className={`container ${styles.copyright}`}>
                <p>&copy; {new Date().getFullYear()} Tını Giyim & Aksesuar. Tüm hakları saklıdır.</p>
                <Link href="/admin" className={styles.adminLink} style={{ marginLeft: '10px', fontSize: '12px', opacity: 0.5, color: 'inherit' }}>Yönetici</Link>
            </div>
        </footer>
    );
};
