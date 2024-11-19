import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GameCellComponent, RoundResults } from './components/components/game-cell/game-cell.component';
import { CommonModule } from '@angular/common';
import { GameMatixService } from './services/game-matrix.service';
import { CommonButtonComponent } from './shared/components/common-button/common-button.component';
import { InputComponent } from './shared/components/common-input/common-input.component';
import { gameCellObject } from './interfaces/cameCellObjectInterface';
import { GameCellConditionEnum } from './enums/app-colors-enum';
import { GameStatusTextTextEnum } from './enums/main-action-button-text.enum';

enum GameTitlesEnum {
  MAIN = 'reaction cube',
  COMPUTER_WON = 'computer won',
  PLAYER_WON = 'player won'
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameCellComponent, CommonModule, CommonButtonComponent, InputComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title: GameTitlesEnum = GameTitlesEnum.MAIN;
  cubeSize = 40;
  maxCubeSize = 60;
  minCubeSize = 20;
  matrix: gameCellObject[][] = [];
  playerWins = 0;
  computerWins = 0;
  maxScore = 10;

  playerHightScore = '';
  gameStatusTextTextEnum = GameStatusTextTextEnum;
  gameStatusText: GameStatusTextTextEnum = GameStatusTextTextEnum.START_GAME;


  constructor(
    private cdRef: ChangeDetectorRef,
    private gameMatrixService: GameMatixService,
  ) {
  }

  ngOnInit(): void {
    this.createGameMatrix(); 
  }

  mainActionButtonClicked() {
    if(this.gameStatusText === GameStatusTextTextEnum.START_GAME) {
      this.startGame();
    } else if(this.gameStatusText = GameStatusTextTextEnum.RESET) {
      this.resetGame();
    }
  }

  startGame() {
    this.gameStatusText = GameStatusTextTextEnum.GAME_IN_PROGRESS;
    this.gameMatrixService.startGame(this.matrix, 1000, 2500, this.cdRef).subscribe();
  }

  stopGame() {
    this.gameMatrixService.stopGame()
  }

  increaseSize() {
    if(this.cubeSize < this.maxCubeSize){
      this.cubeSize++;
      this.cdRef.markForCheck()
    }
  }

  checkGameResults(event: RoundResults) {
    if(event.cellCondition === GameCellConditionEnum.COMPUTER_WIN) {
      this.computerWins++;
      if(this.computerWins === this.maxScore) {
        this.gameMatrixService.stopGame();
        this.title = GameTitlesEnum.COMPUTER_WON
        this.gameStatusText = GameStatusTextTextEnum.RESET
      }
    }
    if(event.cellCondition === GameCellConditionEnum.PLAYER_WIN) {
      this.playerWins++;
      if(this.playerWins === this.maxScore) {
        this.gameMatrixService.stopGame()
        this.title = GameTitlesEnum.PLAYER_WON
        this.gameStatusText = GameStatusTextTextEnum.RESET
      }
    }
  }

  decreaseSize() {
    if (this.cubeSize > this.minCubeSize) {
      this.cubeSize--;
    }
  }

  createGameMatrix() {
    this.matrix = this.gameMatrixService.createMatrix(10, 10) 
  }

  resetGame() {
    this.gameStatusText = GameStatusTextTextEnum.START_GAME;
    this.createGameMatrix();
    this.title = GameTitlesEnum.MAIN;
    this.playerWins = 0;
    this.computerWins = 0;
  } 
}
