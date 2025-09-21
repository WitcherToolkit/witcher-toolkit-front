import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import * as M from 'materialize-css';
import { RouterLink, RouterOutlet } from '@angular/router';
import { 
  CARACTERISTIQUE_LIST_PATH,
  COMPTETENCE_LIST_PATH, 
  ENVOUTEMENT_LIST_PATH, 
  MAGIE_LIST_PATH, 
  PERSONNAGE_BASE_PATH, 
  PERSONNAGE_CREATE_PATH, 
  PROFESSION_LIST_PATH, 
  RACE_LIST_PATH, 
  RITUEL_LIST_PATH } from './app-routing/app-routing-constants';
import { AuthService } from './shared/shared-services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  readonly magieListPath = MAGIE_LIST_PATH;
  readonly rituelListPath = RITUEL_LIST_PATH;

  readonly envoutementListPath = ENVOUTEMENT_LIST_PATH;
  readonly caracteristiqueListPath = CARACTERISTIQUE_LIST_PATH;
  readonly competenceListPath = COMPTETENCE_LIST_PATH;

  readonly raceListPath = RACE_LIST_PATH;
  readonly professionListPath = PROFESSION_LIST_PATH;

  readonly createPersonnageBasePath = PERSONNAGE_CREATE_PATH;

  constructor(private renderer: Renderer2, private authService: AuthService, private router: Router) {}

  ngAfterViewInit() {
    this.renderer.listen('document', 'DOMContentLoaded', () => {
      const dropdowns = document.querySelectorAll('.dropdown-trigger');
      M.Dropdown.init(dropdowns, {});
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
