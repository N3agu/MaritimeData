import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountryVisitService {
  private apiUrl = 'https://localhost:7187/api/countryvisits/lastyear';

  constructor(private http: HttpClient) { }

  getCountriesVisitedLastYear(): Observable<string[]> {
    console.log('CountryVisitService: Fetching countries visited from API...');
    return this.http.get<string[]>(this.apiUrl)
      .pipe(catchError(this.handleError<string[]>('getCountriesVisitedLastYear', [])));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}
