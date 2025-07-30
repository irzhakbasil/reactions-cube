import { 
  ChangeDetectionStrategy, 
  Component, 
  DestroyRef, 
  OnInit, 
  signal,
  computed,
  inject,
  HostListener
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { 
  GameStateService 
} from '../../core/services/game-state.service';
import { 
  AnalyticsService, 
  GameSession 
} from '../../core/services/analytics.service';
import { 
  GameState, 
  GameDifficulty, 
  GameResult,
  GameConfig,
  GameStats,
  GameCell,
  CellState,
  DIFFICULTY_CONFIGS 
} from '../../core/models/game.models';
import { ModalService } from '../../shared/components/modal-component/modal.service';
import { GameResultsModalComponent } from './game-results-modal.component';
import { InputComponent } from '../../shared/components/common-input/common-input.component';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-enhanced-game',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent
  ],
  templateUrl: './enhanced-game.component.html',
  styleUrls: ['./enhanced-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnhancedGameComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameStateService = inject(GameStateService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly modalService = inject(ModalService);
  private readonly fb = inject(FormBuilder);

  // Expose globals to template
  protected readonly Math = Math;
  protected readonly Infinity = Infinity;

  // Reactive state signals
  protected readonly currentState = signal<GameState>(GameState.IDLE);
  protected readonly grid = signal<GameCell[][]>([]);
  protected readonly stats = signal<GameStats>({
    playerScore: 0,
    computerScore: 0,
    totalRounds: 0,
    averageReactionTime: 0,
    bestReactionTime: Infinity,
    missedRounds: 0,
    accuracy: 0
  });
  protected readonly config = signal<GameConfig>({
    gridSize: 10,
    reactionTimeMs: 800,
    roundIntervalMs: 2500,
    maxScore: 10,
    difficulty: GameDifficulty.MEDIUM
  });

  // Computed properties
  protected readonly gameTitle = computed(() => {
    const state = this.currentState();
    const playerScore = this.stats().playerScore;
    const computerScore = this.stats().computerScore;
    
    if (state === GameState.FINISHED) {
      return playerScore > computerScore ? 'Victory!' : 'Game Over';
    }
    return 'Enhanced Reaction Game';
  });

  protected readonly isGameActive = computed(() => {
    const state = this.currentState();
    return state === GameState.PLAYING || state === GameState.PAUSED;
  });

  protected readonly showMetrics = computed(() => {
    return this.stats().totalRounds > 0;
  });

  // Form configuration
  protected readonly configForm = this.fb.group({
    difficulty: [GameDifficulty.MEDIUM, Validators.required],
    reactionTime: [800, [Validators.required, Validators.min(200), Validators.max(3000)]],
    gridSize: [10, [Validators.required, Validators.min(5), Validators.max(15)]]
  });

  protected readonly difficulties = [
    { value: GameDifficulty.EASY, label: 'Easy (1200ms)' },
    { value: GameDifficulty.MEDIUM, label: 'Medium (800ms)' },
    { value: GameDifficulty.HARD, label: 'Hard (600ms)' },
    { value: GameDifficulty.EXPERT, label: 'Expert (400ms)' }
  ];

  // Expose enums to template
  protected readonly GameState = GameState;

  private currentSession: Partial<GameSession> = {};
  private gridStylesCache = signal<{ [key: string]: string }>({});

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    // Trigger grid recalculation on window resize
    this.gridStylesCache.set(this.calculateGridStyles());
  }

  ngOnInit(): void {
    this.initializeGame();
    this.setupSubscriptions();
    this.setupFormHandlers();
    // Initialize grid styles
    this.gridStylesCache.set(this.calculateGridStyles());
  }

  protected startGame(): void {
    const formValue = this.configForm.value;
    const gameConfig: Partial<GameConfig> = {
      difficulty: formValue.difficulty as GameDifficulty,
      reactionTimeMs: formValue.reactionTime!,
      gridSize: formValue.gridSize!,
      maxScore: 10
    };

    this.gameStateService.updateConfig(gameConfig);
    this.gameStateService.startGame();
    
    // Initialize session tracking
    this.currentSession = {
      id: `session-${Date.now()}`,
      startTime: Date.now(),
      difficulty: gameConfig.difficulty!,
      rounds: []
    };
  }

  protected pauseGame(): void {
    this.gameStateService.pauseGame();
  }

  protected resumeGame(): void {
    this.gameStateService.resumeGame();
  }

  protected stopGame(): void {
    this.gameStateService.stopGame();
  }

  protected resetGame(): void {
    this.gameStateService.resetGame();
  }

  protected onCellClick(cellId: string): void {
    this.gameStateService.handleCellClick(cellId);
  }

  protected trackByRow(index: number): number {
    return index;
  }

  protected trackByCell(_index: number, cell: GameCell): string {
    return cell.id;
  }

  protected getCellClasses(cell: GameCell): string {
    const baseClass = 'cell';
    const stateClass = `cell--${cell.state}`;
    const classes = [baseClass, stateClass];
    
    if (cell.reactionTime) {
      const speed = this.getReactionSpeedClass(cell.reactionTime);
      classes.push(`cell--${speed}`);
    }
    
    return classes.join(' ');
  }

  protected getAnimationDuration(cell: GameCell): number {
    return cell.state === CellState.ACTIVE ? this.config().reactionTimeMs : 300;
  }

  protected getProgressPercentage(): number {
    const maxScore = this.config().maxScore;
    const currentMax = Math.max(this.stats().playerScore, this.stats().computerScore);
    return (currentMax / maxScore) * 100;
  }

  protected getGridStyles(): { [key: string]: string } {
    return this.gridStylesCache();
  }

  private calculateGridStyles(): { [key: string]: string } {
    const gridSize = this.config().gridSize;
    const baseSize = Math.min(600, window.innerWidth * 0.9);
    const gap = 4; // 0.25rem в px
    const totalGapSize = gap * (gridSize - 1);
    const availableSize = baseSize - totalGapSize;
    const cellSize = Math.floor(availableSize / gridSize);
    
    return {
      'max-width': `${baseSize}px`,
      'width': `${baseSize}px`,
      'grid-template-columns': `repeat(${gridSize}, ${cellSize}px)`,
      'grid-template-rows': `repeat(${gridSize}, ${cellSize}px)`,
      'justify-content': 'center',
      'align-content': 'center'
    };
  }

  private initializeGame(): void {
    this.gameStateService.initializeGame();
  }

  private setupSubscriptions(): void {
    // Subscribe to game state changes
    combineLatest([
      this.gameStateService.currentState$,
      this.gameStateService.grid$,
      this.gameStateService.stats$,
      this.gameStateService.config$
    ]).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([state, grid, stats, config]) => {
      this.currentState.set(state);
      this.grid.set(grid);
      this.stats.set(stats);
      this.config.set(config);
    });

    // Subscribe to game events
    this.gameStateService.getGameEvents().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => {
      this.handleGameEvent(event);
    });
  }

  private setupFormHandlers(): void {
    // Update reaction time when difficulty changes
    this.configForm.get('difficulty')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(difficulty => {
      if (difficulty) {
        const diffConfig = DIFFICULTY_CONFIGS[difficulty as GameDifficulty];
        if (diffConfig.reactionTimeMs) {
          this.configForm.patchValue({ 
            reactionTime: diffConfig.reactionTimeMs 
          }, { emitEvent: false });
        }
      }
    });

    // Update grid when size changes
    this.configForm.get('gridSize')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(gridSize => {
      if (gridSize && this.currentState() === GameState.IDLE) {
        // Update config and reinitialize grid
        const newConfig = { ...this.config(), gridSize: Number(gridSize) };
        this.gameStateService.updateConfig(newConfig);
        this.gameStateService.initializeGame(newConfig);
        
        // Recalculate grid styles for new size
        this.gridStylesCache.set(this.calculateGridStyles());
      }
    });
  }

  private handleGameEvent(event: { type: string; payload?: any }): void {
    switch (event.type) {
      case 'GAME_STARTED':
        this.onGameStarted();
        break;
      case 'PLAYER_SUCCESS':
        this.onPlayerSuccess(event.payload);
        break;
      case 'COMPUTER_WIN':
        this.onComputerWin(event.payload);
        break;
      case 'GAME_FINISHED':
        this.onGameFinished(event.payload);
        break;
    }
  }

  private onGameStarted(): void {
    // Game started logic - можна додати звукові ефекти тут
  }

  private onPlayerSuccess(payload: { reactionTime: number }): void {
    // Add visual/audio feedback for successful clicks
    this.showReactionFeedback(payload.reactionTime);
  }

  private onComputerWin(_payload: any): void {
    // Add visual feedback for missed clicks
    this.showMissFeedback();
  }

  private onGameFinished(payload: { result: GameResult; stats: any }): void {
    // Complete session tracking
    if (this.currentSession.id) {
      const completedSession: GameSession = {
        ...this.currentSession as GameSession,
        endTime: Date.now(),
        finalStats: payload.stats,
        result: payload.result,
        rounds: this.currentSession.rounds || []
      };
      
      this.analyticsService.recordSession(completedSession);
    }

    // Show results modal
    this.showGameResultsModal(payload);
  }

  private showReactionFeedback(reactionTime: number): void {
    const speed = this.getReactionSpeedClass(reactionTime);
    const messages = {
      lightning: 'Lightning fast! ⚡',
      fast: 'Great reaction! 🎯',
      good: 'Nice job! 👍',
      slow: 'Keep trying! 🎯'
    };
    
    // Could implement toast notifications here
    console.log(messages[speed as keyof typeof messages]);
  }

  private showMissFeedback(): void {
    // Could implement visual shake effect or sound
    console.log('Too slow! 😔');
  }

  private getReactionSpeedClass(reactionTime: number): string {
    if (reactionTime < 300) return 'lightning';
    if (reactionTime < 500) return 'fast';
    if (reactionTime < 700) return 'good';
    return 'slow';
  }

  private showGameResultsModal(payload: { result: GameResult; stats: any }): void {
    const { result, stats } = payload;
    const metrics = this.analyticsService.getPerformanceMetrics();
    
    const title = result === GameResult.PLAYER_WIN ? '🎉 Victory!' : '💀 Game Over';
    const content = `
      <div class="game-results">
        <div class="score-section">
          <h3>🏆 Final Score</h3>
          <div class="score-display">
            <div class="score-item ${stats.playerScore > stats.computerScore ? 'winner' : ''}">
              <span class="label">Player:</span>
              <span class="value">${stats.playerScore}</span>
            </div>
            <div class="score-item ${stats.computerScore > stats.playerScore ? 'winner' : ''}">
              <span class="label">Computer:</span>
              <span class="value">${stats.computerScore}</span>
            </div>
          </div>
        </div>
        
        <div class="performance-section">
          <h3>📊 Performance</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">${stats.accuracy.toFixed(1)}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Average Reaction:</span>
              <span class="stat-value">${stats.averageReactionTime.toFixed(0)}ms</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Best Reaction:</span>
              <span class="stat-value">${stats.bestReactionTime < Infinity ? stats.bestReactionTime.toFixed(0) + 'ms' : 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div class="progress-section">
          <h3>📈 Overall Progress</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Consistency Score:</span>
              <span class="stat-value">${metrics.consistencyScore.toFixed(1)}/100</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Current Streak:</span>
              <span class="stat-value">${metrics.streakLength} games</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Efficiency Rating:</span>
              <span class="stat-value">${metrics.efficiencyRating.toFixed(1)}/100</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Використовуємо правильний API модального сервісу та слухаємо закриття
    const modalRef = this.modalService.open(GameResultsModalComponent, {
      title,
      data: content
    });
    
    // Після закриття модалки скидаємо гру
    modalRef.closed$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.resetGame();
    });
  }
}