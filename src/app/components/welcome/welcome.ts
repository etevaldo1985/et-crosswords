import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class WelcomeComponent {
  private authService = inject(AuthService);
  
  isLoggingIn = this.authService.isLoggingIn;
  loginError = this.authService.loginError;

  login() {
    this.authService.loginWithGoogle();
  }
}
