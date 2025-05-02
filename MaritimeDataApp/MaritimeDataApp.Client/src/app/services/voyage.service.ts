import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Voyage } from '../models/maritime.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private apiUrl = 'https://localhost:7187/api/voyages'; // Verify port
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  getVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(this.apiUrl)
      .pipe(
        tap(_ => console.log('Fetched voyages')),
        catchError(this.handleError<Voyage[]>('getVoyages', []))
      );
  }

  getVoyage(id: number): Observable<Voyage> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Voyage>(url).pipe(
      tap(_ => console.log(`Fetched voyage id=${id}`)),
      catchError(this.handleError<Voyage>(`getVoyage id=${id}`))
    );
  }

  // Ensure dates are formatted correctly
  createVoyage(voyage: Omit<Voyage, 'id' | 'departurePort' | 'arrivalPort'>): Observable<Voyage> {
    // Exclude navigation properties and id
    return this.http.post<Voyage>(this.apiUrl, voyage, this.httpOptions).pipe(
      tap((newVoyage: Voyage) => console.log(`Added voyage w/ id=${newVoyage.id}`)),
      catchError(this.handleError<Voyage>('createVoyage'))
    );
  }

  updateVoyage(voyage: Voyage): Observable<any> {
    const url = `${this.apiUrl}/${voyage.id}`;
    // Send necessary data, exclude navigation properties
    const updateData = {
      id: voyage.id,
      voyageDate: voyage.voyageDate,
      departurePortId: voyage.departurePortId,
      arrivalPortId: voyage.arrivalPortId,
      voyageStart: voyage.voyageStart,
      voyageEnd: voyage.voyageEnd
    };
    return this.http.put(url, updateData, this.httpOptions).pipe(
      tap(_ => console.log(`Updated voyage id=${voyage.id}`)),
      catchError(this.handleError<any>('updateVoyage'))
    );
  }

  deleteVoyage(id: number): Observable<Voyage> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Voyage>(url, this.httpOptions).pipe(
      tap(_ => console.log(`Deleted voyage id=${id}`)),
      catchError(this.handleError<Voyage>('deleteVoyage'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      if (error.status === 400) {
        alert(`Operation ${operation} failed: ${error.error}`);
      }
      return of(result as T);
    };
  }
}
