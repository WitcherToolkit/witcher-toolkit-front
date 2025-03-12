export const ENVOUTEMENT_DETAIL_PATH = 'grimoire/envoutement/:id';
export const ENVOUTEMENTS_LIST_PATH = 'grimoire/envoutement';

export const RITUEL_DETAIL_PATH = 'grimoire/rituel/:id';
export const RITUELS_LIST_PATH = 'grimoire/rituel';

export const MAGIE_DETAIL_PATH = 'grimoire/magie/:id';
export const MAGIES_LIST_PATH = 'grimoire/magie';

export const COMPETENCES_LIST_PATH = 'aptitude/competence';

export const CARACTERISTIQUES_LIST_PATH = 'aptitude/caracteristique';

export const RACES_LIST_PATH = 'classe/race';

export const PROFESSIONS_LIST_PATH = 'classe/profession';

export const PERSONNAGE_CREATE_PATH = 'personnage/nouveau';

export const HOME_PATH = 'home';
export const ERROR_404_PATH = '**';

/*
1. un fichier app-routing.constants.ts avec :
export const PROFESSIONS_PATH = 'classe/profession';
export const EXEMPLE_PATH = 'exemple/profession';

2. un fichier app.module.ts avec :
export const routes: Routes = [
{ path: PROFESSIONS_PATH, component: ProfessionsListComponent }
{ path: EXEMPLE_PATH, component: ProfessionsListComponent }
//...
]

3. un fichier app.config.ts avec :
export const appConfig: ApplicationConfig = {
providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};

4. un fichier app.component.ts avec :
@Component({
selector: 'app-root',
imports: [RouterOutlet, RouterLink ],
templateUrl: './app.component.html',
styleUrl: './app.component.css'
})

export class AppComponent implements AfterViewInit {//reste du code}

5. un template app.component.html avec :
//...
<li><a [routerLink]="[PROFESSIONS_PATH]">Professions</a></li>
<li><a [routerLink]="[EXEMPLE_PATH]">Exemples</a></li>
*/
