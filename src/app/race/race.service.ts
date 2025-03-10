import { Injectable } from '@angular/core';
import { RACE_LIST } from '../fake-data-set/race-fake';
import { Race } from '../models/race';

@Injectable({
  providedIn: 'root'
})
export class RaceService {

  getRacesList() : Race[] {
    console.log(RACE_LIST)
    return RACE_LIST;
  }
}
