import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs'; // Import Subject, BehaviorSubject, of
import { switchMap, takeUntil, startWith, tap, catchError } from 'rxjs/operators'; // Import operators
import { Port } from '../../../models/maritime.models';
import { PortService } from '../../../services/port.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Reactive Forms

@Component({
  selector: 'app-ports-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Add ReactiveFormsModule
  templateUrl: './ports-list.component.html'
})
export class PortsListComponent implements OnInit, OnDestroy {
  private refreshData$ = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>();

  ports$: Observable<Port[]> | undefined;
  isLoading = true;
  error: string | null = null;

  portForm: FormGroup;
  isEditing = false;
  editingPortId: number | null = null;
  showForm = false;

  constructor(
    private portService: PortService,
    private fb: FormBuilder
  ) {
    this.portForm = this.fb.group({
      name: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPorts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPorts(): void {
    this.isLoading = true;
    this.error = null;
    this.ports$ = this.refreshData$.pipe(
      startWith(undefined),
      switchMap(() => this.portService.getPorts()),
      tap(() => this.isLoading = false),
      catchError(err => {
        console.error('Error loading ports:', err);
        this.error = 'Failed to load ports.';
        this.isLoading = false;
        return of([]);
      }),
      takeUntil(this.destroy$)
    );
  }

  refreshPorts(): void {
    this.isLoading = true;
    this.refreshData$.next();
  }

  deletePort(id: number): void {
    if (confirm('Are you sure you want to delete this port? Voyages using this port might prevent deletion.')) {
      this.portService.deletePort(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Port ${id} delete request sent`);
            // Backend might return error if port is in use, handled by service's handleError
            this.refreshPorts(); // Refresh list regardless (backend determines success)
          },
          error: (err) => { // Service's handleError should catch this, but good practice
            this.error = `Failed to delete port ${id}. It might be in use.`;
            console.error('Delete error:', err);
          }
        });
    }
  }

  addPort(): void {
    this.isEditing = false;
    this.editingPortId = null;
    this.portForm.reset();
    this.showForm = true;
  }

  editPort(port: Port): void {
    this.isEditing = true;
    this.editingPortId = port.id;
    this.portForm.patchValue({
      name: port.name,
      country: port.country
    });
    this.showForm = true;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingPortId = null;
    this.portForm.reset();
  }

  onSubmit(): void {
    if (this.portForm.invalid) {
      this.portForm.markAllAsTouched();
      return;
    }

    const portData = this.portForm.value;

    if (this.isEditing && this.editingPortId !== null) {
      const updatedPort: Port = { id: this.editingPortId, ...portData, departingVoyages: [], arrivingVoyages: [] }; // Add empty arrays for type match
      this.portService.updatePort(updatedPort)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Port ${this.editingPortId} updated`);
            this.cancelEdit();
            this.refreshPorts();
          },
          error: (err) => {
            this.error = `Failed to update port ${this.editingPortId}.`;
            console.error('Update error:', err);
          }
        });
    } else {
      const newPort: Omit<Port, 'id' | 'departingVoyages' | 'arrivingVoyages'> = portData;
      this.portService.createPort(newPort)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdPort) => {
            console.log(`Port created with ID: ${createdPort.id}`);
            this.cancelEdit();
            this.refreshPorts();
          },
          error: (err) => {
            this.error = 'Failed to create port.';
            console.error('Create error:', err);
          }
        });
    }
  }

  get name() { return this.portForm.get('name'); }
  get country() { return this.portForm.get('country'); }
}
