
import { 
    Injectable, 
    ApplicationRef, 
    createComponent, 
    Type, 
    EnvironmentInjector,
    ComponentRef,
    Injector
  } from '@angular/core';
  import { Subject } from 'rxjs';
  import { ModalComponent } from './modal.component';
  
  @Injectable({
    providedIn: 'root'
  })
  export class ModalService {
    private modalComponentRef: ComponentRef<ModalComponent> | null = null;
  
    constructor(
      private appRef: ApplicationRef,
      private injector: EnvironmentInjector
    ) {}
  
    open(content: Type<any>, config: { title?: string; data?: any } = {}) {
      const closedSubject = new Subject<void>();
      const modalHost = document.createElement('div');
      document.body.appendChild(modalHost);
  
      const modalComponentRef = createComponent(ModalComponent, {
        environmentInjector: this.injector,
        hostElement: modalHost
      });
  
      const contentInjector = Injector.create({
        providers: [
          { provide: ModalComponent, useValue: modalComponentRef.instance }
        ],
        parent: this.injector
      });
  
      const contentComponentRef = createComponent(content, {
        environmentInjector: this.injector,
        elementInjector: contentInjector,
        hostElement: document.createElement('div')
      });
  
      modalComponentRef.instance.title = config.title || '';
      modalComponentRef.instance.data = config.data || ''
      modalComponentRef.instance.isOpen = true;
  
      const modalContainer = modalComponentRef.location.nativeElement as HTMLElement;
      const modalContent = modalContainer.querySelector('.modal-content');
  
      if (modalContent && contentComponentRef.location.nativeElement) {
        modalContent.appendChild(contentComponentRef.location.nativeElement);
      }
  
      modalComponentRef.instance.isOpenChange.subscribe((isOpen: boolean) => {
        if (!isOpen) {
          this.closeModal(modalComponentRef, contentComponentRef, modalHost);
          closedSubject.next();
          closedSubject.complete();
        }
      });
  
      this.modalComponentRef = modalComponentRef;
  
      this.appRef.attachView(modalComponentRef.hostView);
      this.appRef.attachView(contentComponentRef.hostView);
  
      return {
        componentRef: modalComponentRef,
        closed$: closedSubject.asObservable()
      };
    }
  
    private closeModal(
      modalRef: ComponentRef<ModalComponent>, 
      contentRef: ComponentRef<any>, 
      hostElement: HTMLElement
    ) {
      this.appRef.detachView(modalRef.hostView);
      this.appRef.detachView(contentRef.hostView);
      modalRef.destroy();
      contentRef.destroy();
      hostElement.remove();
      this.modalComponentRef = null;
    }
  }