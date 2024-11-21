import { Caracteristique } from "../model/caracteristique";
import { Competence } from "../model/competence";
import { Envoutement } from "../model/envoutement";
import { Equipement } from "../model/equipement";
import { Inventaire } from "../model/inventaire";
import { Joueur } from "../model/joueur";
import { Magie } from "../model/magie";
import { Personnage } from "../model/personnage";
import { Protection } from "../model/protection";
import { Rituel } from "../model/rituel";

export const JOUEUR: Joueur = 
    {
        id: 1,
        pseudo: "Meya",
        mail: "exemple@gmail.com",
        password: "Pa$$w0rd",
        admin: false
    };

export const CARACTERISTIQUES: Caracteristique[] = [
    {
        id: 1,
        nom:"INT",
        description: "Intelligence",
        valeur:"7",
        type:"generale"
    },{
        id: 2,
        nom:"REF",
        description: "Reflexe",
        valeur:"8",
        type:"generale"
    },{
        id: 3,
        nom:"DEX",
        description: "Dexterité",
        valeur:"7",
        type:"generale"
    },{
        id: 4,
        nom:"COR",
        description: "Corps",
        valeur:"10",
        type:"generale"
    },{
        id: 5,
        nom:"VIT",
        description: "Vitesse",
        valeur:"5",
        type:"generale"
    },{
        id: 6,
        nom:"EMP",
        description: "Empatie",
        valeur:"7",
        type:"generale"
    },{
        id: 7,
        nom:"TECH",
        description: "Technique",
        valeur:"7",
        type:"generale"
    },{
        id: 8,
        nom:"VOL",
        description: "Volonté",
        valeur:"9",
        type:"generale"
    },{
        id: 9,
        nom:"CHA",
        description: "Chance",
        valeur:"6",
        type:"generale"
    },{
        id: 10,
        nom:"ETOU",
        description: "Etourdissement",
        valeur:"9",
        type:"dérivée"
    },{
        id: 11,
        nom:"COU",
        description: "Course",
        valeur:"15",
        type:"dérivée"
    },{
        id: 12,
        nom:"SAUT",
        description: "Saut",
        valeur:"3",
        type:"dérivée"
    },{
        id: 13,
        nom:"PS",
        description: "Point de santé",
        valeur:"45",
        type:"dérivée"
    },{
        id: 14,
        nom:"END",
        description: "Endurence",
        valeur:"45",
        type:"dérivée"
    },{
        id: 15,
        nom:"ENC",
        description: "Encombrement",
        valeur:"125",
        type:"dérivée"
    },{
        id: 16,
        nom:"REC",
        description: "Récupération",
        valeur:"9",
        type:"dérivée"
    },{
        id: 17,
        nom:"Poings",
        description: "Poings",
        valeur:"1D6+4",
        type:"dérivée"
    },{
        id: 18,
        nom:"Pieds",
        description: "Pieds",
        valeur:"1D6+8",
        type:"dérivée"
    }
];

export const EQUIPEMENT: Equipement[] = [
    {
        id: 1,
        quantite: 1,
        nom: "Haume",
        effet: "visibilité restreinte",
        amelioration: "1",
        poid: 3.5,
        pouvoirArret: 20,
        type: "Tête",
        categorie: "Armure",
        sousCategorie: "légère",
        equipe: true
    },{
        id: 2,
        quantite: 1,
        nom: "Armure lourde de Hindarsfjall",
        effet: "-",
        amelioration: "1",
        poid: 15,
        pouvoirArret: 25,
        type: "Torse",
        categorie: "Armure",
        sousCategorie: "lourde",
        equipe: true
    },{
        id: 3,
        quantite: 1,
        nom: "Jambière Nilfgardienne",
        effet: "-",
        amelioration: "2",
        poid: 6,
        pouvoirArret: 2,
        type: "Jambes",
        categorie: "Armure",
        sousCategorie: "lourde",
        equipe: true
    },{
        id: 4,
        quantite: 1,
        nom: "Pavois",
        effet: "Couverture totale",
        amelioration: "1",
        poid: 4,
        pouvoirArret: 0,
        type: "Bouclier",
        categorie: "Armure",
        sousCategorie: "lourde",
        equipe: true
    },{
        id: 5,
        quantite: 1,
        nom: "Hache de berserkers",
        effet: "Ablation, Saignement (25%)",
        amelioration: "1",
        poid: 3,
        precision: "+0",
        degat: "6D6",
        fiabilite: 15,
        mains: 2,
        portee: "-",
        dissimulation: "-",
        type: "Haches",
        categorie: "Arme",
        equipe: true
    },{
        id: 6,
        quantite: 2,
        nom: "Dagues",
        precision: "+0",
        degat: "1D6+2",
        fiabilite: 10,
        mains: 1,
        portee: "-",
        effet: "-",
        dissimulation: "P",
        amelioration: "0",
        poid: 0.5,
        type: "Lame courte",
        categorie: "Arme",
        equipe: false
    },{
        id: 7,
        quantite: 1,
        nom: "Arc court",
        precision: "+0",
        degat: "3D6+3",
        fiabilite: 10,
        mains: 2,
        portee: "100 m",
        effet: "-",
        dissimulation: "-",
        amelioration: "0",
        poid: 0.5,
        type: "Arcs",
        categorie: "Arme",
        equipe: false
    },{
        id: 7,
        quantite: 10,
        nom: "Standard",
        fiabilite: 10,
        effet: "-",
        dissimulation: "G",
        poid: 0.5,
        type: "Projectiles",
        categorie: "Arme",
        equipe: false
    }
];

