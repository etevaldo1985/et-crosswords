import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CrosswordCell, Clue, CrosswordPuzzle } from '../models/crossword.model';
import { PUZZLES_DB } from '../data/puzzles';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './auth.service';

const db = getFirestore(app);

export interface PuzzleListItem {
  id: string;
  title: string;
  language: 'en' | 'pt';
  difficulty: 'easy' | 'medium' | 'hard';
  size: string;
}

@Injectable({
  providedIn: 'root'
})
export class CrosswordService {
  private router = inject(Router);
  private functions = getFunctions(app, 'us-central1');

  // State
  public puzzle = signal<CrosswordPuzzle | null>(null);
  public grid = signal<CrosswordCell[][]>([]);
  public activeRow = signal<number>(-1);
  public activeCol = signal<number>(-1);
  public activeDirection = signal<'across' | 'down'>('across');
  public score = signal<number>(0);
  public timeElapsed = signal<number>(0);
  public isVerified = signal<boolean>(false);
  
  public availablePuzzles = signal<PuzzleListItem[]>([]);
  public isLoadingPuzzles = signal<boolean>(false);
  public isGeneratingPuzzle = signal<boolean>(false);
  
  private timerInterval: ReturnType<typeof setInterval> | undefined;
  private startTime = 0;
  private pausedTime = 0;

  constructor() {
    this.initializeDbAndLoadPuzzles();
  }

  public async generateNewPuzzle(difficulty: 'easy' | 'medium' | 'hard', language: 'en' | 'pt') {
    this.isGeneratingPuzzle.set(true);
    
    try {
      const generatePuzzleFn = httpsCallable<{difficulty: string, language: string}, {id: string}>(this.functions, 'generatePuzzle');
      const result = await generatePuzzleFn({ difficulty, language });
      
      const newId = result.data.id;
      
      // Reload puzzles list
      const querySnapshot = await getDocs(collection(db, 'puzzles'));
      this.setAvailablePuzzlesFromSnapshot(querySnapshot);
      
      return newId;
    } catch (error) {
      console.error("Error generating puzzle via Cloud Function:", error);
      throw error;
    } finally {
      this.isGeneratingPuzzle.set(false);
    }
  }

