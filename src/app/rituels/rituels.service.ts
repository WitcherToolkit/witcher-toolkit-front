import { Injectable } from '@angular/core';
import { Rituel } from '../models/rituel';
import { RITUEL_LIST } from '../fake-data-set/rituel-fake';

@Injectable({
  providedIn: 'root'
})
export class RituelsService {

  constructor() { }
  getRituelList() : Rituel[] {
    return RITUEL_LIST;
  }
}
