import {Routes} from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome';
import { HomeComponent } from './components/home/home';
import { GameComponent } from './components/game/game';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'game/:id', component: GameComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', redirectTo: '/welcome' }
];
