import { Injectable } from '@angular/core';
import { PROFESSION_MAP } from '../fake-data-set/profession-fake';
import { ARTISAN_INVENTAIRE, BARDE_INVENTAIRE, CRIMINEL_INVENTAIRE, DOCTEUR_INVENTAIRE, HOMME_D_ARME_INVENTAIRE, MAGE_INVENTAIRE, MARCHAND_INVENTAIRE, NOBLE_INVENTAIRE, PRETRE_INVENTAIRE, SORCELEUR_INVENTAIRE } from '../fake-data-set/inventaire-fake';
import { Inventaire } from '../models/inventaire';
import { ToolsService } from '../tools/tools.service';

@Injectable({
  providedIn: 'root'
})
export class InventaireService {

  constructor(private toolsService: ToolsService) { }

  //Affichage de l'inventaire disponible en fonction de la profession
    updateInventaire(professionId: number | null): any[] {
      const professionName = PROFESSION_MAP[professionId || 0];
      switch (professionName) {
        case 'Artisan':
          return ARTISAN_INVENTAIRE;
        case 'Barde':
          return BARDE_INVENTAIRE;
        case 'Criminel':
          return CRIMINEL_INVENTAIRE;
        case 'Docteur':
          return DOCTEUR_INVENTAIRE;
        case 'Homme d\'armes':
          return HOMME_D_ARME_INVENTAIRE;
        case 'Mage':
          return MAGE_INVENTAIRE;
        case 'Marchand':
          return MARCHAND_INVENTAIRE;
        case 'Prêtre':
          return PRETRE_INVENTAIRE;
        case 'Sorceleur':
          return SORCELEUR_INVENTAIRE;
        case 'Noble':
          return NOBLE_INVENTAIRE;
        default:
          return [];
      }
    }

  // Convertit les données d'inventaire sélectionnées en objets Inventaire
  convertInventaireToObject(selectedInventaire: any[]): Inventaire[] {
    return selectedInventaire.map(control => ({
      nom: control.value,
      type: '',
      effet: '',
      quantite: undefined,
    }));
  }

  // Détermine la limite max d'objets en fonction de la profession
  getMaxInventaireItems(professionId: number | null): number {
    const professionLimits = { 'Sorceleur': 2, 'Marchand': 3 };

  // Appel de la méthode générique pour obtenir la limite des objets de l'inventaire
  const maxItems = this.toolsService.getMaxSelectableItems(professionId, professionLimits);

  return isFinite(maxItems) ? maxItems : 5;
  }
  
}
