import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceChecklistComponent } from './maintenance-checklist.component';

describe('MaintenanceChecklistComponent', () => {
  let component: MaintenanceChecklistComponent;
  let fixture: ComponentFixture<MaintenanceChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaintenanceChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
