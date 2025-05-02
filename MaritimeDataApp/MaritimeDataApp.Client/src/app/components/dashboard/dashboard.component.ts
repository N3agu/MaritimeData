import { Component, OnInit, OnDestroy } from '@angular/core'; // *** Import OnDestroy ***
import { CommonModule } from '@angular/common';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { ShipService } from '../../services/ship.service';
import { CountryVisitService } from '../../services/country-visit.service';
import { PortService } from '../../services/port.service';
import { VoyageService } from '../../services/voyage.service';
import { Ship, ChartData, Port, Voyage } from '../../models/maritime.models';
import { Observable, of, Subject } from 'rxjs'; // *** Import of, Subject ***
import { map, catchError, tap, takeUntil } from 'rxjs/operators'; // *** Import takeUntil ***
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy { // *** Implement OnDestroy ***
  // --- Chart Data Observables (Used by async pipe in template) ---
  shipSpeedData$: Observable<ChartData[]> | undefined;
  visitedCountries$: Observable<string[]> | undefined;
  portsByCountryData$: Observable<ChartData[]> | undefined;
  voyagesByMonthData$: Observable<ChartData[]> | undefined;

  // --- Config remains the same ---
  shipSpeedColorScheme = { name: 'shipSpeedScheme', selectable: true, group: ScaleType.Ordinal, domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] };
  shipSpeedShowXAxisLabel: boolean = true; shipSpeedXAxisLabel: string = 'Speed Range (knots)'; shipSpeedShowYAxisLabel: boolean = true; shipSpeedYAxisLabel: string = 'Number of Ships'; shipSpeedShowLegend: boolean = false;
  portsColorScheme = { name: 'portsScheme', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'] };
  portsShowLegend: boolean = true; portsLegendTitle: string = 'Countries'; portsGradient: boolean = false; portsShowLabels: boolean = true; portsIsDoughnut: boolean = false;
  voyagesColorScheme = { name: 'voyagesScheme', selectable: true, group: ScaleType.Ordinal, domain: ['#0ea5e9', '#f97316', '#84cc16', '#14b8a6', '#d946ef', '#f43f5e'] };
  voyagesShowXAxisLabel: boolean = true; voyagesXAxisLabel: string = 'Month (YYYY-MM)'; voyagesShowYAxisLabel: boolean = true; voyagesYAxisLabel: string = 'Number of Voyages Started'; voyagesShowLegend: boolean = false;

  // --- Loading & Error States ---
  isLoadingShipSpeedChart = true;
  isLoadingCountries = true;
  isLoadingPortsChart = true;
  isLoadingVoyagesChart = true;

  shipSpeedChartError: string | null = null;
  countriesError: string | null = null;
  portsChartError: string | null = null;
  voyagesChartError: string | null = null;

  // --- Subject for unsubscribing ---
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient, // Keep if needed elsewhere, otherwise remove
    private shipService: ShipService,
    private countryVisitService: CountryVisitService,
    private portService: PortService,
    private voyageService: VoyageService
  ) { }

  ngOnInit(): void {
    this.loadShipSpeedChartData();
    this.loadVisitedCountries();
    this.loadPortsByCountryData();
    this.loadVoyagesByMonthData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Data Loading Methods ---

  loadVisitedCountries(): void {
    this.isLoadingCountries = true;
    this.countriesError = null;
    // Assign to observable for async pipe
    this.visitedCountries$ = this.countryVisitService.getCountriesVisitedLastYear().pipe(
      catchError(err => {
        console.error('Error loading visited countries:', err);
        this.countriesError = 'Failed to load visited countries.';
        // Return empty array so async pipe doesn't break
        return of([]);
      }),
      // Use finalize or similar if needed, but managing flags in subscribe is clearer here
      takeUntil(this.destroy$) // Unsubscribe on component destroy
    );
    // Subscribe separately to manage loading/error flags
    this.visitedCountries$.subscribe({
      next: () => { this.isLoadingCountries = false; }, // Set loading false on success
      error: () => { this.isLoadingCountries = false; } // Also set false on error (already handled in catchError, but safe)
      // No complete needed as takeUntil handles it
    });
  }

  loadShipSpeedChartData(): void {
    this.isLoadingShipSpeedChart = true;
    this.shipSpeedChartError = null;
    this.shipSpeedData$ = this.shipService.getShips().pipe(
      map(ships => this.groupShipsBySpeed(ships)), // Transform first
      catchError(err => {
        console.error('Error loading/processing ship speed data:', err);
        this.shipSpeedChartError = 'Failed to load ship speed data.';
        return of([]); // Return empty on error
      }),
      takeUntil(this.destroy$)
    );
    // Subscribe separately for flags
    this.shipSpeedData$.subscribe({
      next: () => { this.isLoadingShipSpeedChart = false; },
      error: () => { this.isLoadingShipSpeedChart = false; }
    });
  }

  loadPortsByCountryData(): void {
    this.isLoadingPortsChart = true;
    this.portsChartError = null;
    this.portsByCountryData$ = this.portService.getPorts().pipe(
      map(ports => this.groupPortsByCountry(ports)), // Transform first
      catchError(err => {
        console.error('Error loading/processing ports by country data:', err);
        this.portsChartError = 'Failed to load ports by country data.';
        return of([]); // Return empty on error
      }),
      takeUntil(this.destroy$)
    );
    // Subscribe separately for flags
    this.portsByCountryData$.subscribe({
      next: () => { this.isLoadingPortsChart = false; },
      error: () => { this.isLoadingPortsChart = false; }
    });
  }

  loadVoyagesByMonthData(): void {
    this.isLoadingVoyagesChart = true;
    this.voyagesChartError = null;
    this.voyagesByMonthData$ = this.voyageService.getVoyages().pipe(
      map(voyages => this.groupVoyagesByMonth(voyages)), // Transform first
      catchError(err => {
        console.error('Error loading/processing voyages by month data:', err);
        this.voyagesChartError = 'Failed to load voyages by month data.';
        return of([]); // Return empty on error
      }),
      takeUntil(this.destroy$)
    );
    // Subscribe separately for flags
    this.voyagesByMonthData$.subscribe({
      next: () => { this.isLoadingVoyagesChart = false; },
      error: () => { this.isLoadingVoyagesChart = false; }
    });
  }


  // --- Data Transformation Helpers ---
  // (groupShipsBySpeed, groupPortsByCountry, groupVoyagesByMonth remain the same)

  private groupShipsBySpeed(ships: Ship[]): ChartData[] {
    const speedGroups: { [key: string]: number } = {
      '0-15 kn': 0, '16-25 kn': 0, '26+ kn': 0,
    };
    ships.forEach(ship => {
      if (ship.maxSpeed <= 15) speedGroups['0-15 kn']++;
      else if (ship.maxSpeed <= 25) speedGroups['16-25 kn']++;
      else speedGroups['26+ kn']++;
    });
    return Object.entries(speedGroups).map(([name, value]) => ({ name, value }));
  }

  private groupPortsByCountry(ports: Port[]): ChartData[] {
    const countryCounts: { [key: string]: number } = {};
    ports.forEach(port => {
      countryCounts[port.country] = (countryCounts[port.country] || 0) + 1;
    });
    return Object.entries(countryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending by count
  }

  private groupVoyagesByMonth(voyages: Voyage[]): ChartData[] {
    const monthCounts: { [key: string]: number } = {};
    voyages.forEach(voyage => {
      const startDate = typeof voyage.voyageStart === 'string' ? new Date(voyage.voyageStart) : voyage.voyageStart;
      if (startDate instanceof Date && !isNaN(startDate.valueOf())) {
        const year = startDate.getFullYear();
        const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
        const yearMonth = `${year}-${month}`;
        monthCounts[yearMonth] = (monthCounts[yearMonth] || 0) + 1;
      } else {
        console.warn("Invalid voyage start date encountered:", voyage.voyageStart);
      }
    });
    return Object.entries(monthCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }


  onSelect(event: any): void {
    console.log('Chart item selected:', event);
  }
}
