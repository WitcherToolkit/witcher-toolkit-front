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
    //campagne : Campagne;
    //user : User;
}
