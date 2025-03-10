import { Injectable } from '@angular/core';
import { COMPETENCE_LIST } from '../fake-data-set/competence-fake';
import { Competence } from '../models/competence';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {

  getCompetencesList() : Competence[] {
    return COMPETENCE_LIST;
  }
}
