import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainGameComponent } from './components/main-game/main-game.component';
import { CommonButtonComponent } from './shared/components/common-button/common-button.component';
import { CheckReactionTimeComponent } from './components/check-reaction-time/check-reaction-time.component';
import { CommonModule } from '@angular/common';

export enum GameNames {
  REACTION_CUBE = 'REACTION_CUBE',
  PLAYER_REACTION_TIME = 'PLAYER_REACTION_TIME'
}
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, MainGameComponent, CommonButtonComponent, CheckReactionTimeComponent, CommonModule]
})
export class AppComponent {

  title = 'choose the game';

  gameNamesEnum = GameNames;
  selectedGame: GameNames | null = null;

  selectButtonsWith = 450;

  gameSelected(event: string) {
    this.selectedGame = event as GameNames;
  }

  closeCurrentGame(){
    this.selectedGame = null;
  }
}
