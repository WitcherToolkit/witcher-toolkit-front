import { Routes } from '@angular/router';
import { HomePageComponent } from '../home/home-page/home-page.component';
import { EnvoutementsListComponent } from '../envoutements/envoutements-list/envoutements-list.component';
import { EnvoutementsDetailComponent } from '../envoutements/envoutements-detail/envoutements-detail.component';
import { RituelsDetailComponent } from '../rituels/rituels-detail/rituels-detail.component';
import { RituelsListComponent } from '../rituels/rituels-list/rituels-list.component';
import { SortsDetailComponent } from '../sorts/sorts-detail/sorts-detail.component';
import { SortsListComponent } from '../sorts/sorts-list/sorts-list.component';
import { CompetencesListComponent } from '../competences/competences-list/competences-list.component';
import { CaracteristiquesListComponent } from '../caracteristiques/caracteristiques-list/caracteristiques-list.component';
import { RacesListComponent } from '../races/races-list/races-list.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { CreatePersonComponent } from '../fiche-personnage/create-person/create-person.component';
import { ProfessionsListComponent } from '../professions/professions-list/professions-list.component';
import { RacesDetailComponent } from '../races/races-detail/races-detail.component';


export const ENVOUTEMENT_BASE_PATH = 'grimoire';
export const RITUEL_BASE_PATH = 'grimoire';
export const MAGIE_BASE_PATH = 'grimoire';
export const COMPTETENCE_BASE_PATH = 'aptitude';
export const CARACTERISTIQUE_BASE_PATH = 'aptitude';
export const RACE_BASE_PATH = 'classe';
export const PROFESSION_BASE_PATH = 'classe';
export const PERSONNAGE_BASE_PATH = 'personnage';

//Les routes on été externalisés, elles sont toutes regroupées dans un fichier app.routes.ts
export const routes: Routes = [
    //Partie grimoire
    { path: `${ENVOUTEMENT_BASE_PATH}/envoutement/:id`, component: EnvoutementsDetailComponent },
    { path: `${ENVOUTEMENT_BASE_PATH}/envoutement`, component: EnvoutementsListComponent },
    { path: `${RITUEL_BASE_PATH}/rituel/:id`, component: RituelsDetailComponent },
    { path: `${RITUEL_BASE_PATH}/rituel`, component: RituelsListComponent },
    { path: `${MAGIE_BASE_PATH}/magie/:id`, component: SortsDetailComponent },
    { path: `${MAGIE_BASE_PATH}/magie`, component: SortsListComponent },
    //Partie Aptitudes
    { path: `${COMPTETENCE_BASE_PATH}/competence`, component: CompetencesListComponent },
    { path: `${CARACTERISTIQUE_BASE_PATH}/caracteristique`, component: CaracteristiquesListComponent },
    //Patie Classe 
    { path: `${RACE_BASE_PATH}/race/:id`, component: RacesDetailComponent },
    { path: `${RACE_BASE_PATH}/race`, component: RacesListComponent },
    { path: `${PROFESSION_BASE_PATH}/profession`, component: ProfessionsListComponent },
    //Parite fiche personnage
    { path: `${PERSONNAGE_BASE_PATH}/nouveau`, component: CreatePersonComponent },

    { path: 'home', component: HomePageComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    
    { path: '**', component: PageNotFoundComponent } //Page 404, a laisser en dernier !
];

