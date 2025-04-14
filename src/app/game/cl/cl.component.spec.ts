import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClComponent } from './cl.component';

describe('ClComponent', () => {
  let component: ClComponent;
  let fixture: ComponentFixture<ClComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
