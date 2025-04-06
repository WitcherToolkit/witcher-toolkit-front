import { Particularite } from "./particularite";
import { ReputationWiki } from "./reputation-wiki";

export interface Race {
    idRace: number;
    nom: string;
    reputations: ReputationWiki[];
    particularites: Particularite[];
}

export type RaceList = Race[];
