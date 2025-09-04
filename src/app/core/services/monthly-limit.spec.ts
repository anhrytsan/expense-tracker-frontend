import { TestBed } from '@angular/core/testing';

import { MonthlyLimitService } from './monthly-limit.service';

describe('MonthlyLimitService', () => {
  let service: MonthlyLimitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthlyLimitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
