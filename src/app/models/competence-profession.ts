
import { Competence } from "./competence";

export interface CompetenceProfession {
    idCompetenceProfession?: number;
    idProfession: number;
    idCompetence: number;
    competence: Competence; // C'est la partie cruciale : un objet Compétence complet
    // profession ?: Profession ; // Évitez les références circulaires si Profession contient également CompetenceProfession
}
