import { Injectable, Signal, signal } from '@angular/core';
import { Caracteristique } from '../models/caracteristique';
import { Observable } from 'rxjs';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RacesService } from '../races/races.service';
import { ProfessionsService } from '../professions/professions.service';
import { EnvironmentConfig } from '../environment.config';
import { POINGS_PIEDS_TABLE, SECONDARY_STATS_TABLE } from '../shared/shared-constants/caracteristique-tables.constants';

@Injectable({
  providedIn: 'root'
})
export class CaracteristiqueService {
  // --- Signal pour la liste des caractéristiques ---
  private readonly caracteristiques = signal<Caracteristique[]>([]);
  // --- URL de base pour les requêtes caractéristiques ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/caracteristiques`;

  constructor(private http: HttpClient, private fb: FormBuilder, private racesService: RacesService, private professionsService: ProfessionsService) {}

  // --- Récupérer la liste des caractéristiques ---
  getCaracteristiquesList(): Observable<Caracteristique[]> {
    console.info('Fetching caracteristiques from API...');
    console.log(`API Base URL: ${this.apiUrl}`);
    return this.http.get<Caracteristique[]>(this.apiUrl);
  }

  // --- Mettre à jour une caractéristique existante ---
  updateCaracteristique(caracteristique: Caracteristique): Observable<Caracteristique> {
    console.log('Updating caracteristique:', caracteristique);
    return this.http.put<Caracteristique>(`${this.apiUrl}/update/${caracteristique.idCaracteristique}`, caracteristique);
  }

  // --- Créer un nouveau caractéristique (sans idCaracteristique, géré côté API) ---
  createCaracteristique(caracteristique: Omit<Caracteristique, 'idCaracteristique'> | Partial<Caracteristique>): Observable<Caracteristique> {
    console.log('Creating caracteristique:', caracteristique);
    return this.http.post<Caracteristique>(`${this.apiUrl}/create`, caracteristique);
  }

  // --- Supprimer une caractéristique par son ID ---
  deleteCaracteristique(id: number): Observable<void> {
    console.log('Deleting caracteristique with id:', id);
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // --- Récupérer les valeurs de poings et pieds en fonction de la valeur de COR ---
  getPoingsPiedsValues(corValue: number) {
    return POINGS_PIEDS_TABLE[corValue] || { poings: '', pieds: '' };
  }

  // --- Récupérer les valeurs secondaires (PS, END, RÉC, ÉTOU) via table ---
  getValuesSecondaires(average: number) {
    return SECONDARY_STATS_TABLE[average] || { PS: 0, END: 0, RÉC: 0, ÉTOU: 0 };
  }

}
