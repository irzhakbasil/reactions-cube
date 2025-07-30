import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval, timer, merge } from 'rxjs';
import { map, takeUntil, filter, switchMap, tap } from 'rxjs/operators';
import { 
  GameCell, 
  CellState, 
  GameState, 
  GameConfig, 
  GameStats, 
  GameRound, 
  GameResult,
  DEFAULT_GAME_CONFIG 
} from '../models/game.models';

interface GameStateInternal {
  grid: GameCell[][];
  currentRound: GameRound | null;
  stats: GameStats;
  state: GameState;
  config: GameConfig;
  activeCell: GameCell | null;
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly destroy$ = new Subject<void>();
  private readonly gameStateSubject = new BehaviorSubject<GameStateInternal>(this.createInitialState());
  private readonly gameEventsSubject = new Subject<{ type: string; payload?: any }>();
  
  // Public observables
  public readonly gameState$ = this.gameStateSubject.asObservable();
  public readonly grid$ = this.gameState$.pipe(map(state => state.grid));
  public readonly stats$ = this.gameState$.pipe(map(state => state.stats));
  public readonly currentState$ = this.gameState$.pipe(map(state => state.state));
  public readonly config$ = this.gameState$.pipe(map(state => state.config));
  public readonly activeCell$ = this.gameState$.pipe(map(state => state.activeCell));

  private gameTimer$ = new Subject<void>();

  constructor() {
    this.setupGameLoop();
  }

  public initializeGame(config: Partial<GameConfig> = {}): void {
    const mergedConfig = { ...DEFAULT_GAME_CONFIG, ...config };
    const newState: GameStateInternal = {
      ...this.createInitialState(),
      config: mergedConfig,
      grid: this.createGrid(mergedConfig.gridSize)
    };
    
    this.gameStateSubject.next(newState);
    this.gameEventsSubject.next({ type: 'GAME_INITIALIZED', payload: mergedConfig });
  }

  public startGame(): void {
    const currentState = this.gameStateSubject.value;
    if (currentState.state !== GameState.IDLE) return;

    this.updateState({
      state: GameState.PLAYING,
      stats: this.resetStats()
    });

    this.gameTimer$.next();
    this.gameEventsSubject.next({ type: 'GAME_STARTED' });
  }

  public pauseGame(): void {
    if (this.gameStateSubject.value.state === GameState.PLAYING) {
      this.updateState({ state: GameState.PAUSED });
      this.gameEventsSubject.next({ type: 'GAME_PAUSED' });
    }
  }

  public resumeGame(): void {
    if (this.gameStateSubject.value.state === GameState.PAUSED) {
      this.updateState({ state: GameState.PLAYING });
      this.gameTimer$.next();
      this.gameEventsSubject.next({ type: 'GAME_RESUMED' });
    }
  }

  public stopGame(): void {
    const currentState = this.gameStateSubject.value;
    this.updateState({ 
      state: GameState.IDLE,
      grid: this.createGrid(currentState.config.gridSize),
      activeCell: null,
      currentRound: null
    });
    this.gameEventsSubject.next({ type: 'GAME_STOPPED' });
  }

  public resetGame(): void {
    const currentState = this.gameStateSubject.value;
    this.updateState({
      state: GameState.IDLE,
      grid: this.createGrid(currentState.config.gridSize),
      stats: this.resetStats(),
      activeCell: null,
      currentRound: null
    });
    this.gameEventsSubject.next({ type: 'GAME_RESET' });
  }

  public handleCellClick(cellId: string): void {
    const currentState = this.gameStateSubject.value;
    const { activeCell, currentRound } = currentState;

    if (!activeCell || !currentRound || activeCell.id !== cellId) {
      return;
    }

    const reactionTime = Date.now() - currentRound.startTime;
    this.processPlayerSuccess(activeCell, reactionTime);
  }

  public updateConfig(config: Partial<GameConfig>): void {
    const currentState = this.gameStateSubject.value;
    this.updateState({
      config: { ...currentState.config, ...config }
    });
    this.gameEventsSubject.next({ type: 'CONFIG_UPDATED', payload: config });
  }

