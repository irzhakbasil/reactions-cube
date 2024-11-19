import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ControlValueAccessorDirective } from '../../control-value-accessor-directive/control-value-accessor.directive';

type InputType = 'text' | 'number' | 'email' | 'password';
const standardWidth = '165';
@Component({
  selector: 'app-input',
  templateUrl: './common-input.component.html',
  styleUrls: ['./common-input.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent<T> extends ControlValueAccessorDirective<T> {
  @Input() inputId = '';
  @Input() placeholder = '';
  @Input() width = standardWidth;
  @Input() label = '';
  @Input() type: InputType = 'text';
  @Input() customErrorMessages: Record<string, string> = {};
}