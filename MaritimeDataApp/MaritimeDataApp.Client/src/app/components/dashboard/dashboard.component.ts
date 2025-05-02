import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { ShipService } from '../../services/ship.service';
import { CountryVisitService } from '../../services/country-visit.service';
import { Ship, ChartData, CountryVisit } from '../../models/maritime.models';
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

  // Chart data observables
  shipSpeedData$: Observable<ChartData[]> | undefined;
  visitedCountries$: Observable<CountryVisit[]> | undefined;

  // Chart configuration
  // view: [number, number] = [700, 400]; // REMOVED fixed view for responsiveness
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
  // Added for accessibility and responsiveness
  legendTitle: string = 'Legend';
  yAxisTicks: number[] = []; // Dynamically calculate ticks if needed

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
        // Optional: Calculate Y-axis ticks based on max value for better scaling
        // const maxValue = Math.max(...data.map(d => d.value), 0);
        // this.yAxisTicks = this.calculateTicks(maxValue);
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

  // Helper function to group ships into speed categories for the chart
  private groupShipsBySpeed(ships: Ship[]): ChartData[] {
    const speedGroups = {
      '0-15 kn': 0,  // Shortened labels for smaller screens
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

  // Optional: Helper to calculate Y-axis ticks dynamically
  // private calculateTicks(maxValue: number): number[] {
  //   if (maxValue <= 5) return Array.from({ length: maxValue + 1 }, (_, i) => i);
  //   if (maxValue <= 10) return [0, 2, 4, 6, 8, 10];
  //   // Add more ranges as needed
  //   const step = Math.ceil(maxValue / 5);
  //   return Array.from({ length: 6 }, (_, i) => i * step);
  // }


  // Optional: Event handler for chart clicks
  onSelect(event: any): void {
    console.log('Chart item selected:', event);
  }
}
