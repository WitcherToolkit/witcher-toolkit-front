import { Injectable } from '@angular/core';
import { COMPETENCE_LIST } from '../fake-data-set/competence-fake';
import { Competence } from '../models/competence';
import { Caracteristique } from '../models/caracteristique';
import { CARACTERISTIQUE_LIST } from '../fake-data-set/caracteristiques-fake';

@Injectable({
  providedIn: 'root'
})
export class CaracteristiqueService {

  getCaracteristiquesList() : Caracteristique[] {
    return CARACTERISTIQUE_LIST;
  }

}
