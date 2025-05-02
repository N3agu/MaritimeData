import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { ShipService } from '../../services/ship.service';
import { CountryVisitService } from '../../services/country-visit.service';
import { Ship, ChartData } from '../../models/maritime.models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  shipSpeedData$: Observable<ChartData[]> | undefined;
  visitedCountries$: Observable<string[]> | undefined;

  // view: [number, number] = [700, 400]; // fixed view for responsiveness
  gradient: boolean = false;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Speed Range (knots)';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = 'Number of Ships';
  colorScheme = {
    name: 'maritimeScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  legendTitle: string = 'Legend';
  yAxisTicks: number[] = []; // Dynamically calculate ticks

  isLoadingChart = true;
  isLoadingCountries = true;
  chartError: string | null = null;
  countriesError: string | null = null;

  constructor(
    private http : HttpClient,
    private shipService: ShipService,
    private countryVisitService: CountryVisitService
  ) { }

  ngOnInit(): void {
    this.loadShipSpeedChartData();
    this.loadVisitedCountries();
  }

  loadVisitedCountries(): void {
    this.isLoadingCountries = true;
    this.countriesError = null;
    this.visitedCountries$ = this.countryVisitService.getCountriesVisitedLastYear();

    this.visitedCountries$.subscribe({
      next: () => this.isLoadingCountries = false,
      error: (err) => {
        console.error('Error loading visited countries:', err);
        this.countriesError = 'Failed to load visited countries.';
        this.isLoadingCountries = false;
      },
      complete: () => this.isLoadingCountries = false
    });
  }


  loadShipSpeedChartData(): void {
    this.isLoadingChart = true;
    this.chartError = null;
    this.shipSpeedData$ = this.shipService.getShips().pipe(
      map(ships => this.groupShipsBySpeed(ships)),
      map(data => {
        this.isLoadingChart = false;
        return data;
      })
    );

    this.shipSpeedData$.subscribe({
      error: (err) => {
        console.error('Error processing ship data for chart:', err);
        this.chartError = 'Failed to load ship speed data for chart.';
        this.isLoadingChart = false;
      }
    });
  }

  private groupShipsBySpeed(ships: Ship[]): ChartData[] {
    const speedGroups = {
      '0-15 kn': 0,
      '16-25 kn': 0,
      '26+ kn': 0,
    };

    ships.forEach(ship => {
      if (ship.maxSpeed <= 15) {
        speedGroups['0-15 kn']++;
      } else if (ship.maxSpeed <= 25) {
        speedGroups['16-25 kn']++;
      } else {
        speedGroups['26+ kn']++;
      }
    });

    return Object.entries(speedGroups).map(([name, value]) => ({ name, value }));
  }

  onSelect(event: any): void {
    console.log('Chart item selected:', event);
  }
}
