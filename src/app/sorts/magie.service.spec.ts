import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Magie } from '../models/magie';
import { MAGIE_LIST } from '../fake-data-set/magie-fake';


@Injectable({
  providedIn: 'root'
})
export class MagieService {

  getMagieList() : Magie[] {
    return MAGIE_LIST;
  }
}
