import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyLimitFormComponent } from './monthly-limit-form.component';

describe('MonthlyLimitFormComponent', () => {
  let component: MonthlyLimitFormComponent;
  let fixture: ComponentFixture<MonthlyLimitFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyLimitFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyLimitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
