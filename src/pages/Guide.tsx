import { Link } from 'react-router-dom';
import styles from './Guide.module.css';

export default function Guide() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>Chestry</div>
        <Link to="/" className={styles.backLink}>&larr; Back</Link>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>How to Play Chess</h1>
          <p className={styles.intro}>
            Chess is a strategy board game played between two players. It is played on a checkered board with 64 squares arranged in an 8×8 grid. Here is a comprehensive guide to understanding the rules and playing your first game.
          </p>

          <section className={styles.section}>
            <h2>1. The Goal</h2>
            <p>
              The objective of the game is to "checkmate" the opponent's king. Checkmate happens when the king is in a position to be captured (in "check") and cannot escape from capture.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. The Pieces & How They Move</h2>
            <div className={styles.piecesGrid}>
              <div className={styles.pieceCard}>
                <span className={styles.pieceIcon}>♟</span>
                <h3>Pawn</h3>
                <p>Moves one square forward, but captures diagonally. On its first move, it can advance two squares. Pawns cannot move backward.</p>
              </div>
              <div className={styles.pieceCard}>
                <span className={styles.pieceIcon}>♜</span>
                <h3>Rook</h3>
                <p>Moves any number of vacant squares forwards, backwards, left, or right.</p>
              </div>
              <div className={styles.pieceCard}>
                <span className={styles.pieceIcon}>♞</span>
                <h3>Knight</h3>
                <p>Moves in an 'L' shape: two squares in one direction and then one square at a right angle. Knights are the only pieces that can jump over others.</p>
              </div>
              <div className={styles.pieceCard}>
                <span className={styles.pieceIcon}>♝</span>
                <h3>Bishop</h3>
                <p>Moves any number of vacant squares diagonally. Each bishop remains on its starting color square.</p>
              </div>
              <div className={styles.pieceCard}>
                <span className={styles.pieceIcon}>♛</span>
                <h3>Queen</h3>
                <p>The most powerful piece. Moves any number of vacant squares in any direction: horizontally, vertically, or diagonally.</p>
              </div>
              <div className={styles.pieceCard}>
                <span className={styles.pieceIcon}>♚</span>
                <h3>King</h3>
                <p>Moves exactly one square horizontally, vertically, or diagonally. The king cannot move into a square that is under attack.</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>3. Special Rules</h2>
            <ul className={styles.list}>
              <li>
                <strong>Castling:</strong> A special king-and-rook move. It allows you to do two important things: get your king to safety, and bring your rook out of the corner and into the game. Requirements: Neither piece has moved, the squares between them are empty, and the king is not in check.
              </li>
              <li>
                <strong>En Passant:</strong> If a pawn moves out two squares on its first move and lands next to an opponent's pawn, that opponent's pawn has the option of capturing the first pawn as it passes.
              </li>
              <li>
                <strong>Pawn Promotion:</strong> If a pawn reaches the opposite side of the board, it becomes any other piece (usually a Queen).
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Check and Checkmate</h2>
            <ul className={styles.list}>
              <li><strong>Check:</strong> When a king is attacked by an enemy piece, it is in "check". The player must immediately move the king, block the attack, or capture the attacking piece to get out of check.</li>
              <li><strong>Checkmate:</strong> If a king is in check and there is no legal move to escape, it is "checkmate", and the game ends immediately.</li>
              <li><strong>Stalemate:</strong> If it's a player's turn to move, their king is NOT in check, but they have no legal moves, the game is a "stalemate" (a draw).</li>
            </ul>
          </section>

          <div className={styles.ctaContainer}>
            <Link to="/play" className={styles.playButton}>Play a Game Now</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
