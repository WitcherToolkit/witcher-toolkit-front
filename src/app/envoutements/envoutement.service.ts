import { Injectable } from '@angular/core';
import { ENVOUTEMENT_LIST } from '../fake-data-set/envoutement-fake';
import { Envoutement } from '../models/envoutement';

@Injectable({
  providedIn: 'root'
})
export class EnvoutementService {

  constructor() { }
  getEnvoutementList() : Envoutement[] {
      return ENVOUTEMENT_LIST;
    }
}
