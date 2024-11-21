import { Component, OnInit } from '@angular/core';
import { Caracteristique } from './model/caracteristique';
import { Router } from 'express';
import { Protection } from './model/protection';
import { Rituel } from './model/rituel';
import { Envoutement } from './model/envoutement';
import { Magie } from './model/magie';
import { Competence } from './model/competence';
import { Personnage } from './model/personnage';
import { Inventaire } from './model/inventaire';
import { Equipement } from './model/equipement';
import { PersonnageService } from './personnage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  caracteritiquesList: Caracteristique[];
  protectionsList: Protection[];
  rituelsList: Rituel[];
  envoutementsList: Envoutement[];
  magiesList: Magie[];
  competencesList: Competence[];
  personnage: Personnage;
  iventairesList: Inventaire[];
  equipementsList: Equipement[];

  constructor(
    private personnageService: PersonnageService
  ) {}

  ngOnInit(): void {
    this.caracteritiquesList = this.personnageService.getCaracteristiques();
    this.protectionsList = this.personnageService.getProtections();
    this.rituelsList = this.personnageService.getRituels();
    this.envoutementsList = this.personnageService.getEnvoutements();
    this.magiesList = this.personnageService.getMagies();
    this.competencesList = this.personnageService.getCompetences();
    this.personnage = this.personnageService.getPersonnage();
    this.iventairesList = this.personnageService.getInventaires();
    this.equipementsList = this.personnageService.getEquipements();
  }

  hasMagiesOfType(type: string): boolean {
    return this.magiesList.some(magie => magie.type === type);
  }

  //#region card onglets
  selectedTab = 'part1'; // Initialement, Test 1 est sélectionné

  selectTab(tabId: string) {
    this.selectedTab = tabId;
  }
  //#endregion card onglets
  

}
