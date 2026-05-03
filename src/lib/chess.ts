export type Color = 'w' | 'b'
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'
export type PieceCode = `${Color}${PieceType}` | null

export type Board = PieceCode[][]

export interface GameState {
  board: Board
  turn: Color
  selected: [number, number] | null
  legalMoves: [number, number][]
  lastMove: { from: [number,number], to: [number,number] } | null
  castlingRights: {
    wKingSide: boolean
    wQueenSide: boolean
    bKingSide: boolean
    bQueenSide: boolean
  }
  status: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'check'
  winner: Color | null
  captured: {
    w: PieceType[];
    b: PieceType[];
  }
  positionCounts: Record<string, number>
}

export const INITIAL_BOARD: Board = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR'],
];

export const PIECE_SYMBOLS: Record<string, string> = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟',
};

function isInside(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function getRawMoves(board: Board, row: number, col: number): [number,number][] {
  const piece = board[row][col];
  if (!piece) return [];
  const color = piece[0] as Color;
  const type = piece[1] as PieceType;
  const moves: [number,number][] = [];

  const addIfEmptyOrEnemy = (r: number, c: number) => {
    if (!isInside(r, c)) return false;
    const target = board[r][c];
    if (!target) {
      moves.push([r, c]);
      return true; // can continue sliding
    }
    if (target[0] !== color) {
      moves.push([r, c]);
    }
    return false; // blocked
  };

  if (type === 'P') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    // one step
    if (isInside(row + dir, col) && !board[row + dir][col]) {
      moves.push([row + dir, col]);
      // two steps
      if (row === startRow && !board[row + dir * 2][col] && !board[row + dir][col]) {
        moves.push([row + dir * 2, col]);
      }
    }
    // captures
    for (const dc of [-1, 1]) {
      if (isInside(row + dir, col + dc)) {
        const target = board[row + dir][col + dc];
        if (target && target[0] !== color) {
          moves.push([row + dir, col + dc]);
        }
      }
    }
  } else if (type === 'N') {
    const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of offsets) {
      const r = row + dr;
      const c = col + dc;
      if (isInside(r, c) && board[r][c]?.charAt(0) !== color) {
        moves.push([r, c]);
      }
    }
  } else if (type === 'K') {
    const offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dr, dc] of offsets) {
      const r = row + dr;
      const c = col + dc;
      if (isInside(r, c) && board[r][c]?.charAt(0) !== color) {
        moves.push([r, c]);
      }
    }
  } else if (type === 'R' || type === 'B' || type === 'Q') {
    const dirs = [];
    if (type !== 'B') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    if (type !== 'R') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    for (const [dr, dc] of dirs) {
      let r = row + dr;
      let c = col + dc;
      while (addIfEmptyOrEnemy(r, c)) {
        r += dr;
        c += dc;
      }
    }
  }

  return moves;
}

export function isInCheck(board: Board, color: Color): boolean {
  let kingPos: [number, number] | null = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === `${color}K`) {
        kingPos = [r, c];
        break;
      }
    }
    if (kingPos) break;
  }
  if (!kingPos) return false;

  const enemy = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p[0] === enemy) {
        const moves = getRawMoves(board, r, c);
        if (moves.some(([mr, mc]) => mr === kingPos![0] && mc === kingPos![1])) {
          return true;
        }
      }
    }
  }
  return false;
}

export function applyMove(
  board: Board,
  from: [number,number],
  to: [number,number],
  lastMove: GameState['lastMove']
): Board {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from[0]][from[1]];
  if (!piece) return newBoard;

  const color = piece[0];
  const type = piece[1];

  // Move the piece
  newBoard[to[0]][to[1]] = piece;
  newBoard[from[0]][from[1]] = null;

  // En passant logic
  if (type === 'P' && from[1] !== to[1] && board[to[0]][to[1]] === null) {
    // Only way a pawn moves diagonally into an empty square is en passant
    newBoard[from[0]][to[1]] = null;
  }

  // Castling logic
  if (type === 'K' && Math.abs(from[1] - to[1]) === 2) {
    if (to[1] === 6) { // King side
      newBoard[from[0]][5] = newBoard[from[0]][7];
      newBoard[from[0]][7] = null;
    } else if (to[1] === 2) { // Queen side
      newBoard[from[0]][3] = newBoard[from[0]][0];
      newBoard[from[0]][0] = null;
    }
  }

  // Promotion logic
  if (type === 'P' && (to[0] === 0 || to[0] === 7)) {
    newBoard[to[0]][to[1]] = `${color}Q` as PieceCode;
  }

  return newBoard;
}

