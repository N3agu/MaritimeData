import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';

import { routes } from './app/app-routing.module';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Provide routes using the new API
    provideHttpClient(),   // Provide HttpClient
    provideAnimations()    // Provide BrowserAnimationsModule functionality
    // Add other providers here if needed (state management, etc.)
  ]
}).catch(err => console.error(err));
