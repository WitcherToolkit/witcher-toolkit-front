import { TestBed } from '@angular/core/testing';

import { CaracteristiqueService } from './caracteristique.service';

describe('CompetenceService', () => {
  let service: CaracteristiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaracteristiqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
