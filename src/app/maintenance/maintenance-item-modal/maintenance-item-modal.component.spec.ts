import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceItemModalComponent } from './maintenance-item-modal.component';

describe('MaintenanceItemModalComponent', () => {
  let component: MaintenanceItemModalComponent;
  let fixture: ComponentFixture<MaintenanceItemModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaintenanceItemModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceItemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
