import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { CaracteristiqueService } from '../../caracteristiques/caracteristique.service';

@Component({
  selector: 'app-consult-character',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consult-character.component.html',
  styleUrls: ['./consult-character.component.scss']
})
export class ConsultCharacterComponent implements AfterViewInit {

  characterData: any;

  constructor(private caracteristiqueService: CaracteristiqueService) {
    this.characterData = history.state.data;
  }

  isPrincipaleCaracteristiques() {
    return this.characterData.caracteristiquePersonnage.filter((carac: any) => carac.type === 'Principale');
  }

  nonPrincipaleCaracteristiques() {
    return this.characterData.caracteristiquePersonnage.filter((carac: any) => carac.type === 'Secondaire');
  }

  ngAfterViewInit() {
    const tabs = document.querySelectorAll('.tabs');
    M.Tabs.init(tabs);
  }
}
