import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CountryVisit } from '../models/maritime.models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountryVisitService {
  private apiUrl = '/api/countryvisits'; // Example URL

  // Requirement: Countries visited in the last year
  // This mock data assumes the backend has already filtered by date.
  private mockVisits: CountryVisit[] = [
    { id: 1, countryName: 'Netherlands' },
    { id: 2, countryName: 'Germany' },
    { id: 3, countryName: 'Singapore' },
    { id: 4, countryName: 'USA' },
    { id: 5, countryName: 'Romania' },
    // Add more if needed based on voyages/ports
  ];

  constructor(private http: HttpClient) { }

  getCountriesVisitedLastYear(): Observable<CountryVisit[]> {
    console.log('CountryVisitService: Fetching countries visited...');
    // --- MOCK IMPLEMENTATION ---
    return of(this.mockVisits).pipe(delay(300));

    // --- REAL HTTP IMPLEMENTATION (Example) ---
    // return this.http.get<CountryVisit[]>(this.apiUrl); // Assuming API endpoint provides this specific data
  }
}
