import { CommonModule, JsonPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
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
export class ConsultCharacterComponent implements OnInit, AfterViewInit {
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

  isPrincipaleCaracteristiques() {
    if (!this.characterData || !this.characterData.caracteristiquePersonnage) {
      return [];
    }
    return this.characterData.caracteristiquePersonnage.filter((carac: any) => carac.type === 'Principale');
  }

  nonPrincipaleCaracteristiques() {
    if (!this.characterData || !this.characterData.caracteristiquePersonnage) {
      return [];
    }
    return this.characterData.caracteristiquePersonnage.filter((carac: any) => carac.type === 'Secondaire');
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
    const tabs = document.querySelectorAll('.tabs');
    if (window['M'] && window['M'].Tabs) {
      window['M'].Tabs.init(tabs);
    }
  }
}
