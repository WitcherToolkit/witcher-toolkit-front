import { race } from "rxjs";

export const REPUTATION_SORCELEUR = [
    { id: 1, territoire: "Nord", valeur: "Craint et haïs" },
    { id: 2, territoire: "Nilfgaard", valeur: "Craint et haïs" },
    { id: 3, territoire: "Skellige", valeur: "Toléré" },
    { id: 4, territoire: "Dol Blathana", valeur: "Toléré" },
    { id: 5, territoire: "Mahakam", valeur: "Toléré" }
]

export const REPUTATION_ELFES = [
    { id: 6, territoire: "Nord", valeur: "Haïs" },
    { id: 7, territoire: "Nilfgaard", valeur: "Neutre" },
    { id: 8, territoire: "Skellige", valeur: "Neutre" },
    { id: 9, territoire: "Dol Blathana", valeur: "Neutre" },
    { id: 10, territoire: "Mahakam", valeur: "Neutre" }
]

export const REPUTATION_NAINS = [
    { id: 11, territoire: "Nord", valeur: "Toléré" },
    { id: 12, territoire: "Nilfgaard", valeur: "Neutre" },
    { id: 13, territoire: "Skellige", valeur: "Neutre" },
    { id: 14, territoire: "Dol Blathana", valeur: "Neutre" },
    { id: 15, territoire: "Mahakam", valeur: "Neutre" }
]

export const REPUTATION_HUMAINS = [
    { id: 16, territoire: "Nord", valeur: "Neutre" },
    { id: 17, territoire: "Nilfgaard", valeur: "Neutre" },
    { id: 18, territoire: "Skellige", valeur: "Neutre" },
    { id: 19, territoire: "Dol Blathana", valeur: "Haïs" },
    { id: 20, territoire: "Mahakam", valeur: "Tolérés" }
]

export const REPUTATION_HALFELINS = [
    { id: 21, territoire: "Nord", valeur: "Toléré" },
    { id: 22, territoire: "Nilfgaard", valeur: "Neutre" },
    { id: 23, territoire: "Skellige", valeur: "Neutre" },
    { id: 24, territoire: "Dol Blathana", valeur: "Neutre" },
    { id: 25, territoire: "Mahakam", valeur: "Neutre" }
]

export const REPUTATION_LIST = [
    ...REPUTATION_SORCELEUR,
    ...REPUTATION_ELFES,
    ...REPUTATION_NAINS,
    ...REPUTATION_HUMAINS,
    ...REPUTATION_HALFELINS
]