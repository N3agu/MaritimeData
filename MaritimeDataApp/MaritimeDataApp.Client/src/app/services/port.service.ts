import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Port } from '../models/maritime.models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PortService {
  private apiUrl = 'https://localhost:7187/api/ports';

  constructor(private http: HttpClient) { }

  getPorts(): Observable<Port[]> {
    console.log('PortService: Fetching ports...');
    return this.http.get<Port[]>(this.apiUrl)
      .pipe(catchError(this.handleError<Port[]>('getPorts', [])));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}
