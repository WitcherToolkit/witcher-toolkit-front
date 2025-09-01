import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  imports: [RouterLink],
  templateUrl: './page-not-found.component.html',
  styles: ``
})
export class PageNotFoundComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
