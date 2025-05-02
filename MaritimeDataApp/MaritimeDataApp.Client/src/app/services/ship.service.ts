import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import tap
import { Ship } from '../models/maritime.models';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders

@Injectable({
  providedIn: 'root'
})
export class ShipService {
  private apiUrl = 'https://localhost:7187/api/ships';

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  // GET all ships
  getShips(): Observable<Ship[]> {
    console.log('ShipService: Fetching ships from API...');
    return this.http.get<Ship[]>(this.apiUrl)
      .pipe(
        tap(_ => console.log('Fetched ships')), // Log success
        catchError(this.handleError<Ship[]>('getShips', []))
      );
  }

  // GET ship by id (useful for editing later if needed)
  getShip(id: number): Observable<Ship> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Ship>(url).pipe(
      tap(_ => console.log(`Fetched ship id=${id}`)),
      catchError(this.handleError<Ship>(`getShip id=${id}`))
    );
  }

  // POST: add a new ship to the server
  createShip(ship: Omit<Ship, 'id'>): Observable<Ship> { // Use Omit to exclude id for creation
    return this.http.post<Ship>(this.apiUrl, ship, this.httpOptions).pipe(
      tap((newShip: Ship) => console.log(`Added ship w/ id=${newShip.id}`)),
      catchError(this.handleError<Ship>('createShip'))
    );
  }

  // PUT: update the ship on the server
  updateShip(ship: Ship): Observable<any> { // API returns NoContent, so Observable<any> or Observable<void>
    const url = `${this.apiUrl}/${ship.id}`;
    return this.http.put(url, ship, this.httpOptions).pipe(
      tap(_ => console.log(`Updated ship id=${ship.id}`)),
      catchError(this.handleError<any>('updateShip'))
    );
  }

  // DELETE: delete the ship from the server
  deleteShip(id: number): Observable<Ship> { // API returns NoContent, Observable<void> might be better
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Ship>(url, this.httpOptions).pipe( // Or use delete<void>
      tap(_ => console.log(`Deleted ship id=${id}`)),
      catchError(this.handleError<Ship>('deleteShip')) // Or handleError<void>
    );
  }

  // Generic error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      // TODO: Send the error to remote logging infrastructure if needed
      // Let the app keep running by returning an empty/default result.
      return of(result as T);
    };
  }
}
