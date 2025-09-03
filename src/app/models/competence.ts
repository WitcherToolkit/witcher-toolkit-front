import { Caracteristique } from "./caracteristique";

export interface Competence {

    idCompetence: number;

    nom: string;

    description: string;

    prerequis?: string;

    specialisation?: string;

    exclusive: boolean;

    caracteristique?: Caracteristique;

    step?: number;

    type?: string;

    //professions?: Profession[]; //pour éviter les dépendence cyclique, on ne met pas les professions ici
}

export type CompetenceList = Competence[];