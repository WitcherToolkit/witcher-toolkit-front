import { Injectable, signal } from '@angular/core';
import { Profession } from '../models/profession';
import { map, Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfig } from '../environment.config';
import { RacesService } from '../races/races.service';

@Injectable({
  providedIn: 'root'
})
export class ProfessionsService {
  // --- Signal pour la liste des professions ---
  private readonly professions = signal<Profession[]>([]);
  // --- URL de base pour les requêtes professions ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/professions`;

  constructor(private http: HttpClient, private racesService: RacesService) {}

  // --- Récupérer la liste des professions ---
  getProfessionsList(): Observable<Profession[]> {
    console.info('Fetching professions list from API...');
    console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
    return this.http.get<Profession[]>(`${this.apiUrl}`);
  }

  // --- Récupérer une profession avec ses compétences ---
  getProfessionCompetences(id: number): Observable<Profession> {
    console.info('Fetching profession detail from API...');
    console.log(`API Base URL: ${this.apiUrl}/${id}/competences`);
    return this.http.get<Profession>(`${this.apiUrl}/${id}/competences`);
  }

  // --- Créer une nouvelle profession ---
  createProfession(profession: Profession): Observable<Profession> {
    console.log('Creating profession:', profession);
    return this.http.post<Profession>(`${this.apiUrl}/create`, profession);
  }

  // --- Mettre à jour une profession existante ---
  updateProfession(profession: Profession): Observable<Profession> {
    console.log('Updating profession:', profession);
    return this.http.put<Profession>(`${this.apiUrl}/update/${profession.idProfession}`, profession);
  }

  // --- Supprimer une profession par son ID ---
  deleteProfession(id: number): Observable<void> {
    console.log('Deleting profession with ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
  
  //------------------------------------------------------------------------------------------------------------------------------------//
  //------------------------------------------------------------------------------------------------------------------------------------//
  // Création personnage
  filterProfessions(raceId: number): Observable<Profession[]> {
    return this.racesService.getRacesList().pipe(
      map(races => {
        const sorceleurRace = races.find(r => r.nom === 'Sorceleur');
        const humainRace = races.find(r => r.nom === 'Humain');
        const elfeRace = races.find(r => r.nom === 'Elfe');
        return { sorceleurRaceId: sorceleurRace?.idRace, humainRaceId: humainRace?.idRace, elfeRaceId: elfeRace?.idRace };
      }),
      switchMap(({ sorceleurRaceId, humainRaceId, elfeRaceId }) =>
        this.getProfessionsList().pipe(
          map(professions => {
            let filteredProfessions = professions;
            if (String(raceId) === String(sorceleurRaceId)) {
              return filteredProfessions.filter(prof => prof.nom === 'Sorceleur');
            }
            filteredProfessions = filteredProfessions.filter(prof => prof.nom !== 'Sorceleur');
            if (![String(humainRaceId), String(elfeRaceId)].includes(String(raceId))) {
              filteredProfessions = filteredProfessions.filter(prof => prof.nom !== 'Mage');
            }
            return filteredProfessions;
          })
        )
      )
    );
  }
}