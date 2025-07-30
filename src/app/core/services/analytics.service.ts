import { Injectable } from '@angular/core';
import { GameStats, GameRound, GameResult, GameDifficulty } from '../models/game.models';

export interface GameSession {
  id: string;
  startTime: number;
  endTime?: number;
  difficulty: GameDifficulty;
  finalStats: GameStats;
  result: GameResult;
  rounds: GameRound[];
}

export interface PerformanceMetrics {
  averageReactionTime: number;
  consistencyScore: number; // Lower standard deviation = higher consistency
  improvementTrend: number; // Positive = improving, negative = declining
  streakLength: number;
  efficiencyRating: number; // Reaction time vs difficulty
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly STORAGE_KEY = 'reaction-game-sessions';
  private sessions: GameSession[] = [];

  constructor() {
    this.loadSessionsFromStorage();
  }

  public recordSession(session: GameSession): void {
    this.sessions.push(session);
    this.saveSessionsToStorage();
  }

  public getPerformanceMetrics(sessions: GameSession[] = this.sessions): PerformanceMetrics {
    if (sessions.length === 0) {
      return this.getDefaultMetrics();
    }

    const reactionTimes = this.extractReactionTimes(sessions);
    const averageReactionTime = this.calculateAverage(reactionTimes);
    const consistencyScore = this.calculateConsistency(reactionTimes);
    const improvementTrend = this.calculateImprovementTrend(sessions);
    const streakLength = this.calculateStreakLength(sessions);
    const efficiencyRating = this.calculateEfficiencyRating(sessions);

    return {
      averageReactionTime,
      consistencyScore,
      improvementTrend,
      streakLength,
      efficiencyRating
    };
  }

  public getSessionHistory(): GameSession[] {
    return [...this.sessions];
  }

  public getStatsByDifficulty(): Record<GameDifficulty, Partial<PerformanceMetrics>> {
    const result = {} as Record<GameDifficulty, Partial<PerformanceMetrics>>;
    
    Object.values(GameDifficulty).forEach(difficulty => {
      const difficultySessions = this.sessions.filter(s => s.difficulty === difficulty);
      if (difficultySessions.length > 0) {
        result[difficulty] = this.getPerformanceMetrics(difficultySessions);
      }
    });

    return result;
  }

  public clearHistory(): void {
    this.sessions = [];
    this.saveSessionsToStorage();
  }

  public exportData(): string {
    return JSON.stringify(this.sessions, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData) as GameSession[];
      if (this.validateSessionData(imported)) {
        this.sessions = imported;
        this.saveSessionsToStorage();
        return true;
      }
    } catch (error) {
      console.error('Failed to import data:', error);
    }
    return false;
  }

  private extractReactionTimes(sessions: GameSession[]): number[] {
    return sessions
      .flatMap(session => session.rounds)
      .filter(round => round.reactionTime && round.result === 'success')
      .map(round => round.reactionTime!)
      .filter(time => time > 0);
  }

  private calculateAverage(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
  }

  private calculateConsistency(reactionTimes: number[]): number {
    if (reactionTimes.length < 2) return 100;
    
    const mean = this.calculateAverage(reactionTimes);
    const variance = reactionTimes
      .reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / reactionTimes.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to consistency score (0-100, higher is better)
    const maxExpectedStdDev = mean * 0.5; // 50% of mean as maximum expected deviation
    return Math.max(0, Math.min(100, 100 - (standardDeviation / maxExpectedStdDev) * 100));
  }

  private calculateImprovementTrend(sessions: GameSession[]): number {
    if (sessions.length < 2) return 0;

    const recentSessions = sessions.slice(-10); // Last 10 sessions
    const reactionTimes = recentSessions.map(session => 
      this.calculateAverage(this.extractReactionTimesFromSession(session))
    ).filter(time => time > 0);

    if (reactionTimes.length < 2) return 0;

    // Calculate linear regression slope
    const n = reactionTimes.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ...
    const sumY = reactionTimes.reduce((sum, time) => sum + time, 0);
    const sumXY = reactionTimes.reduce((sum, time, index) => sum + index * time, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Negative slope means improvement (lower reaction times)
    return -slope;
  }

  private calculateStreakLength(sessions: GameSession[]): number {
    let currentStreak = 0;
    
    for (let i = sessions.length - 1; i >= 0; i--) {
      if (sessions[i].result === GameResult.PLAYER_WIN) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  }

  private calculateEfficiencyRating(sessions: GameSession[]): number {
    if (sessions.length === 0) return 0;

    const ratings = sessions.map(session => {
      const avgReactionTime = this.calculateAverage(this.extractReactionTimesFromSession(session));
      const difficultyMultiplier = this.getDifficultyMultiplier(session.difficulty);
      const winRate = session.finalStats.accuracy / 100;
      
      // Lower reaction time and higher win rate = higher efficiency
      const baseScore = winRate * 100;
      const timeBonus = Math.max(0, 100 - (avgReactionTime * difficultyMultiplier / 10));
      
      return (baseScore + timeBonus) / 2;
    });

    return this.calculateAverage(ratings);
  }

  private getDifficultyMultiplier(difficulty: GameDifficulty): number {
    const multipliers = {
      [GameDifficulty.EASY]: 0.5,
      [GameDifficulty.MEDIUM]: 1.0,
      [GameDifficulty.HARD]: 1.5,
      [GameDifficulty.EXPERT]: 2.0
    };
    return multipliers[difficulty];
  }

  private extractReactionTimesFromSession(session: GameSession): number[] {
    return session.rounds
      .filter(round => round.reactionTime && round.result === 'success')
      .map(round => round.reactionTime!)
      .filter(time => time > 0);
  }

  private getDefaultMetrics(): PerformanceMetrics {
    return {
      averageReactionTime: 0,
      consistencyScore: 0,
      improvementTrend: 0,
      streakLength: 0,
      efficiencyRating: 0
    };
  }

  private validateSessionData(data: any[]): boolean {
    return Array.isArray(data) && data.every(session => 
      session.id && 
      session.startTime && 
      session.difficulty && 
      session.finalStats && 
      session.result && 
      Array.isArray(session.rounds)
    );
  }

  private loadSessionsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (this.validateSessionData(parsed)) {
          this.sessions = parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load sessions from storage:', error);
    }
  }

  private saveSessionsToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Failed to save sessions to storage:', error);
    }
  }
}