import { Caracteristique } from "./caracteristique";
import { CaracteristiquePersonnage } from "./caracteristique-personnage";
import { CompetencePersonnage } from "./competence-personnage";
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
    competencePersonnage : CompetencePersonnage[];
    pieds: string;
    poings: string;
    vigueur: number;
    inventaires : Inventaire[];
    //campagne : Campagne;
    //user : User;
}
