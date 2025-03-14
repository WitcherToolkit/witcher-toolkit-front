import { Caracteristique } from "./caracteristique";
import { CaracteristiquePersonnage } from "./caracteristique-personnage";
import { Inventaire } from "./inventaire";
import { Profession } from "./profession";
import { Race } from "./race";

export interface Personnage {
    nomPersonnage : string;
    nomJoueur : string;
    // nomImage : string;
    // urlImage : string;
    genre : string;
    terreNatale : string;
    xp : number;
    age : number;
    bestiaire : boolean;
    hisorique : string;
    profession : Profession;
    race : Race;
    caracteristiquePersonnage : CaracteristiquePersonnage[];
    pieds: string;
    poings: string;
    inventaires : Inventaire[];
    //campagne : Campagne;
    //user : User;
}