export const PROTECTION: Protection[] = [
    {
        id: 1,
        partieCorps: "Tête",
        pa: 7,
        degat: 7
    },{
        id: 2,
        partieCorps: "Torse",
        pa: 8,
        degat: 8
    },{
        id: 3,
        partieCorps: "Bras droit",
        pa: 7,
        degat: 7
    },{
        id: 4,
        partieCorps: "Bras gauche",
        pa: 10,
        degat: 10
    },{
        id: 5,
        partieCorps: "Jambe droite",
        pa: 5,
        degat: 5
    },{
        id: 6,
        partieCorps: "Jambe gauche",
        pa: 7,
        degat: 7
    },{
        id: 7,
        partieCorps: "Bouclier",
        pa: 7,
        degat: 7
    }
];

export const RITUELS: Rituel[] = [
    {
        id: 1,
        nom: "Hydromancie",
        cout: 5,
        effet: "Permet de fixer une petite flaque d’eau pour y apercevoir un évènement.;",
        temps: "5 rounds",
        sd: "15 (18)",
        duree: "actif (2 END)",
        composant: "une petite quantité d’eau ou un bol d’eau, éclat de lune (×1), fruit de berbéris (×1), cinquième essence (×2), perle (×2), pétale de myrte blanc (×2)"
}];

export const ENVOUTEMENTS: Envoutement[] = [
    {
        id: 1,
        nom: "L’envoûtement des Ombres",
        cout: 4,
        effet: "Rend la cible Paranoïaque.",
        danger: "Faible"
}];

export const MAGIES: Magie[] = [
    {
        id:1,
        nom: "Compas magique",
        element:"Mixte",
        niveau: "Novice",
        cout: 3,
        effet: "Indique le nord ou une destination déjà visité.",
        portee:"Personnelle",
        duree:"1d6 heures",
        contre:"-",
        type:"Sort"
    },{
        id:2,
        nom: "Télépathie",
        element:"Mixte",
        niveau: "Novice",
        cout: 2,
        effet: "communiquer par télépathie.",
        portee:"10m",
        duree:"Actif (1 END)",
        contre:"-",
        type:"Sort"
    },{
        id:3,
        nom: "Cenlly Graig",
        element:"Terre",
        niveau: "Novice",
        cout: 3,
        effet: "Jusqu'à 10 pierres acérées lancée sur votre adversaire (1D6/pierre).",
        portee:"5m",
        duree:"Instantané",
        contre:"Esquive ou blocage",
        type:"Sort"
    },{
        id:4,
        nom: "Abri d'’'Urien",
        element:"Air",
        niveau: "Novice",
        cout: 3,
        effet: "Annule la chaleur et le froid extrêmes, la pluie et la neige.",
        portee:"Rayon de 8m",
        duree:"	1d6 heures",
        contre:"Esquive ou blocage",
        type:"Sort"
    },{
        id:5,
        nom: "Griffes de feu",
        element:"Feu",
        niveau: "Novice",
        cout: 5,
        effet: "Créer des griffes de feu sur vos mains avec 25% de chance d'enflammer.(4D6)",
        portee:"Personnelle",
        duree:"	1d6 heures",
        contre:"Esquive ou blocage",
        type:"Sort"
    }
];

