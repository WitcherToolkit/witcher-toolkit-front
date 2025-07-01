import { Caracteristique } from "./caracteristique";
import { Profession } from "./profession";

export interface Competence {
    idCompetence: number;
    nom: string;
    description: string;
    prerequis?: string;
    specialisation?: string;
    exclusif: boolean;
    caracteristique?: Caracteristique
    tags?: string;
    professions?: Profession[];
}

export type CompetenceList = Competence[];