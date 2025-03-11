import { Injectable } from '@angular/core';
import { RACE_LIST } from '../fake-data-set/race-fake';
import { Race } from '../models/race';

@Injectable({
  providedIn: 'root'
})
export class RacesService {

  getRacesList() : Race[] {
    return RACE_LIST;
  }
}
