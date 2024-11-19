import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-container" [@modalAnimation]>
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button class="close-button" (click)="close()">&times;</button>
        </div>
        <div class="modal-content" [innerHTML]="data">
        
          <ng-content></ng-content>
        </div>
        <div class="modal-footer" *ngIf="showFooter">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-container {
      background: white;
      border-radius: 4px;
      padding: 20px;
      min-width: 300px;
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .close-button {
      border: none;
      background: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .modal-content {
      margin-bottom: 16px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() data = ''
  @Input() showFooter = true;
  @Output() isOpenChange = new EventEmitter<boolean>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.isOpen) {
      this.close();
    }
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
