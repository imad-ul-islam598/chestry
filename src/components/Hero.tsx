import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.backgroundPieces}>
        <img 
          src="https://cdn.prod.website-files.com/68080704d06b5dc7e73983a8/6808ddb6d5025c5d7a11828c_pawn.svg" 
          alt="" 
          className={`${styles.piece} ${styles.pawn}`} 
        />
        <img 
          src="https://cdn.prod.website-files.com/68080704d06b5dc7e73983a8/6808ddb80588a9e2f7bbfe7d_king.svg" 
          alt="" 
          className={`${styles.piece} ${styles.king}`} 
        />
        <img 
          src="https://cdn.prod.website-files.com/68080704d06b5dc7e73983a8/6808ddb56244131cad3b7922_queen.svg" 
          alt="" 
          className={`${styles.piece} ${styles.queen}`} 
        />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>Where strategy meets passion</h1>
        <p className={styles.subtitle}>A community of thinkers, strategists, and enthusiasts.</p>
        <Link to="/play" className={styles.ctaButton}>Play <span style={{fontSize: '1.25rem'}}>&rarr;</span></Link>
      </div>
    </section>
  );
}
