import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GameState, INITIAL_BOARD, Color, PIECE_SYMBOLS, getLegalMoves, applyMove, getGameStatus, Board } from '../lib/chess';
import { getBotMove } from '../lib/bot';
import styles from './Play.module.css';

const initialGameState: GameState = {
  board: INITIAL_BOARD,
  turn: 'w',
  selected: null,
  legalMoves: [],
  lastMove: null,
  castlingRights: {
    wKingSide: true,
    wQueenSide: true,
    bKingSide: true,
    bQueenSide: true,
  },
  status: 'playing',
  winner: null,
  captured: { w: [], b: [] },
  positionCounts: {},
};

export default function Play() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [blinkColor, setBlinkColor] = useState<'red' | 'green' | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const bgAudio = new Audio('https://upload.wikimedia.org/wikipedia/commons/e/e4/Gymnop%C3%A9die_No._1.ogg');
    bgAudio.loop = true;
    bgAudio.volume = 0.2; // Soft background music

    const playAudio = () => {
      bgAudio.play().catch(e => console.log('Audio play prevented', e));
      document.removeEventListener('click', playAudio);
    };
    
    // Play on first interaction to avoid autoplay restrictions
    document.addEventListener('click', playAudio);

    return () => {
      bgAudio.pause();
      document.removeEventListener('click', playAudio);
    };
  }, []);

  const playSound = (isCapture: boolean, isMyLoss: boolean) => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isCapture) {
        if (isMyLoss) {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
        } else {
          osc.type = 'square';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        }
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch(e) {}
  };

  const triggerBlink = (color: 'red' | 'green') => {
    setBlinkColor(color);
    setTimeout(() => setBlinkColor(null), 500);
  };

  const handleSquareClick = (r: number, c: number) => {
    if (gameState.turn !== 'w' || (gameState.status !== 'playing' && gameState.status !== 'check') || isMoving) return;

    const piece = gameState.board[r][c];

    // If no piece is currently selected
    if (!gameState.selected) {
      if (piece && piece.startsWith('w')) {
        const moves = getLegalMoves(gameState.board, r, c, gameState.lastMove, gameState.castlingRights);
        if (moves.length > 0) {
          setGameState(prev => ({
            ...prev,
            selected: [r, c],
            legalMoves: moves
          }));
        }
      }
      return;
    }

    // If a piece is already selected
    const [sr, sc] = gameState.selected;

    // Clicked on another own piece
    if (piece && piece.startsWith('w')) {
      // Touch-Move Rule: A piece touched must be moved if it has a legal move.
      // So we ignore clicks on other pieces.
      return;
    }

    // Clicked on a valid target square
    const isLegalMove = gameState.legalMoves.some(([mr, mc]) => mr === r && mc === c);
    if (isLegalMove) {
      setIsMoving(true);
      setGameState(prev => ({
        ...prev,
        selected: null,
        legalMoves: []
      }));
      setTimeout(() => {
        executeMove([sr, sc], [r, c]);
        setIsMoving(false);
      }, 500);
    } else {
      // Deselecting invalid square clicks is also prevented by touch move,
      // once selected, you MUST make a legal move with it.
      return;
    }
  };

  const executeMove = (from: [number, number], to: [number, number]) => {
    setGameState(prev => {
      let capturedPieceId = prev.board[to[0]][to[1]];
      const movingPieceId = prev.board[from[0]][from[1]];
      
      if (movingPieceId && movingPieceId[1] === 'P' && from[1] !== to[1] && !capturedPieceId) {
        capturedPieceId = `${movingPieceId[0] === 'w' ? 'b' : 'w'}P` as any;
      }

      const newCaptured = { w: [...prev.captured.w], b: [...prev.captured.b] };
      if (capturedPieceId) {
        const type = capturedPieceId[1] as any;
        if (capturedPieceId.startsWith('w')) {
          newCaptured.w.push(type);
          triggerBlink('red');
          playSound(true, true);
        } else {
          newCaptured.b.push(type);
          triggerBlink('green');
          playSound(true, false);
        }
      } else {
        playSound(false, false);
      }

      const newBoard = applyMove(prev.board, from, to, prev.lastMove);
      let newCastlingRights = { ...prev.castlingRights };
      
      const piece = prev.board[from[0]][from[1]];
      if (piece === 'wK') {
        newCastlingRights.wKingSide = false;
        newCastlingRights.wQueenSide = false;
      } else if (piece === 'bK') {
        newCastlingRights.bKingSide = false;
        newCastlingRights.bQueenSide = false;
      } else if (piece === 'wR') {
        if (from[0] === 7 && from[1] === 0) newCastlingRights.wQueenSide = false;
        if (from[0] === 7 && from[1] === 7) newCastlingRights.wKingSide = false;
      } else if (piece === 'bR') {
        if (from[0] === 0 && from[1] === 0) newCastlingRights.bQueenSide = false;
        if (from[0] === 0 && from[1] === 7) newCastlingRights.bKingSide = false;
      }

      const nextTurn = prev.turn === 'w' ? 'b' : 'w';
      const lastMove = { from, to };
      
      // Calculate position count for threefold repetition
      const boardStr = JSON.stringify(newBoard);
      const newPositionCounts = { ...prev.positionCounts };
      newPositionCounts[boardStr] = (newPositionCounts[boardStr] || 0) + 1;

      const newStatus = getGameStatus(newBoard, nextTurn, lastMove, newCastlingRights, newPositionCounts);
      let newWinner = null;
      if (newStatus === 'checkmate') {
        newWinner = prev.turn; // The one who just moved wins
      }

      return {
        ...prev,
        board: newBoard,
        turn: nextTurn,
        selected: null,
        legalMoves: [],
        lastMove,
        castlingRights: newCastlingRights,
        status: newStatus,
        winner: newWinner,
        captured: newCaptured,
        positionCounts: newPositionCounts
      };
    });
  };

  useEffect(() => {
    if (gameState.turn === 'b' && (gameState.status === 'playing' || gameState.status === 'check')) {
      const timer = setTimeout(() => {
        const move = getBotMove(gameState.board, gameState.lastMove, gameState.castlingRights);
        if (move) {
          executeMove(move.from, move.to);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState.turn, gameState.status, gameState.board, gameState.lastMove, gameState.castlingRights]);

  return (
    <div className={`${styles.page} ${blinkColor ? (blinkColor === 'red' ? styles.blinkRed : styles.blinkGreen) : ''}`}>
      <header className={styles.header}>
        <div className={styles.logo}>Chestry</div>
        <Link to="/" className={styles.backLink}>&larr; Back</Link>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <div className={styles.turnIndicator}>
            <h3>Game Status</h3>
            <p className={gameState.turn === 'w' ? styles.statusWhite : styles.statusBlack}>
              {gameState.status === 'playing' || gameState.status === 'check' ? (gameState.turn === 'w' ? 'Your turn' : 'Bot is thinking...') : 'Game over'}
            </p>
          </div>
          
          <div className={styles.capturedSection}>
            <h3>Knocked from Opponent</h3>
            <div className={styles.capturedPieces}>
              {gameState.captured.b.map((t, i) => <span key={i} className={styles.capturedPiece}>{PIECE_SYMBOLS[`b${t}`]}</span>)}
              {gameState.captured.b.length === 0 && <span className={styles.noCaptured}>None</span>}
            </div>
            <p className={styles.capturedCount}>{gameState.captured.b.length} pieces knocked</p>
          </div>

          <div className={styles.capturedSection}>
            <h3>Knocked from My Side</h3>
            <div className={styles.capturedPieces}>
              {gameState.captured.w.map((t, i) => <span key={i} className={styles.capturedPiece}>{PIECE_SYMBOLS[`w${t}`]}</span>)}
              {gameState.captured.w.length === 0 && <span className={styles.noCaptured}>None</span>}
            </div>
             <p className={styles.capturedCount}>{gameState.captured.w.length} pieces knocked</p>
          </div>

          <button 
            className={styles.newGameButton} 
            onClick={() => setGameState(initialGameState)}
          >
            New Game
          </button>
        </div>

        <div className={styles.gameArea}>
          <div className={styles.statusBar}>
            {gameState.status === 'check' && (
              <span className={styles.statusWhite}>
                Check!
              </span>
            )}
            {gameState.status === 'checkmate' && (
              <span className={styles.statusEnd}>
                {gameState.winner === 'w' ? 'Checkmate — You Win! 🎉' : 'Checkmate — Bot Wins'}
              </span>
            )}
            {gameState.status === 'stalemate' && (
              <span className={styles.statusEnd}>Stalemate — Draw</span>
            )}
            {gameState.status === 'draw' && (
              <span className={styles.statusEnd}>Draw</span>
            )}
          </div>

          <div className={styles.boardContainer}>
            <div className={styles.board}>
            {gameState.board.map((row, r) => (
               row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected = gameState.selected?.[0] === r && gameState.selected?.[1] === c;
                const isLegalMove = gameState.legalMoves.some(([mr, mc]) => mr === r && mc === c);
                const isInCheck = gameState.status === 'check' && piece === `${gameState.turn}K`;
                
                return (
                  <div 
                    key={`${r}-${c}`} 
                    className={`
                      ${styles.square} 
                      ${isLight ? styles.light : styles.dark}
                      ${isSelected ? styles.selected : ''}
                      ${isInCheck ? styles.inCheck : ''}
                    `}
                    onClick={() => handleSquareClick(r, c)}
                  >
                    {piece && <span className={styles.piece}>{PIECE_SYMBOLS[piece]}</span>}
                    {isLegalMove && <span className={styles.legalDot} />}
                    
                    {c === 0 && <span className={`${styles.label} ${styles.rankLabel}`}>{8 - r}</span>}
                    {r === 7 && <span className={`${styles.label} ${styles.fileLabel}`}>{String.fromCharCode(97 + c)}</span>}
                  </div>
                );
              })
            ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
