import { Competence } from "./competence";

export interface CompetenceProfession {
    idCompetenceProfession : number;
    // idProfession : number; // Le backend envoie l'objet ProfessionVolatile complet, pas seulement l'ID.
    // idCompetence : number; // Le backend envoie l'objet CompetenceVolatile complet, pas seulement l'ID.
    competence: Competence; // C'est la partie cruciale : un objet Compétence complet
    // profession ?: Profession ; // Évitez les références circulaires si Profession contient également CompetenceProfession
}
