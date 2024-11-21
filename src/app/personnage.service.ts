import { Injectable } from '@angular/core';
import { Caracteristique } from './model/caracteristique';
import { CARACTERISTIQUES, COMPETENCE, ENVOUTEMENTS, PROTECTION, INVENTAIRE, MAGIES, PERSONNAGE, RITUELS, EQUIPEMENT } from './mock/mock-fiche-personnage';
import { Protection } from './model/protection';
import { Rituel } from './model/rituel';
import { Envoutement } from './model/envoutement';
import { Magie } from './model/magie';
import { Competence } from './model/competence';
import { Personnage } from './model/personnage';
import { Inventaire } from './model/inventaire';
import { Equipement } from './model/equipement';

@Injectable()
export class PersonnageService {

  constructor() { }

  getCaracteristiques(): Caracteristique[]{
    return CARACTERISTIQUES;
  }

  getProtections(): Protection[]{
    return PROTECTION;
  }

  getRituels(): Rituel[]{
    return RITUELS;
  }

  getEnvoutements(): Envoutement[]{
    return ENVOUTEMENTS;
  }

  getMagies(): Magie[]{
    return MAGIES;
  }

  getCompetences(): Competence[]{
    return COMPETENCE;
  }

  getPersonnage(): Personnage{
    return PERSONNAGE;
  }

  getInventaires(): Inventaire []{
    return INVENTAIRE;
  }

  getEquipements(): Equipement []{
    return EQUIPEMENT;
  }

}
