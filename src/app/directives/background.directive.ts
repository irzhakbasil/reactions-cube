import { Directive, ElementRef, Renderer2, Input, OnChanges } from '@angular/core';
import { GameCellConditionEnum } from '../enums/game-cell-conditions.enums';

@Directive({
  selector: '[appConditionalBackground]',
  standalone: true
})
export class ConditionalBackgroundDirective implements OnChanges {
  @Input() appConditionalBackground!: GameCellConditionEnum;
  private currentClass: string | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    this.updateClass();
  }

  private updateClass(): void {
    // Remove previous class if it exists
    if (this.currentClass) {
      this.renderer.removeClass(this.el.nativeElement, this.currentClass);
    }
    let newClass: string;
    switch (this.appConditionalBackground) {
      case GameCellConditionEnum.PANDING:
        newClass = 'bg-pending';
        break;
      case GameCellConditionEnum.PLAYER_WIN:
        newClass = 'bg-player-win';
        break;
      case GameCellConditionEnum.COMPUTER_WIN:
        newClass = 'bg-computer-win';
        break;
      default:
        newClass = 'bg-default';
    }

    this.renderer.addClass(this.el.nativeElement, newClass);
    this.currentClass = newClass;
  }
}