import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Required for ngx-charts animations

import { AppRoutingModule } from './app-routing.module'; // Import routing module
import { AppComponent } from './app.component'; // Import AppComponent

// Standalone components used in routing are handled by the router
// and AppComponent is now standalone as well.

@NgModule({
  declarations: [
    // AppComponent // REMOVED from declarations
    // Other non-standalone components would be declared here
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // Add HttpClientModule to imports
    AppRoutingModule, // Add routing module
    BrowserAnimationsModule, // Add BrowserAnimationsModule for ngx-charts
    AppComponent // IMPORT AppComponent here because it's standalone and used for bootstrap

    // Other standalone components used directly in THIS module's templates (if any)
    // would also be imported here. Routed components are handled by AppRoutingModule.
  ],
  providers: [
    // Services are usually provided in 'root' (in the service file)
  ],
  bootstrap: [AppComponent] // The root component to bootstrap the application
})
export class AppModule { }
