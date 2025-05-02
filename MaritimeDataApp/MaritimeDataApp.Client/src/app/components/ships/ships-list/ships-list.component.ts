import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Ship } from '../../../models/maritime.models';
import { ShipService } from '../../../services/ship.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ships-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ships-list.component.html'
})
export class ShipsListComponent implements OnInit {
  ships$: Observable<Ship[]> | undefined;
  isLoading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private shipService: ShipService
  ) { }

  ngOnInit(): void {
    this.loadShips();
  }

  loadShips(): void {
    this.isLoading = true;
    this.error = null;
    this.ships$ = this.shipService.getShips();

    // Handle loading and error states
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
