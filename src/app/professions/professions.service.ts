import { Injectable, signal } from '@angular/core';
import { Profession } from '../models/profession';
import { map, Observable, of, switchMap, shareReplay, combineLatest } from 'rxjs';
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

  // --- Cache pour éviter les appels API répétés ---
  private professionsCache$?: Observable<Profession[]>;

  constructor(
    private http: HttpClient, 
    private racesService: RacesService
  ) {}

  // --- Récupérer la liste des professions (avec cache) ---
  getProfessionsList(): Observable<Profession[]> {
    if (!this.professionsCache$) {
      console.info('Fetching professions list from API...');
      console.log(`API Base URL: ${EnvironmentConfig.apiBaseUrl}`);
      this.professionsCache$ = this.http.get<Profession[]>(`${this.apiUrl}`).pipe(
        shareReplay(1) // Met en cache le résultat
      );
    }
    return this.professionsCache$;
  }

  // --- Invalider le cache (à appeler après create/update/delete) ---
  private invalidateCache(): void {
    this.professionsCache$ = undefined;
  }

  // --- Récupérer une profession avec ses compétences ---
  getProfessionCompetences(id: string): Observable<Profession> {
    console.info('Fetching profession detail from API...');
    console.log(`API Base URL: ${this.apiUrl}/${id}/competences`);
    return this.http.get<Profession>(`${this.apiUrl}/${id}/competences`);
  }

  // --- Créer une nouvelle profession ---
  createProfession(profession: Profession): Observable<Profession> {
    console.log('Creating profession:', profession);
    return this.http.post<Profession>(`${this.apiUrl}/create`, profession).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Mettre à jour une profession existante ---
  updateProfession(profession: Profession): Observable<Profession> {
    console.log('Updating profession:', profession);
    return this.http.put<Profession>(
      `${this.apiUrl}/update/${profession.idProfession}`, 
      profession
    ).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }

  // --- Supprimer une profession par son ID ---
  deleteProfession(id: string): Observable<void> {
    console.log('Deleting profession with ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      map(result => {
        this.invalidateCache(); // Invalide le cache
        return result;
      })
    );
  }
  
  // --- Filtrage des professions selon la race (OPTIMISÉ) ---
  filterProfessions(raceId: number): Observable<Profession[]> {
    // Combine les deux observables cachés en un seul flux
    return combineLatest([
      this.racesService.getRacesList(),
      this.getProfessionsList()
    ]).pipe(
      map(([races, professions]) => {
        // Trouver les races spéciales
        const sorceleurRace = races.find(r => r.nom === 'Sorceleur');
        const humainRace = races.find(r => r.nom === 'Humain');
        const elfeRace = races.find(r => r.nom === 'Elfe');

        // Normaliser les IDs en nombres pour éviter les bugs de comparaison
        const raceIdNum = Number(raceId);
        const sorceleurId = Number(sorceleurRace?.idRace);
        const humainId = Number(humainRace?.idRace);
        const elfeId = Number(elfeRace?.idRace);

        console.log('Race sélectionnée ID:', raceIdNum);
        console.log('IDs de référence - Sorceleur:', sorceleurId, 'Humain:', humainId, 'Elfe:', elfeId);

        // Règle 1 : Si Sorceleur sélectionné -> uniquement profession Sorceleur
        if (raceIdNum === sorceleurId) {
          console.log('Filtrage Sorceleur');
          return professions.filter(prof => prof.nom === 'Sorceleur');
        }

        // Règle 2 : Retirer la profession Sorceleur pour les autres races
        let filtered = professions.filter(prof => prof.nom !== 'Sorceleur');

        // Règle 3 : Si ni Humain ni Elfe -> retirer Mage
        if (![humainId, elfeId].includes(raceIdNum)) {
          console.log('Filtrage Mage (race non compatible)');
          filtered = filtered.filter(prof => prof.nom !== 'Mage');
        }

        console.log('Professions finales:', filtered.map(p => p.nom));
        return filtered;
      })
    );
  }

  // --- Forcer le rechargement du cache (utile pour le refresh) ---
  refreshCache(): Observable<Profession[]> {
    this.invalidateCache();
    return this.getProfessionsList();
  }
}