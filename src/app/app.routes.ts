import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/enhanced-game',
    pathMatch: 'full'
  },
  {
    path: 'enhanced-game',
    loadComponent: () => import('./features/enhanced-game/enhanced-game.component').then(m => m.EnhancedGameComponent)
  },
  {
    path: 'classic-game',
    loadComponent: () => import('./components/main-game/main-game.component').then(m => m.MainGameComponent)
  },
  {
    path: '**',
    redirectTo: '/enhanced-game'
  }
];
