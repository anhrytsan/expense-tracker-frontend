import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyLimitListComponent } from './monthly-limit-list.component';

describe('MonthlyLimitListComponent', () => {
  let component: MonthlyLimitListComponent;
  let fixture: ComponentFixture<MonthlyLimitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyLimitListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyLimitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
