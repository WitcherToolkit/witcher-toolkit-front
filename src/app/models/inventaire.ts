import { Personnage } from "./personnage";

export interface Inventaire {

    idInventaire: number;

    quantite: number;

    nom: string;

    type: string;

    effet: string;
    
}

export type InventaireList = Inventaire[];