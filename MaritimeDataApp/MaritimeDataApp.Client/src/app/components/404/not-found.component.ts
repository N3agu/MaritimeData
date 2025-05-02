import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule], // Import RouterModule
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent { }
