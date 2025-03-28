export interface Magie {
    idMagie: number;
    nom: string;
    cout: string;
    effet: string;
    portee: string;
    duree: string;
    nature: string;
    type: string;
    niveau: string;
    contre: string;
}

export type MagieList = Magie[];

export function getNatureColor(type: string): string {
    console.log(type);
    switch (type) {
      case 'Feu':
        return '#EF5350';
      case 'Eau':
        return '#42A5F5';
      case 'Terre':
        return '#66BB6A';
      case 'Air':
        return '#90CAF9';
      case 'Mixte':
        return '#b388ff';
      default:
        return '#303030';
    }
  }
  