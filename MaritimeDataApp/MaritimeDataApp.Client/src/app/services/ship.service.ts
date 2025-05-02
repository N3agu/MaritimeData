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
  constructor(private http: HttpClient) { }

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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}
