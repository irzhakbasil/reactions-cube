import { AfterContentInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './common-button.component.html',
  styleUrl: './common-button.component.scss'
})
export class CommonButtonComponent implements AfterContentInit {
  private _width!: number;
  @Input() set width(value: number) {
    if(value && value > 0) {
      this._width = value;
    }
  }
  @ViewChild('button', {static: true}) button!: ElementRef;
  @Input() buttonText: string = ''
  @Input() disabled: boolean = false
  @Output() buttonClicked = new EventEmitter<void>()

  onButtonClicked() {
    this.buttonClicked.emit()
  }

  ngAfterContentInit () {
    this.setButtonWidth();
  }

private setButtonWidth() {
  if (this._width && this._width > 0 && this.button?.nativeElement) {
    this.button.nativeElement.style.width = `${this._width}px`;
  }
}
}
