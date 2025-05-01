import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root', // CSS selector for this component
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html', // Link to the HTML template
  styleUrls: ['./app.component.css'] // Link to the CSS styles
})
export class AppComponent {
  title = 'Maritime Data App';
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
