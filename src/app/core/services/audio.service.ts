import { Injectable } from '@angular/core';

export enum SoundEffect {
  GAME_START = 'game-start',
  CELL_ACTIVATE = 'cell-activate',
  SUCCESS = 'success',
  MISS = 'miss',
  GAME_WIN = 'game-win',
  GAME_OVER = 'game-over',
  CLICK = 'click',
  LIGHTNING = 'lightning'
}

interface AudioConfig {
  volume: number;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private config: AudioConfig = {
    volume: 0.5,
    enabled: true
  };

  constructor() {
    this.initializeAudioContext();
    this.loadConfig();
  }

  public playSound(effect: SoundEffect, volume?: number): void {
    if (!this.config.enabled || !this.audioContext) return;

    const effectVolume = volume ?? this.config.volume;
    
    switch (effect) {
      case SoundEffect.GAME_START:
        this.playTone(440, 0.1, 'sine', effectVolume);
        setTimeout(() => this.playTone(554, 0.1, 'sine', effectVolume), 100);
        break;
        
      case SoundEffect.CELL_ACTIVATE:
        this.playTone(880, 0.05, 'square', effectVolume * 0.3);
        break;
        
      case SoundEffect.SUCCESS:
        this.playSuccessSound(effectVolume);
        break;
        
      case SoundEffect.LIGHTNING:
        this.playLightningSound(effectVolume);
        break;
        
      case SoundEffect.MISS:
        this.playTone(220, 0.3, 'sawtooth', effectVolume);
        break;
        
      case SoundEffect.GAME_WIN:
        this.playVictoryFanfare(effectVolume);
        break;
        
      case SoundEffect.GAME_OVER:
        this.playGameOverSound(effectVolume);
        break;
        
      case SoundEffect.CLICK:
        this.playTone(800, 0.05, 'sine', effectVolume * 0.2);
        break;
    }
  }

  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.saveConfig();
  }

  public toggleEnabled(): void {
    this.config.enabled = !this.config.enabled;
    this.saveConfig();
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public getVolume(): number {
    return this.config.volume;
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context on user interaction
      document.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
      document.addEventListener('keydown', this.resumeAudioContext.bind(this), { once: true });
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private resumeAudioContext(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private playTone(
    frequency: number, 
    duration: number, 
    waveType: OscillatorType = 'sine',
    volume: number = 0.5
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = waveType;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private playSuccessSound(volume: number): void {
    // Play ascending arpeggio for success
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', volume);
      }, index * 50);
    });
  }

  private playLightningSound(volume: number): void {
    // Quick burst of high frequencies for lightning-fast reactions
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(1200 + Math.random() * 800, 0.03, 'square', volume * 0.3);
      }, i * 10);
    }
  }

  private playVictoryFanfare(volume: number): void {
    // Victory fanfare: C-E-G-C major chord progression
    const melody = [
      { freq: 523, time: 0 },    // C5
      { freq: 659, time: 200 },  // E5
      { freq: 784, time: 400 },  // G5
      { freq: 1047, time: 600 }, // C6
      { freq: 1047, time: 800 }, // C6 (repeat)
    ];

    melody.forEach(note => {
      setTimeout(() => {
        this.playTone(note.freq, 0.4, 'sine', volume);
      }, note.time);
    });
  }

  private playGameOverSound(volume: number): void {
    // Descending chromatic scale for game over
    const notes = [440, 415, 392, 370, 349]; // A4 down
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'triangle', volume);
      }, index * 200);
    });
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('audio-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load audio config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('audio-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save audio config:', error);
    }
  }
}