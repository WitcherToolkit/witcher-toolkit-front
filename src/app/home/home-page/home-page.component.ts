import { Component } from '@angular/core';
import { CardBorderDirective } from '../../card-border.directive';
import { RouterLink } from '@angular/router';
import { CARACTERISTIQUE_BASE_PATH, COMPTETENCE_BASE_PATH, ENVOUTEMENT_BASE_PATH, MAGIE_BASE_PATH, PERSONNAGE_BASE_PATH, PROFESSION_BASE_PATH, RACE_BASE_PATH, RITUEL_BASE_PATH } from '../../app-routing/app.routes';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrls: ['home-page.component.scss']
})
export class HomePageComponent {

  readonly magieBasePath = MAGIE_BASE_PATH;
  readonly rituelBasePath = RITUEL_BASE_PATH;
  readonly envoutementBasePath = ENVOUTEMENT_BASE_PATH;
  readonly personnageBasePath = PERSONNAGE_BASE_PATH;
  readonly caracteristiqueBasePath = CARACTERISTIQUE_BASE_PATH;
  readonly competenceBasePath = COMPTETENCE_BASE_PATH;
  readonly raceBasePath = RACE_BASE_PATH;
  readonly professionBasePath = PROFESSION_BASE_PATH;

}
