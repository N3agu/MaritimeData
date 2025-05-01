import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Ship } from '../../../models/maritime.models';
import { ShipService } from '../../../services/ship.service';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-ships-list',
  standalone: true, // Make component standalone
  imports: [CommonModule], // Import CommonModule for ngFor, async pipe
  templateUrl: './ships-list.component.html',
  styleUrls: ['./ships-list.component.css']
})
export class ShipsListComponent implements OnInit {
  ships$: Observable<Ship[]> | undefined; // Observable stream of ships
  isLoading = true;
  error: string | null = null;

  constructor(private shipService: ShipService) { }

  ngOnInit(): void {
    this.loadShips();
  }

  loadShips(): void {
    this.isLoading = true;
    this.error = null;
    this.ships$ = this.shipService.getShips();

    // Handle loading and error states (optional but good practice)
    this.ships$.subscribe({
      next: () => this.isLoading = false,
      error: (err) => {
        console.error('Error loading ships:', err);
        this.error = 'Failed to load ships. Please try again later.';
        this.isLoading = false;
      },
      complete: () => this.isLoading = false // Ensure loading stops on complete
    });
  }
}
