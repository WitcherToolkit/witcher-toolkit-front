import { Injectable, signal } from '@angular/core';
import { ENVOUTEMENT_LIST } from '../fake-data-set/envoutement-fake';
import { Envoutement } from '../models/envoutement';

@Injectable({
  providedIn: 'root'
})
export class EnvoutementService {

  private readonly envoutements = signal<Envoutement[]>(ENVOUTEMENT_LIST);

  getEnvoutementList(): Envoutement[] {
    return this.envoutements();
  }

  searchEnvoutements(term: string): Envoutement[] {
    const lowerTerm = term.trim().toLowerCase();
    const list = this.getEnvoutementList();

    if (!lowerTerm) return list;

    return list.filter(e =>
      e.nom.toLowerCase().includes(lowerTerm)
    );
  }

  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Prévu pour plus tard (REST API) :
  /*
  constructor(private http: HttpClient) {}

  getEnvoutementList(): Observable<Envoutement[]> {
    return this.http.get<Envoutement[]>('url/api/envoutements');
  }
  */
}