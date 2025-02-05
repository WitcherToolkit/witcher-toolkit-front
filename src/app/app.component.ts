import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import * as M from 'materialize-css';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CardBorderDirective } from './card-border.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.renderer.listen('document', 'DOMContentLoaded', () => {
      const dropdowns = document.querySelectorAll('.dropdown-trigger');
      M.Dropdown.init(dropdowns, {});
    });
  }
}
