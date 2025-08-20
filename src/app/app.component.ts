import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import * as M from 'materialize-css';
import { RouterLink, RouterOutlet } from '@angular/router';
import { 
  CARACTERISTIQUE_LIST_PATH,
  COMPTETENCE_LIST_PATH, 
  ENVOUTEMENT_LIST_PATH, 
  MAGIE_LIST_PATH, 
  PERSONNAGE_BASE_PATH, 
  PROFESSION_LIST_PATH, 
  RACE_LIST_PATH, 
  RITUEL_LIST_PATH } from './app-routing/app-routing-constants';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink ],
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {

  readonly magieListPath = MAGIE_LIST_PATH;
  readonly rituelListPath = RITUEL_LIST_PATH;

  readonly envoutementListPath = ENVOUTEMENT_LIST_PATH;
  readonly caracteristiqueListPath = CARACTERISTIQUE_LIST_PATH;
  readonly competenceListPath = COMPTETENCE_LIST_PATH;

  readonly raceListPath = RACE_LIST_PATH;
  readonly professionListPath = PROFESSION_LIST_PATH;

  readonly personnageBasePath = PERSONNAGE_BASE_PATH;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.renderer.listen('document', 'DOMContentLoaded', () => {
      const dropdowns = document.querySelectorAll('.dropdown-trigger');
      M.Dropdown.init(dropdowns, {});
    });
  }
}
