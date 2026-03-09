import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CrosswordService } from '../../services/crossword.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private crosswordService = inject(CrosswordService);
  private router = inject(Router);

  user = this.authService.user;
  isAdmin = this.authService.isAdmin;
  
  allPuzzles = this.crosswordService.availablePuzzles;
  isLoading = this.crosswordService.isLoadingPuzzles;
  isGenerating = this.crosswordService.isGeneratingPuzzle;
  
  selectedDifficulty = signal<'easy' | 'medium' | 'hard'>('easy');
  selectedLanguage = signal<'en' | 'pt'>('en');
  
  ngOnInit() {
    this.authService.refreshAdminClaim();
  }
  
  displayedPuzzles = computed(() => {
    return this.allPuzzles().filter(p => p.difficulty === this.selectedDifficulty() && p.language === this.selectedLanguage());
  });

  selectDifficulty(diff: 'easy' | 'medium' | 'hard') {
    this.selectedDifficulty.set(diff);
  }

  selectLanguage(lang: 'en' | 'pt') {
    this.selectedLanguage.set(lang);
  }

  logout() {
    this.authService.logout();
  }

  playPuzzle(id: string) {
    this.router.navigate(['/game', id]);
  }

  async generatePuzzle() {
    try {
      const newId = await this.crosswordService.generateNewPuzzle(this.selectedDifficulty(), this.selectedLanguage());
      if (newId) {
        this.playPuzzle(newId);
      }
    } catch (error) {
      console.error("Failed to generate puzzle", error);
      alert("Failed to generate a new puzzle. Please try again.");
    }
  }
}