  private async initializeDbAndLoadPuzzles() {
    this.isLoadingPuzzles.set(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'puzzles'));
      this.setAvailablePuzzlesFromSnapshot(querySnapshot);
    } catch (error) {
      console.error("Error fetching puzzles: ", error);
      // Fallback to local DB if firestore fails
      this.availablePuzzles.set(PUZZLES_DB.map(p => ({
        id: p.id,
        title: p.title,
        language: p.language,
        difficulty: p.difficulty,
        size: p.size
      })));
    } finally {
      this.isLoadingPuzzles.set(false);
    }
  }

  private setAvailablePuzzlesFromSnapshot(snapshot: { forEach: (cb: (doc: { id: string, data: () => Record<string, unknown> }) => void) => void }) {
    const puzzles: PuzzleListItem[] = [];
    snapshot.forEach((puzzleDoc) => {
      const data = puzzleDoc.data();
      puzzles.push({
        id: puzzleDoc.id,
        title: (data['title'] as string) || 'Untitled',
        language: (data['language'] as 'en' | 'pt') || 'en',
        difficulty: (data['difficulty'] as 'easy' | 'medium' | 'hard') || 'easy',
        size: (data['size'] as string) || '7x7'
      });
    });
    this.availablePuzzles.set(puzzles);
  }

  // Computed
  public activeClue = computed(() => {
    const p = this.puzzle();
    const r = this.activeRow();
    const c = this.activeCol();
    const dir = this.activeDirection();
    
    if (!p || r === -1 || c === -1) return null;
    
    // Find the clue that contains this cell in the current direction
    return p.clues.find(clue => {
      if (clue.direction !== dir) return false;
      if (dir === 'across') {
        return clue.row === r && c >= clue.col && c < clue.col + clue.length;
      } else {
        return clue.col === c && r >= clue.row && r < clue.row + clue.length;
      }
    }) || null;
  });

  public acrossClues = computed(() => this.puzzle()?.clues.filter(c => c.direction === 'across') || []);
  public downClues = computed(() => this.puzzle()?.clues.filter(c => c.direction === 'down') || []);

  public async loadPuzzle(id: string) {
    try {
      const docRef = doc(db, 'puzzles', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const puzzleData = docSnap.data() as { id: string, title: string, gridStr: string[], acrossClues: Record<number, string>, downClues: Record<number, string> };
        this.initPuzzle(puzzleData.id, puzzleData.title, puzzleData.gridStr, puzzleData.acrossClues, puzzleData.downClues);
      } else {
        console.log("No such puzzle in DB, falling back to local!");
        const localPuzzle = PUZZLES_DB.find(p => p.id === id);
        if (localPuzzle) {
           this.initPuzzle(localPuzzle.id, localPuzzle.title, localPuzzle.gridStr, localPuzzle.acrossClues, localPuzzle.downClues);
        } else {
           this.router.navigate(['/home']);
        }
      }
    } catch (error) {
      console.error("Error fetching puzzle:", error);
      const localPuzzle = PUZZLES_DB.find(p => p.id === id);
      if (localPuzzle) {
         this.initPuzzle(localPuzzle.id, localPuzzle.title, localPuzzle.gridStr, localPuzzle.acrossClues, localPuzzle.downClues);
      } else {
         this.router.navigate(['/home']);
      }
    }
  }

  private initPuzzle(id: string, title: string, gridStr: string[], acrossClues: Record<number, string>, downClues: Record<number, string>) {
    // B4. Validar gridStr no cliente
    if (!gridStr || gridStr.length === 0) {
      console.error("Invalid grid data");
      this.router.navigate(['/home']);
      return;
    }
    const height = gridStr.length;
    const width = gridStr[0].length;
    
    if (gridStr.some(row => row.length !== width)) {
      console.error("Irregular grid detected");
      this.router.navigate(['/home']);
      return;
    }

    const grid: CrosswordCell[][] = [];
    const clues: Clue[] = [];

    let currentNumber = 1;
    const cellNumbers: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (gridStr[r][c] === '#') continue;

        const isAcrossStart = c === 0 || gridStr[r][c - 1] === '#';
        const isDownStart = r === 0 || gridStr[r - 1][c] === '#';

        const hasAcrossWord = isAcrossStart && c + 1 < width && gridStr[r][c + 1] !== '#';
        const hasDownWord = isDownStart && r + 1 < height && gridStr[r + 1][c] !== '#';

        if (hasAcrossWord || hasDownWord) {
          cellNumbers[r][c] = currentNumber;
          currentNumber++;
        }
      }
    }

    for (let r = 0; r < height; r++) {
      const row: CrosswordCell[] = [];
      for (let c = 0; c < width; c++) {
        const isBlocked = gridStr[r][c] === '#';
        const num = cellNumbers[r][c];

        row.push({
          row: r,
          col: c,
          letter: '',
          solution: isBlocked ? '' : gridStr[r][c],
          isBlocked,
          clueNumber: num > 0 ? num : undefined
        });

        if (num > 0 && (c === 0 || gridStr[r][c - 1] === '#') && c + 1 < width && gridStr[r][c + 1] !== '#') {
          let len = 0;
          while (c + len < width && gridStr[r][c + len] !== '#') len++;
          clues.push({
            id: `${num}A`,
            number: num,
            direction: 'across',
            text: acrossClues[num] || `Across ${num}`,
            row: r,
            col: c,
            length: len
          });
        }

        if (num > 0 && (r === 0 || gridStr[r - 1][c] === '#') && r + 1 < height && gridStr[r + 1][c] !== '#') {
          let len = 0;
          while (r + len < height && gridStr[r + len][c] !== '#') len++;
          clues.push({
            id: `${num}D`,
            number: num,
            direction: 'down',
            text: downClues[num] || `Down ${num}`,
            row: r,
            col: c,
            length: len
          });
        }
      }
      grid.push(row);
    }

    const puzzle: CrosswordPuzzle = { id, title, width, height, grid, clues };
    this.puzzle.set(puzzle);
    this.grid.set(JSON.parse(JSON.stringify(grid)));
    
    // Find first unblocked cell to set active
    let startR = 0, startC = 0;
    outer: for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (!grid[r][c].isBlocked) {
          startR = r; startC = c;
          break outer;
        }
      }
    }
    
    this.activeRow.set(startR);
    this.activeCol.set(startC);
    this.activeDirection.set('across');
    this.score.set(0);
    this.isVerified.set(false);
    this.resetTimer();
    this.startTimer();
  }

  public setActiveCell(row: number, col: number) {
    const g = this.grid();
    if (g[row] && g[row][col] && !g[row][col].isBlocked) {
      if (this.activeRow() === row && this.activeCol() === col) {
        this.toggleDirection();
      } else {
        this.activeRow.set(row);
        this.activeCol.set(col);
      }
    }
  }

  public toggleDirection() {
    this.activeDirection.update(d => d === 'across' ? 'down' : 'across');
  }

  public setLetter(letter: string) {
    const r = this.activeRow();
    const c = this.activeCol();
    if (r === -1 || c === -1) return;

    // B2. Sanitizar input: A-Z e acentos, normalizar
    const normalized = letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    if (!/^[A-Z]$/.test(normalized)) return;

    const g = [...this.grid()];
    g[r] = [...g[r]];
    g[r][c] = { ...g[r][c], letter: normalized, isCorrect: undefined, isWrong: undefined };
    this.grid.set(g);
    this.isVerified.set(false);

    // B1. Navegação inteligente: avançar dentro da palavra
    this.advanceWithinWord();
  }

  private advanceWithinWord(step: number = 1) {
    const span = this.getActiveSpan();
    if (!span) return;

    const dir = this.activeDirection();
    let r = this.activeRow();
    let c = this.activeCol();

    if (dir === 'across') {
      if (step > 0 && c < span.end) {
        c++;
        while (c <= span.end && this.grid()[r][c]?.isBlocked) c++;
        if (c <= span.end) this.activeCol.set(c);
      } else if (step < 0 && c > span.start) {
        c--;
        while (c >= span.start && this.grid()[r][c]?.isBlocked) c--;
        if (c >= span.start) this.activeCol.set(c);
      }
    } else {
      if (step > 0 && r < span.end) {
        r++;
        while (r <= span.end && this.grid()[r][c]?.isBlocked) r++;
        if (r <= span.end) this.activeRow.set(r);
      } else if (step < 0 && r > span.start) {
        r--;
        while (r >= span.start && this.grid()[r][c]?.isBlocked) r--;
        if (r >= span.start) this.activeRow.set(r);
      }
    }
  }

  private getActiveSpan() {
    const p = this.puzzle();
    const r = this.activeRow();
    const c = this.activeCol();
    const dir = this.activeDirection();
    if (!p || r === -1 || c === -1) return null;

    const clue = this.activeClue();
    if (!clue) return null;

    return {
      start: dir === 'across' ? clue.col : clue.row,
      end: (dir === 'across' ? clue.col : clue.row) + clue.length - 1
    };
  }

  public selectNextWord() {
    const clues = this.activeDirection() === 'across' ? this.acrossClues() : this.downClues();
    const current = this.activeClue();
    if (!current) return;

    const idx = clues.findIndex(c => c.id === current.id);
    const next = clues[(idx + 1) % clues.length];
    this.activeRow.set(next.row);
    this.activeCol.set(next.col);
  }

  public selectPrevWord() {
    const clues = this.activeDirection() === 'across' ? this.acrossClues() : this.downClues();
    const current = this.activeClue();
    if (!current) return;

    const idx = clues.findIndex(c => c.id === current.id);
    const prev = clues[(idx - 1 + clues.length) % clues.length];
    this.activeRow.set(prev.row);
    this.activeCol.set(prev.col);
  }

  public clearLetter() {
    const r = this.activeRow();
    const c = this.activeCol();
    if (r === -1 || c === -1) return;

    const g = [...this.grid()];
    g[r] = [...g[r]];
    
    if (g[r][c].letter !== '') {
      g[r][c] = { ...g[r][c], letter: '', isCorrect: undefined, isWrong: undefined };
      this.grid.set(g);
    } else {
      // If already empty, move back and clear
      this.advanceWithinWord(-1);
      const newR = this.activeRow();
      const newC = this.activeCol();
      if (newR !== r || newC !== c) {
        g[newR] = [...g[newR]];
        g[newR][newC] = { ...g[newR][newC], letter: '', isCorrect: undefined, isWrong: undefined };
        this.grid.set(g);
      }
    }
    this.isVerified.set(false);
  }

  public advanceCursor(step: number) {
    const p = this.puzzle();
    if (!p) return;
    
    let r = this.activeRow();
    let c = this.activeCol();
    const dir = this.activeDirection();

    if (dir === 'across') {
      c += step;
    } else {
      r += step;
    }

    // Check bounds and blocked
    const g = this.grid();
    if (r >= 0 && r < p.height && c >= 0 && c < p.width && !g[r][c].isBlocked) {
      this.activeRow.set(r);
      this.activeCol.set(c);
    }
  }

  public moveCursor(direction: 'up' | 'down' | 'left' | 'right') {
    const p = this.puzzle();
    if (!p) return;

    const currentDir = this.activeDirection();

    // B1. Lógica de setas: mudar direção se for perpendicular
    if ((direction === 'up' || direction === 'down') && currentDir === 'across') {
      this.activeDirection.set('down');
      return;
    }
    if ((direction === 'left' || direction === 'right') && currentDir === 'down') {
      this.activeDirection.set('across');
      return;
    }

    if (direction === 'up' || direction === 'left') {
      this.advanceWithinWord(-1);
    } else {
      this.advanceWithinWord(1);
    }
  }

  public verify() {
    const g = this.grid().map(row => [...row]);
    let correctCount = 0;
    let totalUnblocked = 0;

    for (const row of g) {
      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        if (!cell.isBlocked) {
          totalUnblocked++;
          if (cell.letter === cell.solution) {
            row[c] = { ...cell, isCorrect: true, isWrong: false };
            correctCount++;
          } else if (cell.letter !== '') {
            row[c] = { ...cell, isCorrect: false, isWrong: true };
          } else {
            row[c] = { ...cell, isCorrect: false, isWrong: false };
          }
        }
      }
    }

    this.grid.set(g);
    this.score.set(Math.floor((correctCount / totalUnblocked) * 100));
    this.isVerified.set(true);

    if (correctCount === totalUnblocked) {
      this.stopTimer();
    }
  }

  public restart() {
    const currentPuzzle = this.puzzle();
    if (currentPuzzle) {
      this.loadPuzzle(currentPuzzle.id);
    } else {
      this.loadPuzzle('easy-1');
    }
  }

  private startTimer() {
    this.stopTimer();
    this.startTime = performance.now() - (this.timeElapsed() * 1000);
    this.timerInterval = setInterval(() => {
      const now = performance.now();
      this.timeElapsed.set(Math.floor((now - this.startTime) / 1000));
    }, 100); // Update more frequently for smoothness, but set seconds
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private resetTimer() {
    this.timeElapsed.set(0);
  }
}
