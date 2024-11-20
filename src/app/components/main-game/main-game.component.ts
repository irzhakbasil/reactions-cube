
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonButtonComponent } from '../../shared/components/common-button/common-button.component';
import { InputComponent } from '../../shared/components/common-input/common-input.component';
import { gameCellObject } from '../../interfaces/cameCellObjectInterface';
import { GameStatusTextTextEnum } from '../../enums/main-action-button-text.enum';
import { GameMatixService } from '../../services/game-matrix.service';
import { GameCellConditionEnum } from '../../enums/app-colors-enum';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../shared/components/modal-component/modal.service';
import { ModalComponent } from '../../shared/components/modal-component/modal.component';
import { GameCellComponent, RoundResults } from '../components/game-cell/game-cell.component';

enum GameTitlesEnum {
  MAIN = 'reaction cube',
  COMPUTER_WON = 'computer won',
  PLAYER_WON = 'player won'
}

@Component({
  selector: 'app-main-game',
  standalone: true,
  imports: [
    GameCellComponent, 
    CommonModule, 
    CommonButtonComponent, 
    InputComponent, 
    ReactiveFormsModule,
  ],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainGameComponent implements OnInit {
  @Output() closeGame = new EventEmitter<void>()
  title: GameTitlesEnum = GameTitlesEnum.MAIN;
  cubeSize = 40;
  maxCubeSize = 60;
  minCubeSize = 20;
  matrix: gameCellObject[][] = [];
  playerWins = 0;
  computerWins = 0;
  maxScore = 10;
  defaultReactionTime = 800; // ms

  inputFormControl = new FormControl(this.defaultReactionTime, {nonNullable: true, validators: Validators.required})

  playerHightScore = '';
  gameStatusTextTextEnum = GameStatusTextTextEnum;
  gameStatusText: GameStatusTextTextEnum = GameStatusTextTextEnum.START_GAME;


  constructor(
    private cdRef: ChangeDetectorRef,
    private gameMatrixService: GameMatixService,
    private modalService: ModalService
  ) {
  }

  ngOnInit(): void {
    this.createGameMatrix();
    this.subscribeToFormControl()
  }

  subscribeToFormControl(){
    this.inputFormControl.valueChanges.subscribe()
  }

  mainActionButtonClicked() {
    if(this.gameStatusText === GameStatusTextTextEnum.START_GAME) {
      this.startGame();
    } else if(this.gameStatusText = GameStatusTextTextEnum.RESET) {
      this.resetGame();
    }
  }

  startGame() {
    if(this.inputFormControl.value > 0) {
      this.inputFormControl.disable();
      this.gameStatusText = GameStatusTextTextEnum.GAME_IN_PROGRESS;
      this.gameMatrixService.startGame(this.matrix, this.inputFormControl.value, 2500, this.cdRef).subscribe();
    }
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
      this.handleComputerRoundWin()
    }
    if(event.cellCondition === GameCellConditionEnum.PLAYER_WIN) {
      this.handlePlayerRoundWin();
    }
  }

  private handleComputerRoundWin(): void {
    this.computerWins++;
    if (this.computerWins === this.maxScore) {
      this.inputFormControl.enable();
      this.gameMatrixService.stopGame();
      this.title = GameTitlesEnum.COMPUTER_WON;
      this.gameStatusText = GameStatusTextTextEnum.RESET;
      this.showResultsModal()
    }
  }

  private handlePlayerRoundWin(): void {
    this.playerWins++;
    if (this.playerWins === this.maxScore) {
      this.inputFormControl.enable();
      this.gameMatrixService.stopGame();
      this.title = GameTitlesEnum.PLAYER_WON;
      this.gameStatusText = GameStatusTextTextEnum.RESET;
      this.showResultsModal()
    }
  }

  showResultsModal() {
    this.modalService.open(ModalComponent, {title: 'game results', data: `
    <span>Player wins: ${this.playerWins}, Computer wins: ${this.computerWins}</span>
  `})
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
    this.inputFormControl.enable();
  } 

  goBack() {
    this.closeGame.emit()
  }
}

