import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTypeFormComponent } from './expense-type-form.component';

describe('ExpenseTypeForm', () => {
  let component: ExpenseTypeFormComponent;
  let fixture: ComponentFixture<ExpenseTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseTypeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
