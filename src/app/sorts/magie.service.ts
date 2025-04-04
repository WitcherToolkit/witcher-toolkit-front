import { Injectable } from '@angular/core';
import { Magie } from '../models/magie';
import { MAGIE_LIST } from '../fake-data-set/magie-fake';

@Injectable({
  providedIn: 'root'
})
export class MagieService {

  constructor() { }
  getMagieList() : Magie[] {
      return MAGIE_LIST;
    }
}
