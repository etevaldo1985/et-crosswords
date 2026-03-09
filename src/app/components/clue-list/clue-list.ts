import { Component, inject } from '@angular/core';
import { CrosswordService } from '../../services/crossword.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-clue-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatCardModule],
  templateUrl: './clue-list.html',
  styleUrl: './clue-list.css'
})
export class ClueListComponent {
  private crosswordService = inject(CrosswordService);

  acrossClues = this.crosswordService.acrossClues;
  downClues = this.crosswordService.downClues;
  activeClue = this.crosswordService.activeClue;

  isActiveClue(clueId: string): boolean {
    return this.activeClue()?.id === clueId;
  }

  onClueClick(row: number, col: number, direction: 'across' | 'down') {
    this.crosswordService.activeDirection.set(direction);
    this.crosswordService.setActiveCell(row, col);
  }
}
