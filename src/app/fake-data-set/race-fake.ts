import { RaceList } from "../models/race";
import { PARTICULARITE_ELFES, PARTICULARITE_HALFELINS, PARTICULARITE_HUMAINS, PARTICULARITE_NAINS, PARTICULARITE_SORCELEUR } from "./particularite-fake";
import { REPUTATION_ELFES, REPUTATION_HALFELINS, REPUTATION_HUMAINS, REPUTATION_NAINS, REPUTATION_SORCELEUR } from "./reputation-wiki-fake";

export const HUMAIN         = { idRace: 1, nom: "Humain", particularites: PARTICULARITE_HUMAINS, reputations: REPUTATION_HUMAINS };
export const NAIN           = { idRace: 2, nom: "Nain", particularites: PARTICULARITE_NAINS, reputations: REPUTATION_NAINS };
export const ELFE           = { idRace: 3, nom: "Elfe", particularites: PARTICULARITE_ELFES , reputations: REPUTATION_ELFES };
export const HALFELIN       = { idRace: 4, nom: "Halfelin", particularites: PARTICULARITE_HALFELINS, reputations: REPUTATION_HALFELINS };
export const SORCELEUR_RACE = { idRace: 5, nom: "Sorceleur", particularites: PARTICULARITE_SORCELEUR, reputations: REPUTATION_SORCELEUR };

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