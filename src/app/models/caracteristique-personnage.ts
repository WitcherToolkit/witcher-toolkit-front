import { Caracteristique } from "./caracteristique";
import { Personnage } from "./personnage";

export interface CaracteristiquePersonnage {
    valeurActuelle : number;
    valeurMax : number;
    caracteristique : Caracteristique;
    //personnage: Personnage
}
