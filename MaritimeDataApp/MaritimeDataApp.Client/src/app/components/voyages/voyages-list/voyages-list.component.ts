import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Voyage } from '../../../models/maritime.models';
import { VoyageService } from '../../../services/voyage.service';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-voyages-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './voyages-list.component.html',
  providers: [DatePipe] // Provide DatePipe
})
export class VoyagesListComponent implements OnInit {
  voyages$: Observable<Voyage[]> | undefined;
  isLoading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private voyageService: VoyageService
  ) { }

  ngOnInit(): void {
    this.loadVoyages();
  }

  loadVoyages(): void {
    this.isLoading = true;
    this.error = null;
    this.voyages$ = this.voyageService.getVoyages();

    this.voyages$.subscribe({
      next: () => this.isLoading = false,
      error: (err) => {
        console.error('Error loading voyages:', err);
        this.error = 'Failed to load voyages.';
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }
}
