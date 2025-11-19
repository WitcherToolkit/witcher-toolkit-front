import { Particularite } from "./particularite";
import { ReputationWiki } from "./reputation-wiki";

export interface Race {

    idRace: string;
    
    nom: string;
    
    reputationWikiList: ReputationWiki[];
    
    particulariteList: Particularite[];

}

export type RaceList = Race[];
