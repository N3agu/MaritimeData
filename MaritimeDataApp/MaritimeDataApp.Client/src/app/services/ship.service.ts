import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ship } from '../models/maritime.models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  private apiUrl = 'https://localhost:7187/api/ships';

  // Mock data - Replace with actual API calls
  //private mockShips: Ship[] = [
  //  { id: 1, name: 'Ocean Voyager', maxSpeed: 25 },
  //  { id: 2, name: 'Sea Serpent', maxSpeed: 18 },
  //  { id: 3, name: 'Coastal Runner', maxSpeed: 35 },
  //  { id: 4, name: 'Arctic Explorer', maxSpeed: 15 },
  //  { id: 5, name: 'Mediterranean Queen', maxSpeed: 22 },
  //  { id: 6, name: 'Pacific Drifter', maxSpeed: 19 },
  //];

  constructor(private http: HttpClient) { }

  //getShips(): Observable<Ship[]> {
  //  console.log('ShipService: Fetching ships...');
  //  // Simulate an API call with a delay
  //  return of(this.mockShips).pipe(delay(500));
  //}

  getShips(): Observable<Ship[]> {
    console.log('ShipService: Fetching ships from API...');
    return this.http.get<Ship[]>(this.apiUrl)
      .pipe(catchError(this.handleError<Ship[]>('getShips', [])));
  }

  // implement bonus later
  // createShip(ship: Ship): Observable<Ship> {
  //   return this.http.post<Ship>(this.apiUrl, ship, this.httpOptions) // Define httpOptions if needed (e.g., headers)
  //     .pipe(catchError(this.handleError<Ship>('createShip')));
  // }

  // Optional: Add a simple error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      // Let the app keep running by returning an empty result or default value
      return of(result as T);
    };
  }
}
