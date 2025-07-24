import { Caracteristique } from "./caracteristique";
import { Profession } from "./profession";

export interface Competence {
    idCompetence: number; // TODO A voir si necessaire côté front
    nom: string;
    description: string;
    prerequis?: string;
    specialisation?: string;
    exclusif: boolean;
    caracteristique?: Caracteristique
    tags?: string;
    //professions?: Profession[]; poue éviter les dépendence cyclique, on ne met pas les professions ici
}

export type CompetenceList = Competence[];