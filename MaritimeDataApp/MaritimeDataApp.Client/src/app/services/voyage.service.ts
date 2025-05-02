import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Voyage } from '../models/maritime.models';
import { HttpClient } from '@angular/common/http';
import { PortService } from './port.service';

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private apiUrl = 'https://localhost:7187/api/voyages';

  constructor(private http: HttpClient, private portService: PortService) { }

  getVoyages(): Observable<Voyage[]> {
    console.log('VoyageService: Fetching voyages...');
    return this.http.get<Voyage[]>(this.apiUrl)
      .pipe(catchError(this.handleError<Voyage[]>('getVoyages', [])));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}
