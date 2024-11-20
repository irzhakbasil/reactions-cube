import { Directive, ElementRef, Renderer2, Input, OnChanges } from '@angular/core';
import { GameCellConditionEnum } from '../enums/game-cell-conditions.enums';

@Directive({
  selector: '[appConditionalBackground]',
  standalone: true
})
export class ConditionalBackgroundDirective implements OnChanges {
  @Input() appConditionalBackground!: GameCellConditionEnum;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    this.updateBackgroundColor();
  }

  private updateBackgroundColor(): void {
    let backgroundColor: string;

    switch (this.appConditionalBackground) {
      case GameCellConditionEnum.PANDING:
        backgroundColor = '#efef1d';
        break;
      case GameCellConditionEnum.PLAYER_WIN:
        backgroundColor = '#5cd35c';
        break;
      case GameCellConditionEnum.COMPUTER_WIN:
        backgroundColor = '#d3255f';
        break;
      default:
        backgroundColor = '#3779de';
    }

    this.renderer.setStyle(this.el.nativeElement, 'background-color', backgroundColor);
  }
}