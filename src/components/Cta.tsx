import styles from './Cta.module.css';

export default function Cta() {
  return (
    <section className={styles.cta}>
      <div className={styles.bgWrapper}>
        <img 
          src="https://cdn.prod.website-files.com/68080704d06b5dc7e73983a8/6808ddb56244131cad3b7922_queen.svg" 
          alt="" 
          className={styles.bgQueen} 
        />
      </div>
      <div className={styles.container}>
        <h2 className={styles.heading}>Join the legends of the board</h2>
        <button className={styles.ctaButton}>Join the Club</button>
      </div>
    </section>
  );
}
