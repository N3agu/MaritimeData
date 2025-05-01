import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { Voyage } from '../models/maritime.models';
import { HttpClient } from '@angular/common/http';
import { PortService } from './port.service'; // Inject PortService to resolve names

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private apiUrl = '/api/voyages'; // Example URL

  private mockVoyages: Omit<Voyage, 'departurePortName' | 'arrivalPortName'>[] = [
    { id: 1001, voyageDate: '2025-04-15', departurePortId: 101, arrivalPortId: 103, voyageStart: '2025-04-15T08:00:00Z', voyageEnd: '2025-04-18T16:00:00Z' },
    { id: 1002, voyageDate: '2025-04-20', departurePortId: 102, arrivalPortId: 104, voyageStart: '2025-04-20T12:00:00Z', voyageEnd: '2025-05-05T10:00:00Z' },
    { id: 1003, voyageDate: '2025-04-25', departurePortId: 105, arrivalPortId: 101, voyageStart: '2025-04-25T06:00:00Z', voyageEnd: '2025-04-30T22:00:00Z' },
    { id: 1004, voyageDate: '2025-05-01', departurePortId: 104, arrivalPortId: 102, voyageStart: '2025-05-01T15:00:00Z', voyageEnd: '2025-05-15T11:00:00Z' },
  ];

  constructor(private http: HttpClient, private portService: PortService) { }

  getVoyages(): Observable<Voyage[]> {
    console.log('VoyageService: Fetching voyages...');
    // --- MOCK IMPLEMENTATION ---
    // Simulate fetching basic voyage data
    return of(this.mockVoyages).pipe(
      delay(600),
      // For each voyage, fetch the port names
      switchMap(voyages => {
        // Create an array of Observables, each fetching names for one voyage
        const voyagesWithNames$: Observable<Voyage>[] = voyages.map(voyage =>
          forkJoin({ // forkJoin waits for multiple observables to complete
            departure: this.portService.getPortNameById(voyage.departurePortId),
            arrival: this.portService.getPortNameById(voyage.arrivalPortId)
          }).pipe(
            map(portNames => ({
              ...voyage, // Spread the original voyage data
              departurePortName: portNames.departure ?? 'Unknown', // Assign resolved names
              arrivalPortName: portNames.arrival ?? 'Unknown'
            }))
          )
        );
        // Return an Observable that emits the array of fully populated voyages
        return forkJoin(voyagesWithNames$);
      })
    );

    // --- REAL HTTP IMPLEMENTATION (Example) ---
    // This assumes your API returns voyages with port names included,
    // or you make separate calls as shown in the mock logic.
    // return this.http.get<Voyage[]>(this.apiUrl);
  }
}