  public getGameEvents(): Observable<{ type: string; payload?: any }> {
    return this.gameEventsSubject.asObservable();
  }

  private setupGameLoop(): void {
    this.gameTimer$.pipe(
      switchMap(() => this.createGameRound()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private createGameRound(): Observable<void> {
    const currentState = this.gameStateSubject.value;
    if (currentState.state !== GameState.PLAYING) {
      return new Subject<void>().asObservable();
    }

    return interval(currentState.config.roundIntervalMs).pipe(
      tap(() => this.startRound()),
      takeUntil(merge(
        this.gameEventsSubject.pipe(filter(event => 
          ['GAME_STOPPED', 'GAME_PAUSED', 'GAME_FINISHED'].includes(event.type)
        )),
        // Також слухаємо зміни стану гри для зупинки таймера
        this.gameStateSubject.pipe(
          filter(state => state.state === GameState.FINISHED || state.state === GameState.IDLE)
        ),
        this.destroy$
      ))
    ).pipe(map(() => void 0));
  }

  private startRound(): void {
    const currentState = this.gameStateSubject.value;
    
    // Перевіряємо чи гра ще активна
    if (currentState.state !== GameState.PLAYING) {
      return;
    }
    
    
    const availableCells = this.getAvailableCells();
    
    if (availableCells.length === 0) return;

    const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    const activeCell = this.activateCell(randomCell);
    
    const round: GameRound = {
      roundNumber: currentState.stats.totalRounds + 1,
      activeCell,
      startTime: Date.now(),
      result: 'timeout'
    };

    this.updateState({
      activeCell,
      currentRound: round,
      grid: this.updateGridWithActiveCell(currentState.grid, activeCell)
    });

    // Set timeout for computer win з додатковими перевірками
    timer(currentState.config.reactionTimeMs).pipe(
      takeUntil(merge(
        this.gameEventsSubject.pipe(
          filter(event => [
            'PLAYER_SUCCESS', 
            'ROUND_ENDED', 
            'GAME_STOPPED', 
            'GAME_PAUSED', 
            'GAME_FINISHED',
            'GAME_RESET'
          ].includes(event.type))
        ),
        // Також слухаємо зміни стану гри
        this.gameStateSubject.pipe(
          filter(state => state.state !== GameState.PLAYING)
        ),
        this.destroy$
      ))
    ).subscribe(() => {
      // Додаткова перевірка стану перед обробкою програшу комп'ютера
      const state = this.gameStateSubject.value;
      if (state.state === GameState.PLAYING && state.activeCell?.id === activeCell.id) {
        this.processComputerWin();
      }
    });
  }

  private processPlayerSuccess(cell: GameCell, reactionTime: number): void {
    const currentState = this.gameStateSubject.value;
    
    // Перевіряємо чи гра ще активна
    if (currentState.state !== GameState.PLAYING) {
      return;
    }
    
    // Додаткова перевірка: чи є активна клітинка і чи це правильна клітинка
    if (!currentState.activeCell || currentState.activeCell.id !== cell.id) {
      return;
    }
    
    const updatedCell = { ...cell, state: CellState.SUCCESS, reactionTime };
    
    const newStats = this.updateStatsForPlayerWin(currentState.stats, reactionTime);
    
    this.updateState({
      grid: this.updateGridWithCell(currentState.grid, updatedCell),
      stats: newStats,
      activeCell: null,
      currentRound: null
    });

    this.gameEventsSubject.next({ 
      type: 'PLAYER_SUCCESS', 
      payload: { reactionTime, cell: updatedCell } 
    });

    this.checkGameEnd(newStats);
  }

  private processComputerWin(): void {
    const currentState = this.gameStateSubject.value;
    
    // Перевіряємо чи гра ще активна і є активна клітинка
    if (currentState.state !== GameState.PLAYING || !currentState.activeCell) {
      return;
    }

    const updatedCell = { ...currentState.activeCell, state: CellState.FAILED };
    const newStats = this.updateStatsForComputerWin(currentState.stats);
    
    this.updateState({
      grid: this.updateGridWithCell(currentState.grid, updatedCell),
      stats: newStats,
      activeCell: null,
      currentRound: null
    });

    this.gameEventsSubject.next({ 
      type: 'COMPUTER_WIN', 
      payload: { cell: updatedCell } 
    });

    this.checkGameEnd(newStats);
  }

  private checkGameEnd(stats: GameStats): void {
    const { config } = this.gameStateSubject.value;
    
    if (stats.playerScore >= config.maxScore) {
      this.endGame(GameResult.PLAYER_WIN);
    } else if (stats.computerScore >= config.maxScore) {
      this.endGame(GameResult.COMPUTER_WIN);
    }
  }

  private endGame(result: GameResult): void {
    this.updateState({ 
      state: GameState.FINISHED,
      activeCell: null,
      currentRound: null
    });
    this.gameEventsSubject.next({ 
      type: 'GAME_FINISHED', 
      payload: { result, stats: this.gameStateSubject.value.stats } 
    });
  }

  private createInitialState(): GameStateInternal {
    return {
      grid: [],
      currentRound: null,
      stats: this.resetStats(),
      state: GameState.IDLE,
      config: DEFAULT_GAME_CONFIG,
      activeCell: null
    };
  }

  private createGrid(size: number): GameCell[][] {
    return Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) => ({
        id: `cell-${row}-${col}`,
        row,
        col,
        state: CellState.IDLE
      }))
    );
  }

