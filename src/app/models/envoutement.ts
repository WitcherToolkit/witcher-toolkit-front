export interface Envoutement {
    idEnvoutement: number;
    nom: string;
    cout: string;
    effet: string;
    prerequis: string;
    danger: string;
}

export type EnvoutementList = Envoutement[];

export function getDangerColor(type: string): string {
    switch (type) {
        case 'Élevé':
          return '#EF5350';
        case 'Faible':
          return '#66BB6A';
        case 'Modéré':
          return '#ffd388';
        default:
          return '#303030';
      }
}
