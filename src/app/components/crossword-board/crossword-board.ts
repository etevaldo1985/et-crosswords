import { Component, inject, HostListener } from '@angular/core';
import { CrosswordService } from '../../services/crossword.service';
import { CrosswordCellComponent } from '../crossword-cell/crossword-cell';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-crossword-board',
  standalone: true,
  imports: [CommonModule, CrosswordCellComponent, MatCardModule],
  templateUrl: './crossword-board.html',
  styleUrl: './crossword-board.css'
})
export class CrosswordBoardComponent {
  private crosswordService = inject(CrosswordService);

  puzzle = this.crosswordService.puzzle;
  grid = this.crosswordService.grid;
  activeRow = this.crosswordService.activeRow;
  activeCol = this.crosswordService.activeCol;
  activeDirection = this.crosswordService.activeDirection;
  activeClue = this.crosswordService.activeClue;
  timeElapsed = this.crosswordService.timeElapsed;
  score = this.crosswordService.score;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const isHiddenInput = event.target instanceof HTMLInputElement && event.target.className.indexOf('opacity-0') !== -1;

    // Ignore if typing in an actual input field (other than our hidden one)
    if (event.target instanceof HTMLInputElement && !isHiddenInput) {
      return;
    }

    if (this.activeRow() === -1 || this.activeCol() === -1) return;

    const key = event.key;

    if (key.length === 1 && key.match(/^[a-zA-Z]$/)) {
      if (isHiddenInput) {
        // Let the 'input' event handle it to prevent duplicates
        return;
      }
      this.crosswordService.setLetter(key);
    } else if (key === 'Backspace' || key === 'Delete') {
      this.crosswordService.clearLetter();
      if (isHiddenInput) {
        event.preventDefault();
      }
    } else if (key === 'ArrowUp') {
      this.crosswordService.moveCursor('up');
      event.preventDefault();
    } else if (key === 'ArrowDown') {
      this.crosswordService.moveCursor('down');
      event.preventDefault();
    } else if (key === 'ArrowLeft') {
      this.crosswordService.moveCursor('left');
      event.preventDefault();
    } else if (key === 'ArrowRight') {
      this.crosswordService.moveCursor('right');
      event.preventDefault();
    } else if (key === 'Enter' || key === ' ') {
      this.crosswordService.toggleDirection();
      event.preventDefault();
    } else if (key === 'Tab') {
      if (event.shiftKey) {
        this.crosswordService.selectPrevWord();
      } else {
        this.crosswordService.selectNextWord();
      }
      event.preventDefault();
    }
  }

  onInput(event: Event, inputEl: HTMLInputElement) {
    const val = inputEl.value;
    
    if (val === '') {
      // Backspace was pressed on mobile
      this.crosswordService.clearLetter();
    } else if (val && val.length > 0) {
      const char = val.charAt(val.length - 1);
      if (char.match(/[a-zA-Z]/)) {
        this.crosswordService.setLetter(char);
      }
    }
    
    // Keep input with a space so we can always catch backspace
    inputEl.value = ' ';
  }

  onBlur() {
    // Try to keep focus on mobile if they didn't explicitly click away
    // This is tricky, so we just let it blur for now
  }

  focusInput(inputEl: HTMLInputElement) {
    inputEl.focus();
    // Ensure there's a space so backspace works on mobile
    if (!inputEl.value) {
      inputEl.value = ' ';
    }
  }

  onCellClick(row: number, col: number, inputEl: HTMLInputElement) {
    this.crosswordService.setActiveCell(row, col);
    this.focusInput(inputEl);
  }

  isActive(row: number, col: number): boolean {
    return this.activeRow() === row && this.activeCol() === col;
  }

  isHighlighted(row: number, col: number): boolean {
    const clue = this.activeClue();
    if (!clue) return false;

    if (clue.direction === 'across') {
      return row === clue.row && col >= clue.col && col < clue.col + clue.length;
    } else {
      return col === clue.col && row >= clue.row && row < clue.row + clue.length;
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
