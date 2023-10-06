import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateAvatarComponent } from './date-avatar.component';

describe('DateAvatarComponent', () => {
  let component: DateAvatarComponent;
  let fixture: ComponentFixture<DateAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateAvatarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
