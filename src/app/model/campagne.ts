import { Joueur } from "./joueur";

export class Campagne {
    id: number;
    nom: string;
    demarrer: boolean;
    joueur: Joueur;
}