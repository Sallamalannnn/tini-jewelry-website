import styles from './Marquee.module.css';

interface MarqueeProps {
    text: string;
    speed?: number; // Duration in seconds
}

export const Marquee = ({ text, speed = 20 }: MarqueeProps) => {
    return (
        <div className={styles.marqueeContainer}>
            <div className={styles.track} style={{ animationDuration: `${speed}s` }}>
                <div className={styles.content}>{text}</div>
                <div className={styles.content}>{text}</div> {/* Duplicate for seamless loop */}
                <div className={styles.content}>{text}</div>
                <div className={styles.content}>{text}</div>
            </div>
        </div>
    );
};
