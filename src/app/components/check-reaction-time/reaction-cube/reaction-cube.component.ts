import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ConditionalBackgroundDirective } from '../../../directives/background.directive';
import { GameCellConditionEnum } from '../../../enums/app-colors-enum';

@Component({
  selector: 'app-reaction-cube',
  standalone: true,
  imports: [CommonModule, ConditionalBackgroundDirective],
  templateUrl: './reaction-cube.component.html',
  styleUrl: './reaction-cube.component.scss'
})
export class ReactionCubeComponent {
  @Output() cubeClicked = new EventEmitter<any>();
  
  gameCellCondition: GameCellConditionEnum = GameCellConditionEnum.UNTOUCHED;
  cubeSize = 200;
  private changeTimeout: any;
  private startTime!: number;
  @Input() disableClick: boolean = false;
  @Input() set counterStarted(val: boolean) {
    if(val) {
      this.startCounter();
    }
  }

  private startCounter() {
    const randomDelay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000; // 2-5 seconds
    this.changeTimeout = setTimeout(() => {
      this.gameCellCondition = GameCellConditionEnum.PANDING;
      this.startTime = Date.now();
    }, randomDelay);
  }

  onCubeClick() {
    if(!this.disableClick) {
      if (this.gameCellCondition === GameCellConditionEnum.UNTOUCHED) {
        this.cubeClicked.emit(); // Too erly
        clearTimeout(this.changeTimeout);
      } else if (this.gameCellCondition === GameCellConditionEnum.PANDING) {
        const reactionTime = Date.now() - this.startTime;
        this.cubeClicked.emit(reactionTime);
      }
    }
  }

  reset() {
    this.gameCellCondition = GameCellConditionEnum.UNTOUCHED;
    clearTimeout(this.changeTimeout);
  }
}