export function getLegalMoves(
  board: Board,
  row: number,
  col: number,
  lastMove: GameState['lastMove'],
  castlingRights: GameState['castlingRights']
): [number,number][] {
  const piece = board[row][col];
  if (!piece) return [];
  const color = piece[0] as Color;
  const rawMoves = getRawMoves(board, row, col);

  // Add en passant to raw moves
  if (piece[1] === 'P' && lastMove) {
    const { from: lastFrom, to: lastTo } = lastMove;
    const lastPiece = board[lastTo[0]][lastTo[1]];
    if (lastPiece && lastPiece[1] === 'P' && lastPiece[0] !== color) {
      if (lastFrom[0] === (color === 'w' ? 1 : 6) && lastTo[0] === (color === 'w' ? 3 : 4)) {
        if (row === lastTo[0] && Math.abs(col - lastTo[1]) === 1) {
          rawMoves.push([color === 'w' ? row - 1 : row + 1, lastTo[1]]);
        }
      }
    }
  }

  // Add castling to raw moves
  if (piece[1] === 'K' && !isInCheck(board, color)) {
    const rights = color === 'w' ? 
      [castlingRights.wKingSide, castlingRights.wQueenSide] : 
      [castlingRights.bKingSide, castlingRights.bQueenSide];
    
    // King side
    if (rights[0] && !board[row][5] && !board[row][6] && board[row][7] === `${color}R`) {
      const b1 = applyMove(board, [row, col], [row, 5], lastMove);
      if (!isInCheck(b1, color)) {
        rawMoves.push([row, 6]); 
      }
    }
    // Queen side
    if (rights[1] && !board[row][3] && !board[row][2] && !board[row][1] && board[row][0] === `${color}R`) {
      const b1 = applyMove(board, [row, col], [row, 3], lastMove);
      if (!isInCheck(b1, color)) {
        rawMoves.push([row, 2]);
      }
    }
  }

  return rawMoves.filter(([r, c]) => {
    const newBoard = applyMove(board, [row, col], [r, c], lastMove);
    return !isInCheck(newBoard, color);
  });
}

export function isInsufficientMaterial(board: Board): boolean {
  const pieces = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]) {
        pieces.push(board[r][c]);
      }
    }
  }
  if (pieces.length <= 2) return true; // Kings only
  if (pieces.length === 3) { // King + Bishop/Knight vs King
    if (pieces.some(p => p?.[1] === 'B' || p?.[1] === 'N')) return true;
  }
  return false;
}

export function getGameStatus(
  board: Board,
  turn: Color,
  lastMove: GameState['lastMove'],
  castlingRights: GameState['castlingRights'],
  positionCounts?: Record<string, number>
): GameState['status'] {
  let hasLegalMoves = false;
  outer: for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.startsWith(turn)) {
        if (getLegalMoves(board, r, c, lastMove, castlingRights).length > 0) {
          hasLegalMoves = true;
          break outer;
        }
      }
    }
  }

  const inCheck = isInCheck(board, turn);

  if (!hasLegalMoves) {
    return inCheck ? 'checkmate' : 'stalemate';
  }

  if (isInsufficientMaterial(board)) {
    return 'draw';
  }

  if (positionCounts && Object.values(positionCounts).some(count => count >= 3)) {
    return 'draw';
  }
  
  return inCheck ? 'check' : 'playing';
}
