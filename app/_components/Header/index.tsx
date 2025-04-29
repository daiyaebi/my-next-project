import Image from 'next/image';
import Link from "next/link";
import styles from './index.module.css';
import Menu from '../Menu/index';

export default function Header() {
  return (
    <header className={styles.header}>
       <link rel="icon" href="/favicon.ico" />
       <Link href='/' className={styles.logoLink}>
            <Image
              src="/knowledgeS-logo.png"
              alt="knowledgeS"
              className={styles.logo}
              width={348}
              height={133}
              priority
            />
       </Link>
       <Menu />
    </header>
  );
}