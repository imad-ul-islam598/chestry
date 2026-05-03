import styles from './About.module.css';

export default function About() {
  return (
    <section className={styles.about} id="about">
      <div className={styles.container}>
        <h2 className={styles.heading}>More than just a club</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Expert Coaching</h3>
            <p className={styles.cardText}>
              Learn from grandmasters and elevate your game with personalized training sessions tailored to your skill level.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Tournaments</h3>
            <p className={styles.cardText}>
              Compete in weekly rapid and classical tournaments. Test your mettle against the best minds in the community.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Membership</h3>
            <p className={styles.cardText}>
              Gain access to exclusive resources, private playing rooms, and a network of passionate chess enthusiasts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
