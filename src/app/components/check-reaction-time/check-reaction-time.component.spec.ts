import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckReactionTimeComponent } from './check-reaction-time.component';

describe('CheckReactionTimeComponent', () => {
  let component: CheckReactionTimeComponent;
  let fixture: ComponentFixture<CheckReactionTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckReactionTimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckReactionTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
