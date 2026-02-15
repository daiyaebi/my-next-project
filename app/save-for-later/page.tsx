import Link from 'next/link';
import Hero from '../_components/Hero';
import styles from './page.module.css';

export default function Page() {
    return (
        <main className={styles.main}>
            <Hero title="Save For Later" sub="Save items to your list and view them anytime." />

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Main Features</h2>
                <div className={styles.featureList}>
                    <div className={styles.featureItem}>
                        <h3 className={styles.featureTitle}>Easy to Save</h3>
                        <p className={styles.featureDescription}>
                            Simply click the &quot;Save for Later&quot; button on the product page to add items to your list.
                            You can save items temporarily without logging in, and merge them after logging in.
                        </p>
                    </div>
                    <div className={styles.featureItem}>
                        <h3 className={styles.featureTitle}>View Anytime</h3>
                        <p className={styles.featureDescription}>
                            View your saved items in a dedicated list.
                            Manage items you want to compare or buy later for a smoother shopping experience.
                        </p>
                    </div>
                    <div className={styles.featureItem}>
                        <h3 className={styles.featureTitle}>Multi-Device Support</h3>
                        <p className={styles.featureDescription}>
                            Log in to check saved items on your smartphone, even if you saved them on your PC.
                            Enjoy shopping anywhere, anytime.
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <h2 className={styles.sectionTitle}>Experience It Now</h2>
                <p className={styles.featureDescription} style={{ marginBottom: '30px' }}>
                    Use the NLDE &quot;Save For Later&quot; feature for a more convenient shopping experience.
                </p>
                <Link href="/" className={styles.ctaButton}>
                    Back to Top
                </Link>
            </section>
        </main>
    );
}
