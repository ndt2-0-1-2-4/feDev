import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenugameComponent } from './menugame.component';

describe('MenugameComponent', () => {
  let component: MenugameComponent;
  let fixture: ComponentFixture<MenugameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenugameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenugameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
