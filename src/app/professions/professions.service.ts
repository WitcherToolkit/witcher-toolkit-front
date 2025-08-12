import { Injectable, signal } from '@angular/core';
import { Profession } from '../models/profession';
import { PROFESSION_LIST, PROFESSION_MAP } from '../fake-data-set/profession-fake';
import { map, Observable, of } from 'rxjs';
import { RACE_MAP } from '../fake-data-set/race-fake';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';

@Injectable({
  providedIn: 'root'
})
export class ProfessionsService {
  private readonly professions = signal<Profession[]>([]);

  constructor(private http: HttpClient) {}

  getProfessionsList(): Observable<Profession[]> {
    console.info('Fetching professions list from API...');
    console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
    return this.http.get<Profession[]>(`${EnvironmentConfig.apiBaseUrl}/professions`);
  }

  getProfessionCompetences(id: number): Observable<Profession> {

    console.info('Fetching profession detail from API...');
    console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}/professions/${id}/competences`);
    return this.http.get<Profession>(`${EnvironmentConfig.apiBaseUrl}/professions/${id}/competences`);
  }

  updateProfession(profession: Profession): Observable<Profession> {
    console.log('Updating profession:', profession);
    return this.http.put<Profession>(`${EnvironmentConfig.apiBaseUrl}/professions/update/${profession.idProfession}`, profession);
  }
  
  // Création personnage
  filterProfessions(raceId: number): Observable<Profession[]> {
    // Récupération des IDs des professions Sorceleur et Mage
    const sorceleurProfessionId = Object.keys(PROFESSION_MAP).find(key => PROFESSION_MAP[+key] === 'Sorceleur');
    const mageProfessionId = Object.keys(PROFESSION_MAP).find(key => PROFESSION_MAP[+key] === 'Mage');
  
    // Récupération des IDs des races Sorceleur, Humain et Elfe
    const sorceleurRaceId = Object.keys(RACE_MAP).find(key => RACE_MAP[+key] === 'Sorceleur');
    const humainRaceId = Object.keys(RACE_MAP).find(key => RACE_MAP[+key] === 'Humain');
    const elfeRaceId = Object.keys(RACE_MAP).find(key => RACE_MAP[+key] === 'Elfe');
  
    return this.getProfessionsList().pipe(
      map(professions => {
        let filteredProfessions = professions;
  
        // Si la race sélectionnée est Sorceleur
        if (raceId.toString() === sorceleurRaceId) {
          return filteredProfessions.filter(prof => prof.nom === 'Sorceleur');
        }
  
        // Si la race sélectionnée n'est PAS Sorceleur
        filteredProfessions = filteredProfessions.filter(prof => prof.nom !== 'Sorceleur');
  
        // Si la race sélectionnée N'EST PAS Humain ou Elfe, on exclut Mage de la liste
        if (![humainRaceId, elfeRaceId].includes(raceId.toString())) {
          filteredProfessions = filteredProfessions.filter(prof => prof.nom !== 'Mage');
        }
  
        return filteredProfessions;
      })
    );
  }
}