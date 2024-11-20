import { Component, HostListener, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ControlValueAccessorDirective } from '../../control-value-accessor-directive/control-value-accessor.directive';
import { ValidationErrorsComponent } from '../validation-errors/validation-errors.component';

type InputType = 'text' | 'number' | 'email' | 'password' | 'positive-numbers';
const standardWidth = '165';
@Component({
  selector: 'app-input',
  templateUrl: './common-input.component.html',
  styleUrls: ['./common-input.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ValidationErrorsComponent],
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
  private isUpdating = false;

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.type === 'positive-numbers') {
      // Allow: backspace, delete, tab, escape, enter
      if ([46, 8, 9, 27, 13].indexOf(event.keyCode) !== -1 ||
        // Allow: Ctrl+A
        (event.keyCode === 65 && event.ctrlKey === true) ||
        // Allow: Ctrl+C
        (event.keyCode === 67 && event.ctrlKey === true) ||
        // Allow: Ctrl+V
        (event.keyCode === 86 && event.ctrlKey === true) ||
        // Allow: Ctrl+X
        (event.keyCode === 88 && event.ctrlKey === true) ||
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
        return;
      }

      // Block 'e', 'E', '+', '-', and '.'
      if (['e', 'E', '+', '-', '.'].includes(event.key)) {
        event.preventDefault();
        return;
      }

      // Ensure that it is a number and stop the keypress if not
      if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) &&
        (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
      }

      const input = event.target as HTMLInputElement;
      const value = input.value;
      const selectionStart = input.selectionStart;
  
      // Handle zero input
      if (event.key === '0') {
        // Prevent multiple leading zeros
        if (value === '0' || (value === '' && selectionStart === 0)) {
          event.preventDefault();
          return;
        }
      }
    }
  }

  onBlur(event: FocusEvent) {
    // remove 000 or 009 (example)
    if (this.type === 'positive-numbers' && !this.isUpdating) {
      const input = event.target as HTMLInputElement;
      const value = input.value;
      
      if (value && value[0] === '0') {
        this.isUpdating = true;
        input.value = '';
        this.control?.setValue(null, { emitEvent: false });
        this.isUpdating = false;
      }
    }
  }

  override writeValue(value: T): void {
    if (!this.isUpdating) {
      this.isUpdating = true;
      if (this.type === 'positive-numbers' && value !== null && value !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          value = numValue === 0 ? null as any : numValue.toString() as any;
        }
      }
      super.writeValue(value);
      this.isUpdating = false;
    }
  }
}