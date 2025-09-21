import { Routes } from '@angular/router';
import { HomePageComponent } from '../home/home-page/home-page.component';
import { EnvoutementsListComponent } from '../envoutements/envoutements-list/envoutements-list.component';
import { RituelsListComponent } from '../rituels/rituels-list/rituels-list.component';
import { SortsListComponent } from '../sorts/sorts-list/sorts-list.component';
import { CompetencesListComponent } from '../competences/competences-list/competences-list.component';
import { CaracteristiquesListComponent } from '../caracteristiques/caracteristiques-list/caracteristiques-list.component';
import { RacesListComponent } from '../races/races-list/races-list.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { CreatePersonComponent } from '../fiche-personnage/create-person/create-person.component';
import { ProfessionsListComponent } from '../professions/professions-list/professions-list.component';
import { ConsultCharacterComponent } from '../fiche-personnage/consult-person/consult-character.component';
import { RacesUpdateComponent } from '../races/races-update/races-update.component';
import { ProfessionsUpdateComponent } from '../professions/professions-update/professions-update.component';
import { CARACTERISTIQUE_LIST_PATH, COMPTETENCE_LIST_PATH, ENVOUTEMENT_LIST_PATH, ERROR_404_PATH, HOME_PATH, MAGIE_LIST_PATH, PERSONNAGE_CONSULT_PATH, PERSONNAGE_CREATE_PATH, PROFESSION_CREATE_PATH, PROFESSION_LIST_PATH, PROFESSION_UPDATE_PATH, RACE_CREATE_PATH, RACE_LIST_PATH, RACE_UPDATE_PATH, RITUEL_LIST_PATH } from './app-routing-constants';
import { LoginComponent } from '../auth/login/login.component';
import { authGuard } from '../shared/shared-services/auth.guard';




export const PERSONNAGE_BASE_PATH = 'personnage';

//Les routes on été externalisés, elles sont toutes regroupées dans un fichier app.routes.ts
export const routes: Routes = [
    // Auth accessible à tous
    { path: 'login', component: LoginComponent },

    // Toutes les autres routes protégées
    {
        path: '',
        canActivate: [authGuard],
        children: [
            //Partie grimoire
            { path: ENVOUTEMENT_LIST_PATH, component: EnvoutementsListComponent },
            { path: RITUEL_LIST_PATH, component: RituelsListComponent },
            { path: MAGIE_LIST_PATH, component: SortsListComponent },
            //Partie Aptitudes
            { path: COMPTETENCE_LIST_PATH, component: CompetencesListComponent },
            { path: CARACTERISTIQUE_LIST_PATH, component: CaracteristiquesListComponent },
            //Partie Classe
            { path: RACE_LIST_PATH, component: RacesListComponent },
            { path: `${RACE_UPDATE_PATH}/:id`, component: RacesUpdateComponent },
            { path: RACE_CREATE_PATH, component: RacesUpdateComponent },
            { path: PROFESSION_LIST_PATH, component: ProfessionsListComponent },
            { path: `${PROFESSION_UPDATE_PATH}/:id`, component: ProfessionsUpdateComponent },
            { path: PROFESSION_CREATE_PATH, component: ProfessionsUpdateComponent },
            //Partie fiche personnage
            { path: PERSONNAGE_CREATE_PATH, component: CreatePersonComponent },
            { path: `${PERSONNAGE_CONSULT_PATH}/:id`, component: ConsultCharacterComponent },
            //Page d'accueil
            { path: HOME_PATH, component: HomePageComponent },
            { path: '', redirectTo: HOME_PATH, pathMatch: 'full' },
            // PageNotFound protégée
            { path: ERROR_404_PATH, component: PageNotFoundComponent }
        ]
    },
    // Wildcard pour toute autre route non trouvée
    { path: '**', redirectTo: ERROR_404_PATH }
];

