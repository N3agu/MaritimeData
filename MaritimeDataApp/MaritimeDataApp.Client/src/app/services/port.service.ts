import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Port } from '../models/maritime.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PortService {
  private apiUrl = 'https://localhost:7187/api/ports';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  getPorts(): Observable<Port[]> {
    return this.http.get<Port[]>(this.apiUrl)
      .pipe(
        tap(_ => console.log('Fetched ports')),
        catchError(this.handleError<Port[]>('getPorts', []))
      );
  }

  getPort(id: number): Observable<Port> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Port>(url).pipe(
      tap(_ => console.log(`Fetched port id=${id}`)),
      catchError(this.handleError<Port>(`getPort id=${id}`))
    );
  }

  createPort(port: Omit<Port, 'id' | 'departingVoyages' | 'arrivingVoyages'>): Observable<Port> {
    return this.http.post<Port>(this.apiUrl, port, this.httpOptions).pipe(
      tap((newPort: Port) => console.log(`Added port w/ id=${newPort.id}`)),
      catchError(this.handleError<Port>('createPort'))
    );
  }

  updatePort(port: Port): Observable<any> {
    const url = `${this.apiUrl}/${port.id}`;
    const updateData = { id: port.id, name: port.name, country: port.country };
    return this.http.put(url, updateData, this.httpOptions).pipe(
      tap(_ => console.log(`Updated port id=${port.id}`)),
      catchError(this.handleError<any>('updatePort'))
    );
  }

  deletePort(id: number): Observable<Port> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Port>(url, this.httpOptions).pipe(
      tap(_ => console.log(`Deleted port id=${id}`)),
      catchError(this.handleError<Port>('deletePort'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      if (error.status === 400) {
        alert(`Operation ${operation} failed: ${error.error}`); // Show backend message
      }
      return of(result as T);
    };
  }
}
