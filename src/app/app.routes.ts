import {RouterConfig} from '@angular/router';
import {HomeComponent} from './home/home.component';

export const routes: RouterConfig = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: HomeComponent},
]
