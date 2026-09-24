import { TestBed } from '@angular/core/testing';
import { Appoinments } from './appoinments';

describe('Appoinments', () => {
  let service: Appoinments;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Appoinments);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
