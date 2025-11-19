
import { Competence } from "./competence";

export interface CompetenceProfession {
    idCompetenceProfession?: string;
    idProfession: string;
    idCompetence: string;
    competence: Competence; // C'est la partie cruciale : un objet Compétence complet
    // profession ?: Profession ; // Évitez les références circulaires si Profession contient également CompetenceProfession
}
