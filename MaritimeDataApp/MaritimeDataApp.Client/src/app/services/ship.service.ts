import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // 'of' creates an Observable from mock data
import { delay } from 'rxjs/operators'; // To simulate network latency
import { Ship } from '../models/maritime.models';
import { HttpClient } from '@angular/common/http'; // Import HttpClient

@Injectable({
  providedIn: 'root' // Service available application-wide
})
export class ShipService {
  // Replace with your actual backend API URL
  private apiUrl = '/api/ships'; // Example URL, adjust as needed

  // Mock data - Replace with actual API calls
  private mockShips: Ship[] = [
    { id: 1, name: 'Ocean Voyager', maxSpeed: 25 },
    { id: 2, name: 'Sea Serpent', maxSpeed: 18 },
    { id: 3, name: 'Coastal Runner', maxSpeed: 35 },
    { id: 4, name: 'Arctic Explorer', maxSpeed: 15 },
    { id: 5, name: 'Mediterranean Queen', maxSpeed: 22 },
    { id: 6, name: 'Pacific Drifter', maxSpeed: 19 },
  ];

  // Inject HttpClient for real API calls later
  constructor(private http: HttpClient) { }

  getShips(): Observable<Ship[]> {
    console.log('ShipService: Fetching ships...');
    // --- MOCK IMPLEMENTATION ---
    // Simulate an API call with a delay
    return of(this.mockShips).pipe(delay(500));

    // --- REAL HTTP IMPLEMENTATION (Example) ---
    // return this.http.get<Ship[]>(this.apiUrl);
  }

  // Add methods for getShipById, createShip, updateShip, deleteShip later
  // getShip(id: number): Observable<Ship> {
  //   const url = `${this.apiUrl}/${id}`;
  //   return this.http.get<Ship>(url);
  // }
  // createShip(ship: Ship): Observable<Ship> {
  //   return this.http.post<Ship>(this.apiUrl, ship);
  // }
  // ... etc.
}
