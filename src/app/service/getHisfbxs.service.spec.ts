import { TestBed } from '@angular/core/testing';

import { GetHisfbxsService } from './getHisfbxs.service';

describe('GetHisfbxsService', () => {
  let service: GetHisfbxsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetHisfbxsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
