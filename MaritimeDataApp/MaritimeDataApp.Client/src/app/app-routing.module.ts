import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import components for routing
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ShipsListComponent } from './components/ships/ships-list/ships-list.component';
import { PortsListComponent } from './components/ports/ports-list/ports-list.component';
import { VoyagesListComponent } from './components/voyages/voyages-list/voyages-list.component';
import { NotFoundComponent } from './components/404/not-found.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
  // Default route redirects to dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // Route for the dashboard view
  { path: 'dashboard', component: DashboardComponent, title: 'Maritime Data | Dashboard' },
  // Route for listing ships
  { path: 'ships', component: ShipsListComponent, title: 'Maritime Data | Ships' },
  // Route for listing ports
  { path: 'ports', component: PortsListComponent, title: 'Maritime Data | Ports' },
  // Route for listing voyages
  { path: 'voyages', component: VoyagesListComponent, title: 'Maritime Data | Voyages' },
  // Route for about
  { path: 'about', component: AboutComponent },
  // Route for 404
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
