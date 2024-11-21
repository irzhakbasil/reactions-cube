import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ConditionalBackgroundDirective } from '../../../directives/background.directive';
import { GameCellConditionEnum } from '../../../enums/game-cell-conditions.enums';
import { Subject, timer, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reaction-cube',
  standalone: true,
  imports: [CommonModule, ConditionalBackgroundDirective],
  templateUrl: './reaction-cube.component.html',
  styleUrl: './reaction-cube.component.scss'
})
export class ReactionCubeComponent implements OnDestroy {
  @Output() cubeClicked = new EventEmitter<any>();
  
  gameCellCondition: GameCellConditionEnum = GameCellConditionEnum.UNTOUCHED;
  cubeSize = 200;
  private startTime!: number;
  private destroy$ = new Subject<void>();
  private timerSubscription?: Subscription;
  
  @Input() disableClick: boolean = false;
  @Input() set counterStarted(val: boolean) {
    if(val) {
      this.startCounter();
    }
  }

  private startCounter() {
    const randomDelay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
    
    this.timerSubscription = timer(randomDelay)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.gameCellCondition = GameCellConditionEnum.PANDING;
        this.startTime = Date.now();
      });
  }

  onCubeClick() {
    if(!this.disableClick) {
      if (this.gameCellCondition === GameCellConditionEnum.UNTOUCHED) {
        this.cubeClicked.emit(); // Too early
        this.timerSubscription?.unsubscribe();
      } else if (this.gameCellCondition === GameCellConditionEnum.PANDING) {
        const reactionTime = Date.now() - this.startTime;
        this.cubeClicked.emit(reactionTime);
      }
    }
  }

  reset() {
    this.gameCellCondition = GameCellConditionEnum.UNTOUCHED;
    this.timerSubscription?.unsubscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}