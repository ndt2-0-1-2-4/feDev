import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Slot777Component } from './slot777.component';

describe('Slot777Component', () => {
  let component: Slot777Component;
  let fixture: ComponentFixture<Slot777Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Slot777Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Slot777Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
