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
  private _className!: string;
  @ViewChild('button', {static: true}) button!: ElementRef;
  @Input() set width(value: number) {
    if(value && value > 0) {
      this._width = value;
    }
  }
  @Input() set buttonClass(className: string) {
    if(className) {
      console.log(className)
      this._className = className
    }
  }
  @Input() buttonIdentifier: string = '';
  @Input() buttonText: string = ''
  @Input() disabled: boolean = false
  @Output() buttonClicked = new EventEmitter<string>();

  onButtonClicked() {
    this.buttonClicked.emit(this.buttonIdentifier)
  }

  ngAfterContentInit () {
    this.setButtonProperties();
  }

  private setButtonProperties() {
    if (this._width && this._width > 0 && this.button?.nativeElement) {
      this.button.nativeElement.style.width = `${this._width}px`;
    }
    if(this._className) {
      this.button.nativeElement.classList.add(this._className)
    }
  } 
}
