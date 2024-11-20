import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionCubeComponent } from './reaction-cube.component';

describe('ReactionCubeComponent', () => {
  let component: ReactionCubeComponent;
  let fixture: ComponentFixture<ReactionCubeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactionCubeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactionCubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
