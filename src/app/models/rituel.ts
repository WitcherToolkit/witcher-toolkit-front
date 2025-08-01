export interface Rituel {
    idRituel: number;
    nom: string;
    cout: string;
    effet: string;
    tempsPreparation: string;
    sd: string;
    duree: string;
    composant: string;
    niveau: string;
}

export type RituelList = Rituel[];

