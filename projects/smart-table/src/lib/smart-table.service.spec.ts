import { TestBed } from '@angular/core/testing';

import { SmartTableService } from './smart-table.service';

describe('SmartTableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SmartTableService = TestBed.get(SmartTableService);
    expect(service).toBeTruthy();
  });
});
