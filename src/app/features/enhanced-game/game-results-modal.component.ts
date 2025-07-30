import { Component } from '@angular/core';

@Component({
  selector: 'app-game-results-modal',
  standalone: true,
  templateUrl: './game-results-modal.component.html',
  styles: [`
    :host {
      display: block;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
    }
    
    :host ::ng-deep .game-results {
      max-width: 500px;
      margin: 0 auto;
    }
    
    :host ::ng-deep .game-results h3 {
      margin: 1.5rem 0 1rem 0;
      color: #2d3748;
      font-size: 1.125rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    :host ::ng-deep .game-results h3:first-child {
      margin-top: 0;
    }
    
    :host ::ng-deep .score-section {
      margin-bottom: 2rem;
    }
    
    :host ::ng-deep .score-display {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }
    
    :host ::ng-deep .score-item {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      flex: 1;
      border: 2px solid transparent;
      transition: all 0.2s ease;
    }
    
    :host ::ng-deep .score-item.winner {
      background: #f0fff4;
      border-color: #48bb78;
      box-shadow: 0 0 0 1px rgba(72, 187, 120, 0.1);
    }
    
    :host ::ng-deep .score-item .label {
      display: block;
      font-size: 0.875rem;
      color: #718096;
      margin-bottom: 0.25rem;
    }
    
    :host ::ng-deep .score-item .value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
    }
    
    :host ::ng-deep .performance-section,
    :host ::ng-deep .progress-section {
      margin-bottom: 1.5rem;
    }
    
    :host ::ng-deep .stats-grid {
      display: grid;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    
    :host ::ng-deep .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-radius: 6px;
      border-left: 4px solid #4299e1;
    }
    
    :host ::ng-deep .stat-label {
      font-size: 0.9rem;
      color: #4a5568;
      font-weight: 500;
    }
    
    :host ::ng-deep .stat-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #2d3748;
    }
    
    @media (max-width: 480px) {
      :host ::ng-deep .score-display {
        flex-direction: column;
      }
      
      :host ::ng-deep .stat-item {
        flex-direction: column;
        text-align: center;
        gap: 0.25rem;
      }
    }
  `]
})
export class GameResultsModalComponent {
  content = '';
}