import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import * as M from 'materialize-css';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CardBorderDirective } from './card-border.directive';
import { CARACTERISTIQUE_BASE_PATH, COMPTETENCE_BASE_PATH, ENVOUTEMENT_BASE_PATH, MAGIE_BASE_PATH, PERSONNAGE_BASE_PATH, PROFESSION_BASE_PATH, RACE_BASE_PATH, RITUEL_BASE_PATH } from './app-routing/app.routes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {

  readonly magieBasePath = MAGIE_BASE_PATH;
  readonly rituelBasePath = RITUEL_BASE_PATH;
  readonly envoutementBasePath = ENVOUTEMENT_BASE_PATH;
  readonly caracteristiqueBasePath = CARACTERISTIQUE_BASE_PATH;
  readonly competenceBasePath = COMPTETENCE_BASE_PATH;
  readonly raceBasePath = RACE_BASE_PATH;
  readonly professionBasePath = PROFESSION_BASE_PATH;
  readonly personnageBasePath = PERSONNAGE_BASE_PATH;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.renderer.listen('document', 'DOMContentLoaded', () => {
      const dropdowns = document.querySelectorAll('.dropdown-trigger');
      M.Dropdown.init(dropdowns, {});
    });
  }
}
