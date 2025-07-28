import { CompetenceProfession } from "./competence-profession";
import { InventaireWiki } from "./inventaireWiki";

export interface Profession {

    idProfession : number;

    nom : string;

    description : string;

    vigueur : number;

	maxSort : number;

	maxRituel : number;

	maxEnvoutement : number;

	pmaxInvocation : number;

    inventaireWikiList?: InventaireWiki;

    competenceList?: CompetenceProfession[]; // Correspond à la liste du backend<CompetenceProfessionVolatile>
}

export type ProfessionList = Profession[];