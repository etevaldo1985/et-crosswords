import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CrosswordBoardComponent } from '../crossword-board/crossword-board';
import { ClueListComponent } from '../clue-list/clue-list';
import { GameControlsComponent } from '../game-controls/game-controls';
import { CrosswordService } from '../../services/crossword.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, CrosswordBoardComponent, ClueListComponent, GameControlsComponent, MatIconModule, MatButtonModule],
  templateUrl: './game.html',
  styleUrl: './game.css'
})
export class GameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private crosswordService = inject(CrosswordService);

  ngOnInit() {
    const puzzleId = this.route.snapshot.paramMap.get('id');
    if (puzzleId) {
      this.crosswordService.loadPuzzle(puzzleId);
    } else {
      this.router.navigate(['/home']);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
