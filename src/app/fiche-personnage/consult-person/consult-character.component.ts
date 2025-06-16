import { Component, Injectable } from '@angular/core';

@Component({
  selector: 'app-consult-character',
  templateUrl: './consult-character.component.html',
  styles: []
})
export class ConsultCharacterComponent {

  characterData: any;

  constructor() {
    this.characterData = history.state.data;
  }
}
