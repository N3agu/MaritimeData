import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { ShipService } from '../../services/ship.service';
import { CountryVisitService } from '../../services/country-visit.service';
import { PortService } from '../../services/port.service';
import { VoyageService } from '../../services/voyage.service';
import { Ship, ChartData, Port, Voyage } from '../../models/maritime.models';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, tap, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  shipSpeedData$: Observable<ChartData[]> | undefined;
  visitedCountries$: Observable<string[]> | undefined;
  portsByCountryData$: Observable<ChartData[]> | undefined;
  voyagesByMonthData$: Observable<ChartData[]> | undefined;

  shipSpeedColorScheme = { name: 'shipSpeedScheme', selectable: true, group: ScaleType.Ordinal, domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] };
  shipSpeedShowXAxisLabel: boolean = true; shipSpeedXAxisLabel: string = 'Speed Range (knots)'; shipSpeedShowYAxisLabel: boolean = true; shipSpeedYAxisLabel: string = 'Number of Ships'; shipSpeedShowLegend: boolean = false;
  portsColorScheme = { name: 'portsScheme', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'] };
  portsShowLegend: boolean = true; portsLegendTitle: string = 'Countries'; portsGradient: boolean = false; portsShowLabels: boolean = true; portsIsDoughnut: boolean = false;
  voyagesColorScheme = { name: 'voyagesScheme', selectable: true, group: ScaleType.Ordinal, domain: ['#0ea5e9', '#f97316', '#84cc16', '#14b8a6', '#d946ef', '#f43f5e'] };
  voyagesShowXAxisLabel: boolean = true; voyagesXAxisLabel: string = 'Month (YYYY-MM)'; voyagesShowYAxisLabel: boolean = true; voyagesYAxisLabel: string = 'Number of Voyages Started'; voyagesShowLegend: boolean = false;

  isLoadingShipSpeedChart = true;
  isLoadingCountries = true;
  isLoadingPortsChart = true;
  isLoadingVoyagesChart = true;

  shipSpeedChartError: string | null = null;
  countriesError: string | null = null;
  portsChartError: string | null = null;
  voyagesChartError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
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

  loadVisitedCountries(): void {
    this.isLoadingCountries = true;
    this.countriesError = null;
    this.visitedCountries$ = this.countryVisitService.getCountriesVisitedLastYear().pipe(
      catchError(err => {
        console.error('Error loading visited countries:', err);
        this.countriesError = 'Failed to load visited countries.';
        return of([]);
      }),
      takeUntil(this.destroy$)
    );

    this.visitedCountries$.subscribe({
      next: () => { this.isLoadingCountries = false; },
      error: () => { this.isLoadingCountries = false; }
    });
  }

  loadShipSpeedChartData(): void {
    this.isLoadingShipSpeedChart = true;
    this.shipSpeedChartError = null;
    this.shipSpeedData$ = this.shipService.getShips().pipe(
      map(ships => this.groupShipsBySpeed(ships)),
      catchError(err => {
        console.error('Error loading/processing ship speed data:', err);
        this.shipSpeedChartError = 'Failed to load ship speed data.';
        return of([]);
      }),
      takeUntil(this.destroy$)
    );

    this.shipSpeedData$.subscribe({
      next: () => { this.isLoadingShipSpeedChart = false; },
      error: () => { this.isLoadingShipSpeedChart = false; }
    });
  }

  loadPortsByCountryData(): void {
    this.isLoadingPortsChart = true;
    this.portsChartError = null;
    this.portsByCountryData$ = this.portService.getPorts().pipe(
      map(ports => this.groupPortsByCountry(ports)),
      catchError(err => {
        console.error('Error loading/processing ports by country data:', err);
        this.portsChartError = 'Failed to load ports by country data.';
        return of([]);
      }),
      takeUntil(this.destroy$)
    );

    this.portsByCountryData$.subscribe({
      next: () => { this.isLoadingPortsChart = false; },
      error: () => { this.isLoadingPortsChart = false; }
    });
  }

  loadVoyagesByMonthData(): void {
    this.isLoadingVoyagesChart = true;
    this.voyagesChartError = null;
    this.voyagesByMonthData$ = this.voyageService.getVoyages().pipe(
      map(voyages => this.groupVoyagesByMonth(voyages)),
      catchError(err => {
        console.error('Error loading/processing voyages by month data:', err);
        this.voyagesChartError = 'Failed to load voyages by month data.';
        return of([]);
      }),
      takeUntil(this.destroy$)
    );

    this.voyagesByMonthData$.subscribe({
      next: () => { this.isLoadingVoyagesChart = false; },
      error: () => { this.isLoadingVoyagesChart = false; }
    });
  }

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
      .sort((a, b) => b.value - a.value);
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
