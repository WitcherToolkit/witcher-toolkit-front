import { Personnage } from "./personnage";

export interface Inventaire {
    id: number;
    nom: string;
    type: string;
    effet: string;
    quantite: number;
    personnage: Personnage;
}

export type InventaireList = Inventaire[];