import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logoGroup}>
          <span className={styles.brandName}>Chestry</span>
        </div>

        <div className={`${styles.navLinks} ${isOpen ? styles.open : ''}`}>
          <Link to="/guide" onClick={() => setIsOpen(false)}>Guide</Link>
          <Link to="/play" className={styles.joinButton} onClick={() => setIsOpen(false)}>Play</Link>
        </div>

        <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>
      </div>
    </nav>
  );
}
