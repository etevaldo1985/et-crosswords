import { Component, inject } from '@angular/core';
import { CrosswordService } from '../../services/crossword.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-game-controls',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './game-controls.html',
  styleUrl: './game-controls.css'
})
export class GameControlsComponent {
  private crosswordService = inject(CrosswordService);

  isVerified = this.crosswordService.isVerified;
  score = this.crosswordService.score;

  onVerify() {
    this.crosswordService.verify();
  }

  onRestart() {
    this.crosswordService.restart();
  }
}
