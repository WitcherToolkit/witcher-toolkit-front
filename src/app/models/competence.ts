import { Caracteristique } from "./caracteristique";

export interface Competence {

    idCompetence: number;

    nom: string;

    description: string;

    prerequis?: string;

    specialisation?: string;

    isExclusive: boolean;

    caracteristique?: Caracteristique

    //tags?: string; // revoir l'utilisation des tags...
    //professions?: Profession[]; //pour éviter les dépendence cyclique, on ne met pas les professions ici
}

export type CompetenceList = Competence[];