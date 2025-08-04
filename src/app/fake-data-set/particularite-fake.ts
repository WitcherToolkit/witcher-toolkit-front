export const PARTICULARITE_SORCELEUR = [
    { idParticularite: 1, nom: "Sens accrus", description: "Les sorceleurs ont des sens plus développés que la moyenne des humains." },
    { idParticularite: 2, nom: "Mutation durable", description: "Les sorceleurs ont subi des mutations qui les rendent différents des autres humains." },
    { idParticularite: 3, nom: "Sensibilité émoussée", description: "Les sorceleurs ont une sensibilité émoussée par rapport aux autres humains." },
    { idParticularite: 4, nom: "Réflexes hors du commun", description: "Les sorceleurs ont des réflexes hors du commun." }
]

export const PARTICULARITE_ELFES = [
    { idParticularite: 5, nom: "Esthète", description: "Les elfes sont des êtres sensibles à la création artistique." },
    { idParticularite: 6, nom: "Oeil d'aigle", description: "Les elfes ont une vue perçante." },
    { idParticularite: 7, nom: "Harmonie avec la nature", description: "Les elfes ont une affinité particulière avec la nature." }
]

export const PARTICULARITE_NAINS = [
    { idParticularite: 8, nom: "Tanné comme le cuir", description: "Les nains sont réputés pour leur résistance physique." },
    { idParticularite: 9, nom: "Coriace", description: "Les nains sont coriace." },
    { idParticularite: 10, nom: "Oeil de l'expert", description: "Les nains repères facilement les petit détails." }
] 

export const PARTICULARITE_HUMAINS = [
    { idParticularite: 11, nom: "Digne de confiance", description: "Les humains sont réputés pour leur confiance." },
    { idParticularite: 12, nom: "Ingénieux", description: "Les humains sont ingénieux." },
    { idParticularite: 13, nom: "Têtu comme une mule", description: "Les humains sont têtu comme des muless." }
]

export const PARTICULARITE_HALFELINS = [
    { idParticularite: 14, nom: "Agile", description: "Les halfelins sont agiles." },
    { idParticularite: 15, nom: "Peuple agreste", description: "Les halfelins sont des peuples agrestes." },
    { idParticularite: 16, nom: "Résilicence à la magie", description: "Les halfelins sont résilient à la magie." }
]

export const PARTICULARITE_LIST = [
    ...PARTICULARITE_SORCELEUR,
    ...PARTICULARITE_ELFES,
    ...PARTICULARITE_NAINS,
    ...PARTICULARITE_HUMAINS,
    ...PARTICULARITE_HALFELINS
]