export const COMPETENCE: Competence[] = [
    {
        id: 1,
        nom:"Connaissance de la rue",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "INT",
        type: "exclusive",
        valeur: 9
    },{
        id: 2,
        nom:"Éducation",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "INT",
        type: "générale",
        valeur: 6
    },{
        id: 3,
        nom:"Langue ancienne",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "INT",
        type: "générale",
        valeur: 8
    },{
        id: 4,
        nom:"Langue commune",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "INT",
        type: "générale",
        valeur: 9
    },{
        id: 5,
        nom:"Négoce",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "INT",
        type: "générale",
        valeur: 8
    },{
        id: 6,
        nom:"Bagarre",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "RÉF",
        type: "générale",
        valeur: 8
    },{
        id: 7,
        nom:"Escrime",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "RÉF",
        type: "générale",
        valeur: 5
    },{
        id: 8,
        nom:"Larme courte",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "RÉF",
        type: "générale",
        valeur: 9
    },{
        id: 9,
        nom:"Mêlée",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "RÉF",
        type: "générale",
        valeur: 6
    },{
        id: 10,
        nom:"Arbalète",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "DEX",
        type: "générale",
        valeur: 8
    },{
        id: 11,
        nom:"Physique",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "COR",
        type: "générale",
        valeur: 10
    },{
        id: 12,
        nom:"Résilence",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "COR",
        type: "générale",
        valeur: 6
    },{
        id: 13,
        nom:"Beaux-art",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "EMP",
        type: "générale",
        valeur: 8
    },{
        id: 14,
        nom:"Charisme",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "EMP",
        type: "générale",
        valeur: 7
    },{
        id: 15,
        nom:"Jeu",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "EMP",
        type: "générale",
        valeur: 8
    },{
        id: 16,
        nom:"Persuasion",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "EMP",
        type: "générale",
        valeur: 7
    },{
        id: 17,
        nom:"Psychologie",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "EMP",
        type: "générale",
        valeur: 9
    },{
        id: 18,
        nom:"Résistance à la contrainte",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        caracteristique: "VOL",
        type: "générale",
        valeur: 8
    }
];

export const INVENTAIRE: Inventaire[] = [
    {
        id: 1,
        quantite: 1,
        nom: "Blisard",
        effet: "+4 RÉF après élimination d'un ennemi. Les éliminations suivantes n'augmentent pas la valeur du bonus.",
        durée: "10 rounds",
        toxicite: "75%",
        categorie: "Potion",
    },{
        id: 2,
        quantite: 1,
        nom: "pierre à briquet",
        effet: "-",
        poid: 6,
        categorie: "Divers",
    },{
        id: 3,
        quantite: 10,
        nom: "poudre Zerrikanienne",
        effet: "-",
        poid: 6,
        categorie: "Composants",
    }
];

export const PERSONNAGE: Personnage ={
    id: 1,
    nom: "Zoltan Chivay",
    photo: "blob:https://www.ecosia.org/09767dc4-b019-4f3f-80c9-1a7c36be9e98",
    template: false,
    race: "Nains",
    genre: "H",
    age: 80,
    terreNatale: "Royaume du Nord",
    profession: "Marchand",
    pointXP: 10,
    reputation: "bonne",
    joueur: JOUEUR,
    description:"Zoltan Chivay est un non-humain de la race des nains, vétéran de la deuxième guerre Nilfgaard-Nordique, et ami proche de Geralt. La première rencontre entre les deux eut lieu lorsque Geralt et son entourage se dirigeait vers la Iaruga venant de Brokilon. Lors de la rencontre, le nain les conseilla de se joindra à son équippe et d'aller vers l'est. C'est aussi de Zoltan que Geralt a reçu son glaive - Sihil.",
    protection: PROTECTION,
    equipement: EQUIPEMENT,
    inventaire: INVENTAIRE,
    rituels: RITUELS,
    envoutements: ENVOUTEMENTS,
    magies: MAGIES,
    competences: COMPETENCE,
    caracteristiques: CARACTERISTIQUES,
};