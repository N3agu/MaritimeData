import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Port } from '../../../models/maritime.models';
import { PortService } from '../../../services/port.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ports-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ports-list.component.html',
  styleUrls: ['./ports-list.component.css']
})
export class PortsListComponent implements OnInit {
  ports$: Observable<Port[]> | undefined;
  isLoading = true;
  error: string | null = null;

  constructor(private portService: PortService) { }

  ngOnInit(): void {
    this.loadPorts();
  }

  loadPorts(): void {
    this.isLoading = true;
    this.error = null;
    this.ports$ = this.portService.getPorts();

    this.ports$.subscribe({
      next: () => this.isLoading = false,
      error: (err) => {
        console.error('Error loading ports:', err);
        this.error = 'Failed to load ports.';
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }
}
