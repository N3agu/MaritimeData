import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Port } from '../models/maritime.models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PortService {
  private apiUrl = '/api/ports'; // Example URL

  private mockPorts: Port[] = [
    { id: 101, name: 'Port of Rotterdam', country: 'Netherlands' },
    { id: 102, name: 'Port of Singapore', country: 'Singapore' },
    { id: 103, name: 'Port of Hamburg', country: 'Germany' },
    { id: 104, name: 'Port of Los Angeles', country: 'USA' },
    { id: 105, name: 'Port Constanta', country: 'Romania' },
  ];

  constructor(private http: HttpClient) { }

  getPorts(): Observable<Port[]> {
    console.log('PortService: Fetching ports...');
    // --- MOCK IMPLEMENTATION ---
    return of(this.mockPorts).pipe(delay(400));

    // --- REAL HTTP IMPLEMENTATION (Example) ---
    // return this.http.get<Port[]>(this.apiUrl);
  }

  // Helper to get port name by ID (useful for Voyages list)
  // In a real app, you might fetch this differently or have it included in Voyage data
  getPortNameById(id: number): Observable<string | undefined> {
    const port = this.mockPorts.find(p => p.id === id);
    return of(port?.name).pipe(delay(50)); // Simulate quick lookup
    // Real implementation might involve a separate API call or caching
    // return this.http.get<Port>(`${this.apiUrl}/${id}`).pipe(map(p => p.name));
  }
}
