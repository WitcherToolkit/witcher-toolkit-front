import { Injectable } from '@angular/core';
import { EnvironmentConfig } from '../environment.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FichePersonnageService {

  // --- URL de base pour les requêtes fiches personnage ---
  private readonly apiUrl = `${EnvironmentConfig.apiBaseUrl}/personnages`;
  
  constructor(private http: HttpClient) { }

  // --- Méthode pour récupérer une fiche personnage par son ID ---
  getFichePersonnageById(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // --- Méthode pour créer une fiche personnage ---
  createFichePersonnage(fichePersonnage: any) {
    console.log('Creating fiche personnage:', fichePersonnage);
    return this.http.post(`${this.apiUrl}/create`, fichePersonnage);
  }
  
}