  private resetStats(): GameStats {
    return {
      playerScore: 0,
      computerScore: 0,
      totalRounds: 0,
      averageReactionTime: 0,
      bestReactionTime: Infinity,
      missedRounds: 0,
      accuracy: 0
    };
  }

  private getAvailableCells(): GameCell[] {
    return this.gameStateSubject.value.grid
      .flat()
      .filter(cell => cell.state === CellState.IDLE);
  }

  private activateCell(cell: GameCell): GameCell {
    return {
      ...cell,
      state: CellState.ACTIVE,
      timestamp: Date.now()
    };
  }

  private updateGridWithActiveCell(grid: GameCell[][], activeCell: GameCell): GameCell[][] {
    return grid.map(row =>
      row.map(cell =>
        cell.id === activeCell.id ? activeCell : cell
      )
    );
  }

  private updateGridWithCell(grid: GameCell[][], updatedCell: GameCell): GameCell[][] {
    return grid.map(row =>
      row.map(cell =>
        cell.id === updatedCell.id ? updatedCell : cell
      )
    );
  }

  private updateStatsForPlayerWin(stats: GameStats, reactionTime: number): GameStats {
    const newTotalRounds = stats.totalRounds + 1;
    const newBestTime = Math.min(stats.bestReactionTime, reactionTime);
    const newAverageTime = stats.totalRounds === 0 
      ? reactionTime 
      : (stats.averageReactionTime * stats.totalRounds + reactionTime) / newTotalRounds;

    return {
      ...stats,
      playerScore: stats.playerScore + 1,
      totalRounds: newTotalRounds,
      averageReactionTime: newAverageTime,
      bestReactionTime: newBestTime,
      accuracy: ((stats.playerScore + 1) / newTotalRounds) * 100
    };
  }

  private updateStatsForComputerWin(stats: GameStats): GameStats {
    const newTotalRounds = stats.totalRounds + 1;
    
    return {
      ...stats,
      computerScore: stats.computerScore + 1,
      totalRounds: newTotalRounds,
      missedRounds: stats.missedRounds + 1,
      accuracy: (stats.playerScore / newTotalRounds) * 100
    };
  }

  private updateState(partialState: Partial<GameStateInternal>): void {
    const currentState = this.gameStateSubject.value;
    this.gameStateSubject.next({ ...currentState, ...partialState });
  }

  public destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}