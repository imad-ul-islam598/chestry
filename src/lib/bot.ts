import { Board, GameState, getLegalMoves } from './chess';

export function getBotMove(
  board: Board,
  lastMove: GameState['lastMove'],
  castlingRights: GameState['castlingRights']
): { from: [number,number], to: [number,number] } | null {

  const moves: { from: [number,number], to: [number,number], capture: boolean }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.startsWith('b')) {
        const legal = getLegalMoves(board, r, c, lastMove, castlingRights);
        for (const [tr, tc] of legal) {
          moves.push({
            from: [r, c],
            to: [tr, tc],
            capture: board[tr][tc] !== null
          });
        }
      }
    }
  }

  if (moves.length === 0) return null;

  // Prioritize captures
  const captures = moves.filter(m => m.capture);
  if (captures.length > 0) {
    const choice = captures[Math.floor(Math.random() * captures.length)];
    return { from: choice.from, to: choice.to };
  }

  const choice = moves[Math.floor(Math.random() * moves.length)];
  return { from: choice.from, to: choice.to };
}
