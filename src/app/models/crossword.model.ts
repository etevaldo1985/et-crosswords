export interface CrosswordCell {
  row: number;
  col: number;
  letter: string;
  solution: string;
  isBlocked: boolean;
  clueNumber?: number;
  isCorrect?: boolean;
  isWrong?: boolean;
}

export interface Clue {
  id: string; // e.g., '1A', '2D'
  number: number;
  direction: 'across' | 'down';
  text: string;
  row: number;
  col: number;
  length: number;
}

export interface CrosswordPuzzle {
  id: string;
  title: string;
  grid: CrosswordCell[][];
  clues: Clue[];
  width: number;
  height: number;
}
