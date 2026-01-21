import styles from './index.module.css';
import Link from '@/node_modules/next/link';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.nav}>
        <ul className={styles.items}>
          <li className={styles.item}>
            <Link href="/news">Knowledge</Link>
          </li>
          <li className={styles.item}>
            <Link href="/members">Members</Link>
          </li>
          <li className={styles.item}>
            <Link href="/contact">Contact</Link>
          </li>
          {/* <li className={styles.item}>
            <Link href="/terms">特商法表記</Link>
          </li> */}
        </ul>
      </nav>
      <p className={styles.cr}>© Knowledge S. All Rights Reserved 2025</p>
    </footer>
  );
}