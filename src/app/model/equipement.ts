export class Equipement {
    id: number;
    quantite: number;
    nom: string;
    effet: string;
    amelioration?: string;
    poid: number;
    precision?: string;
    degat?: string;
    fiabilite?: number;
    mains?:number;
    portee?: string;
    dissimulation?: string;
    pouvoirArret?: number;
    type: string;
    categorie: string;
    sousCategorie?: string;
    equipe: boolean;
}