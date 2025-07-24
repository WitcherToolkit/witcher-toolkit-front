import { CompetenceProfession } from "./competence-profession";

export interface Profession {
    idProfession : number;
    nom : string;
    description : string;
    competenceList?: CompetenceProfession[]; // Correspond à la liste du backend<CompetenceProfessionVolatile>
}

export type ProfessionList = Profession[];