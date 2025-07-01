import { RaceList } from "../models/race";
import { PARTICULARITE_ELFES, PARTICULARITE_HALFELINS, PARTICULARITE_HUMAINS, PARTICULARITE_NAINS, PARTICULARITE_SORCELEUR } from "./particularite-fake";
import { REPUTATION_ELFES, REPUTATION_HALFELINS, REPUTATION_HUMAINS, REPUTATION_NAINS, REPUTATION_SORCELEUR } from "./reputation-wiki-fake";

export const HUMAIN         = { idRace: 1, nom: "Humain", particulariteList: PARTICULARITE_HUMAINS, reputationWikiList: REPUTATION_HUMAINS };
export const NAIN           = { idRace: 2, nom: "Nain", particulariteList: PARTICULARITE_NAINS, reputationWikiList: REPUTATION_NAINS };
export const ELFE           = { idRace: 3, nom: "Elfe", particulariteList: PARTICULARITE_ELFES , reputationWikiList: REPUTATION_ELFES };
export const HALFELIN       = { idRace: 4, nom: "Halfelin", particulariteList: PARTICULARITE_HALFELINS, reputationWikiList: REPUTATION_HALFELINS };
export const SORCELEUR_RACE = { idRace: 5, nom: "Sorceleur", particulariteList: PARTICULARITE_SORCELEUR, reputationWikiList: REPUTATION_SORCELEUR };

export const RACE_LIST: RaceList = [
    HUMAIN,
    NAIN,
    ELFE,
    HALFELIN,
    SORCELEUR_RACE
]
export const RACE_MAP: { [key: number]: string } = RACE_LIST.reduce((map, race) => {
    map[race.idRace] = race.nom;
    return map;
  }, {} as { [key: number]: string });