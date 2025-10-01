import { CommonModule, JsonPipe } from '@angular/common';
import { AfterViewInit, AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FichePersonnageService } from '../fiche-personnage.service';
import { CaracteristiqueService } from '../../caracteristiques/caracteristique.service';


@Component({
  selector: 'app-consult-character',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  templateUrl: './consult-character.component.html',
  styleUrls: ['./consult-character.component.scss']
})
export class ConsultCharacterComponent implements OnInit, AfterViewInit, AfterViewChecked {
  characterData: any;
  loading = false;
  error: string | null = null;

  constructor(
    private caracteristiqueService: CaracteristiqueService,
    private route: ActivatedRoute,
    private fichePersonnageService: FichePersonnageService
  ) {
    this.characterData = history.state.data;
  }

    getSorts() {
    if (!this.characterData || !this.characterData.magieList) {
      return [];
    }
    return this.characterData.magieList.filter((magie: any) => magie.type === 'Sort');
  }

  getSignes() {
    if (!this.characterData || !this.characterData.magieList) {
      return [];
    }
    return this.characterData.magieList.filter((magie: any) => magie.type === 'Signe');
  }

  getInvocations() {
    if (!this.characterData || !this.characterData.magieList) {
      return [];
    }
    return this.characterData.magieList.filter((magie: any) => magie.type === 'Invocation');
  }

  isPrincipaleCaracteristiques() {
    if (!this.characterData || !this.characterData.caracteristiquePersonnageList) {
      return [];
    }
    return this.characterData.caracteristiquePersonnageList
    .filter((carac: any) => carac.caracteristique && carac.caracteristique.type === 'Principale');
  }

  nonPrincipaleCaracteristiques() {
    if (!this.characterData || !this.characterData.caracteristiquePersonnageList) {
      return [];
    }
    return this.characterData.caracteristiquePersonnageList
    .filter((carac: any) => carac.caracteristique && carac.caracteristique.type === 'Secondaire');
  }

  ngOnInit() {
    // Si pas de données transmises, on tente de charger via l'ID de l'URL
    if (!this.characterData) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loading = true;
        this.fichePersonnageService.getFichePersonnageById(+id).subscribe({
          next: (data) => {
            this.characterData = data;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Erreur lors du chargement du personnage';
            this.loading = false;
          }
        });
      }
    }
  }

  ngAfterViewInit() {
    this.initTabs();
  }

  ngAfterViewChecked() {
    this.initTabs();
  }

  private initTabs() {
    const tabs = document.querySelectorAll('.tabs');
    if (window['M'] && window['M'].Tabs && tabs.length > 0) {
      window['M'].Tabs.init(tabs);
    }
  }
}
