import { Injectable } from '@angular/core';
import { Profession } from '../models/profession';
import { PROFESSION_LIST } from '../fake-data-set/profession-fake';

@Injectable({
  providedIn: 'root'
})
export class ProfessionsService {

  getProfessionsList(): Profession[] {
    return PROFESSION_LIST;
  }
}
