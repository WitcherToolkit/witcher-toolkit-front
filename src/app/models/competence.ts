import { Caracteristique } from "./caracteristique";
import { Profession } from "./profession";

export interface Competence {
    id: number;
    nom: string;
    description: string;
    specialisation?: string;
    exclusif: boolean;
    caracteristique?: Caracteristique
    tags?: string[];
    professions?: Profession[];
}

export type CompetenceList = Competence[];