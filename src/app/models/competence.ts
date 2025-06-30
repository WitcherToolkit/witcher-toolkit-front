import { Caracteristique } from "./caracteristique";
import { Profession } from "./profession";

export interface Competence {
    idCompetence: number;
    nom: string;
    description: string;
    descriptionBase10?: string;
    descriptionBase13?: string;
    descriptionBase16?: string;
    descriptionBase20?: string;
    specialisation?: string;
    exclusif: boolean;
    caracteristique?: Caracteristique
    tags?: string[];
    professions?: Profession[];
}

export type CompetenceList = Competence[];