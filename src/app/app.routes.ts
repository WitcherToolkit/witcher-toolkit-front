import { Routes } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { EnvoutementsListComponent } from './envoutements/envoutements-list/envoutements-list.component';
import { EnvoutementsDetailComponent } from './envoutements/envoutements-detail/envoutements-detail.component';
import { RituelsDetailComponent } from './rituels/rituels-detail/rituels-detail.component';
import { RituelsListComponent } from './rituels/rituels-list/rituels-list.component';
import { SortsDetailComponent } from './sorts/sorts-detail/sorts-detail.component';
import { SortsListComponent } from './sorts/sorts-list/sorts-list.component';
import { CompetencesListComponent } from './competences/competences-list/competences-list.component';
import { CaracteristiquesListComponent } from './caracteristiques/caracteristiques-list/caracteristiques-list.component';
import { RaceListComponent } from './race/race-list/race-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

//Les routes on été externalisés, elles sont toutes regroupées dans un fichier app.routes.ts
export const routes: Routes = [
    //Partie grimoire
    { path: 'grimoire/envoutement/:id', component: EnvoutementsDetailComponent },
    { path: 'grimoire/envoutement', component: EnvoutementsListComponent },
    { path: 'grimoire/rituel/:id', component: RituelsDetailComponent },
    { path: 'grimoire/rituel', component: RituelsListComponent },
    { path: 'grimoire/magie/:id', component: SortsDetailComponent },
    { path: 'grimoire/magie', component: SortsListComponent },
    //Partie Aptitudes
    { path: 'aptitude/competence', component: CompetencesListComponent },
    { path: 'aptitude/caracteristique', component: CaracteristiquesListComponent },
    //Patie Classe 
    { path: 'classse/race', component: RaceListComponent },

    { path: 'home', component: HomePageComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    
    { path: '**', component: PageNotFoundComponent } //Page 404, a laisser en dernier !
];
