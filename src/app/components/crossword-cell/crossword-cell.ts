import { Component, input, output } from '@angular/core';
import { CrosswordCell } from '../../models/crossword.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crossword-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crossword-cell.html',
  styleUrl: './crossword-cell.css'
})
export class CrosswordCellComponent {
  cell = input.required<CrosswordCell>();
  isActive = input<boolean>(false);
  isHighlighted = input<boolean>(false);
  
  cellClick = output<{row: number, col: number}>();

  onClick() {
    if (!this.cell().isBlocked) {
      this.cellClick.emit({ row: this.cell().row, col: this.cell().col });
    }
  }
}
