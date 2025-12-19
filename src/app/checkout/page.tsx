import { CheckoutForm } from './CheckoutForm';
import styles from './page.module.css';

export default function CheckoutPage() {
    return (
        <div className={`container ${styles.page}`}>
            <h1 className={styles.title}>Ödeme</h1>
            <CheckoutForm />
        </div>
    );
}
