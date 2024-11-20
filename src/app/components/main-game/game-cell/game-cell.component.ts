import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameCellConditionEnum } from '../../../enums/game-cell-conditions.enums';
import { ConditionalBackgroundDirective } from '../../../directives/background.directive';
import { gameCellObject } from '../../../interfaces/cameCellObjectInterface';
import { GameNames } from '../../../app.component';

export interface RoundResults {
  cellCondition: GameCellConditionEnum,
  playerReactionTime: number;
}

@Component({
  selector: 'game-cell',
  templateUrl: './game-cell.component.html',
  styleUrls: ['./game-cell.component.scss'],
  imports: [CommonModule, ConditionalBackgroundDirective],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameCellComponent {

  @Input() set startCounter(value: gameCellObject) {
    if(value.miliseconds) {
      this.onCounterStart(value.miliseconds);
    }
  }

  @Input() gameName!: GameNames;

  @Input() cubeSize = 40;

  @Output() roundResults = new EventEmitter<RoundResults>()

  isCounterStarted = false;

  gameCellCondition!: GameCellConditionEnum;

  stopCounter$ = new Subject<void>();

  private startTime: number | null = null;

  constructor(
    private cdRef: ChangeDetectorRef
  ) { }

  @HostListener('click') onClick() {
    if(this.gameCellCondition 
        === GameCellConditionEnum.PANDING
        && this.isCounterStarted) {
      this.stopCounter$.next();
      this.gameCellCondition = GameCellConditionEnum.PLAYER_WIN;
      if (this.startTime) {
        const reactionTime = Date.now() - this.startTime;
        this.roundResults.emit({
          cellCondition: this.gameCellCondition,
          playerReactionTime: reactionTime
        });
        // this information we can use to show high scores for example
        console.log(`User clicked in ${reactionTime} ms`);
      }
    }
  }

  onCounterStart(timeInMilliseconds: number) {
    this.gameCellCondition = GameCellConditionEnum.PANDING;
    this.isCounterStarted = true;
    this.startTime = Date.now();
    timer(timeInMilliseconds).pipe(
      takeUntil(this.stopCounter$)
    ).subscribe(res=> {
      this.isCounterStarted = false;
      this.gameCellCondition = GameCellConditionEnum.COMPUTER_WIN;
      this.roundResults.emit({
        cellCondition: this.gameCellCondition,
        playerReactionTime: 0
      });
      this.stopCounter$.next()
      this.cdRef.markForCheck();
    });
  }
}
