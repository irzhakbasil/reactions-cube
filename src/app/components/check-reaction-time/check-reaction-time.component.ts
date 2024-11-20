import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonButtonComponent } from '../../shared/components/common-button/common-button.component';
import { CommonModule } from '@angular/common';
import { GameNames } from '../../app.component';
import { ReactionCubeComponent } from './reaction-cube/reaction-cube.component';
import { timer } from 'rxjs';

@Component({
  selector: 'app-check-reaction-time',
  standalone: true,
  imports: [CommonButtonComponent, CommonModule, ReactionCubeComponent],
  templateUrl: './check-reaction-time.component.html',
  styleUrl: './check-reaction-time.component.scss'
})
export class CheckReactionTimeComponent {
  @Output() closeGame = new EventEmitter<void>();
  @ViewChild(ReactionCubeComponent) reactionCube!: ReactionCubeComponent;
  
  title = 'Player reaction time';
  cubeSize = 200;
  gameNamesEnum = GameNames;
  isGameStarted = false;
  message = '';
  highScores = 0;
  disableClick = false;

  startGame() {
    this.disableClick = false;
    this.isGameStarted = true;
    this.message = '';
  }

  onCubeClicked(reactionTime?: number) {
    if(!this.highScores && reactionTime) {
      this.highScores = reactionTime;
    }
    if (reactionTime) {
      if (reactionTime < this.highScores) {
        this.highScores = reactionTime;
      }
      this.message = `Your reaction time: ${reactionTime}ms`;
      this.disableClick = true;
    } else {
      this.message = 'Too early! Try again.';
      this.disableClick = true;
    }
    
    timer(2000).subscribe(()=>{
      this.isGameStarted = false;
      if (this.reactionCube) {
        this.reactionCube.reset();
      }
    })
  }

  goBack() {
    this.closeGame.emit();
  }
}