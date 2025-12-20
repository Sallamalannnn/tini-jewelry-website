import Link from 'next/link';
import { clsx } from 'clsx';

export const Logo = ({ className }: { className?: string }) => {
    return (
        <Link href="/" className={clsx("Logo", className)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
            <img
                src="/assets/logos/logo-gold.png"
                alt="TINI GİYİM VE AKSESUAR Logo"
                className="logo-img logo-gold"
                style={{ height: '110px', width: 'auto', objectFit: 'contain' }}
            />
            <img
                src="/assets/logos/logo-silver.png"
                alt="TINI GİYİM VE AKSESUAR Logo"
                className="logo-img logo-silver"
                style={{ height: '110px', width: 'auto', objectFit: 'contain' }}
            />
        </Link>
    );
};
