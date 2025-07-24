export interface Caracteristique {
    idCaracteristique : number; // TODO A voir si necessaire côté front
    code : string;
    nom : string;
    description : string;
}

export type CaracteristiqueList = Caracteristique[];
