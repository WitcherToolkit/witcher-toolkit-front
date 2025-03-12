export const HOMME_D_ARME = { id: 1, nom: "Homme d'armes", description: "\"Un soldat pense en tacticien. il sait quand prapper et quand se replier, quand charger et quand tenir sa position.\" - Vernon Roche" };
export const MAGE =         { id: 2, nom: "Mage", description: "\"La magie, c'est le chaos, l'art et la science. C'est un bénédiction, une malédiction et un progrès.\" - Yennefer de Vengerberg" };
export const CRIMINEL =     { id: 3, nom: "Criminel", description: "\"Le visage de la future impératrice porte ma signature, un exploit dont je suis extrêmement fier.\" - Stefan Skellen" };
export const PRETRE =       { id: 4, nom: "Prêtre", description: "\"Nour recherchons l'harmonie, l'équilibre en toute chose, pas simplement le nombtre de truitre peuplant les rivières.\" - Sac-à-souris" };  
export const MARCHAND =     { id: 5, nom: "Marchand", description: "\"J'a itrouvé un acheteur très intéréssé par ma collection, il ne me manque que trois cartes.\" - Zoltan Chivay" };
export const ARTISAN =      { id: 6, nom: "Artisan", description: "\"Laissez tomber cette camelote! Je vous forgerai une épée capable d'anéantir les dieux.\" - Éibhear Hattori" };
export const SORCELEUR =    { id: 7, nom: "Sorceleur", description: "\"Le monde a besoin d'un professionnel, pas d'un héros.\" - Géralt de Riv" };
export const BARDE =        { id: 8, nom: "Barde", description: "\"Je suis un poète, gente dame. Je suis venu louer votre beauté surnaturelle, pourvu que vous me fassiez l'honneur de me révéler tout les secrets de votre être\" - Jaskier" };
export const DOCTEUR =      { id: 9, nom: "Docteur", description: "\"Je me rend à l'hôpital Saint Lebioda de Wyzima pour aider à endiguer l'épidémie de Catriona\" - Shani" };
export const NOBLE =        { id: 10, nom: "Noble", description: "\"Dans l'intérêt du royaume, il est parfois nécessaire de nouer des alliancesdélicates. Y compris des alliances avec des sorceleurs.\" - Morvan Voorhis" };

export const PROFESSION_LIST = [
    HOMME_D_ARME,
    MAGE,
    CRIMINEL,
    PRETRE,
    MARCHAND,
    ARTISAN,
    SORCELEUR,
    BARDE,
    DOCTEUR,
    NOBLE
]

export const PROFESSION_MAP: { [key: number]: string } = PROFESSION_LIST.reduce((map, profession) => {
    map[profession.id] = profession.nom;
    return map;
  }, {} as { [key: number]: string });