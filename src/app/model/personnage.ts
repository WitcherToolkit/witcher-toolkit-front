import { Campagne } from "./campagne";
import { Caracteristique } from "./caracteristique";
import { Competence } from "./competence";
import { Envoutement } from "./envoutement";
import { Equipement } from "./equipement";
import { Inventaire } from "./inventaire";
import { Joueur } from "./joueur";
import { Magie } from "./magie";
import { Protection } from "./protection";
import { Rituel } from "./rituel";

export class Personnage {
    id: number;
    nom: string;
    photo: string;
    template: Boolean;
    race: string;
    genre: string;
    age: number;
    terreNatale: string;
    profession: string;
    pointXP: number;
    reputation: string;
    campagne?: Campagne;
    joueur: Joueur;
    description : string
    protection: Array<Protection>;
    equipement: Array<Equipement>
    inventaire: Array<Inventaire>;
    rituels: Array<Rituel>;
    envoutements: Array<Envoutement>;
    magies: Array<Magie>;
    competences: Array<Competence>;
    caracteristiques: Array<Caracteristique>;
}