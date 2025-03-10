import { RaceList } from "../models/race";
import { PARTICULARITE_ELFES, PARTICULARITE_HALFELINS, PARTICULARITE_HUMAINS, PARTICULARITE_NAINS, PARTICULARITE_SORCELEUR } from "./particularite-fake";
import { REPUTATION_ELFES, REPUTATION_HALFELINS, REPUTATION_HUMAINS, REPUTATION_NAINS, REPUTATION_SORCELEUR } from "./reputation-wiki-fake";

export const HUMAIN         = { id: 1, nom: "Humain", particularites: PARTICULARITE_HUMAINS, reputations: REPUTATION_HUMAINS };
export const NAIN           = { id: 2, nom: "Nain", particularites: PARTICULARITE_NAINS, reputations: REPUTATION_NAINS };
export const ELFE           = { id: 3, nom: "Elfe", particularites: PARTICULARITE_ELFES , reputations: REPUTATION_ELFES };
export const HALFELIN       = { id: 4, nom: "Halfelin", particularites: PARTICULARITE_HALFELINS, reputations: REPUTATION_HALFELINS };
export const SORCELEUR_RACE = { id: 5, nom: "Sorceleur", particularites: PARTICULARITE_SORCELEUR, reputations: REPUTATION_SORCELEUR };

export const RACE_LIST: RaceList = [
    HUMAIN,
    NAIN,
    ELFE,
    HALFELIN,
    SORCELEUR_RACE
]