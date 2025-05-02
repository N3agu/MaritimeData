import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { switchMap, takeUntil, startWith, tap, catchError } from 'rxjs/operators';
import { Ship } from '../../../models/maritime.models';
import { ShipService } from '../../../services/ship.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Reactive Forms related modules

@Component({
  selector: 'app-ships-list',
  standalone: true,
  // *** ADD ReactiveFormsModule ***
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ships-list.component.html'
})
export class ShipsListComponent implements OnInit, OnDestroy {
  // Use BehaviorSubject to trigger reloads
  private refreshData$ = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>(); // To manage subscriptions

  ships$: Observable<Ship[]> | undefined;
  isLoading = true;
  error: string | null = null;

  // Form for adding/editing ships
  shipForm: FormGroup;
  isEditing = false;
  editingShipId: number | null = null;
  showForm = false; // To toggle form visibility

  constructor(
    private shipService: ShipService,
    private fb: FormBuilder // Inject FormBuilder
  ) {
    // Initialize the form
    this.shipForm = this.fb.group({
      name: ['', Validators.required],
      maxSpeed: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadShips();
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Signal completion
    this.destroy$.complete(); // Complete the subject
  }

  loadShips(): void {
    this.isLoading = true;
    this.error = null;

    // Use refreshData$ to trigger fetching
    this.ships$ = this.refreshData$.pipe(
      startWith(undefined), // Fetch initially
      switchMap(() => this.shipService.getShips()), // Switch to getShips observable on trigger
      tap(() => this.isLoading = false), // Stop loading indicator on data arrival
      catchError(err => { // Handle errors within the stream
        console.error('Error loading ships:', err);
        this.error = 'Failed to load ships. Please try again later.';
        this.isLoading = false;
        return of([]); // Return empty array on error
      }),
      takeUntil(this.destroy$) // Unsubscribe when component is destroyed
    );
  }

  // Trigger data refresh
  refreshShips(): void {
    this.isLoading = true; // Show loading indicator immediately
    this.refreshData$.next();
  }

  // --- CRUD Methods ---

  deleteShip(id: number): void {
    if (confirm('Are you sure you want to delete this ship?')) {
      this.shipService.deleteShip(id)
        .pipe(takeUntil(this.destroy$)) // Manage subscription
        .subscribe({
          next: () => {
            console.log(`Ship ${id} deleted`);
            this.refreshShips(); // Refresh the list
          },
          error: (err) => {
            this.error = `Failed to delete ship ${id}.`; // Show specific error
            console.error('Delete error:', err);
          }
        });
    }
  }

  // Prepare form for adding
  addShip(): void {
    this.isEditing = false;
    this.editingShipId = null;
    this.shipForm.reset(); // Clear form
    this.showForm = true; // Show the form
  }

  // Prepare form for editing
  editShip(ship: Ship): void {
    this.isEditing = true;
    this.editingShipId = ship.id;
    this.shipForm.patchValue({ // Populate form with ship data
      name: ship.name,
      maxSpeed: ship.maxSpeed
    });
    this.showForm = true; // Show the form
  }

  // Cancel form
  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingShipId = null;
    this.shipForm.reset();
  }

  // Handle form submission (Create or Update)
  onSubmit(): void {
    if (this.shipForm.invalid) {
      this.shipForm.markAllAsTouched(); // Mark fields as touched to show validation errors
      return; // Stop if form is invalid
    }

    const shipData = this.shipForm.value;

    if (this.isEditing && this.editingShipId !== null) {
      // --- Update existing ship ---
      const updatedShip: Ship = { id: this.editingShipId, ...shipData };
      this.shipService.updateShip(updatedShip)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Ship ${this.editingShipId} updated`);
            this.cancelEdit(); // Hide form and reset state
            this.refreshShips(); // Refresh list
          },
          error: (err) => {
            this.error = `Failed to update ship ${this.editingShipId}.`;
            console.error('Update error:', err);
          }
        });
    } else {
      // --- Create new ship ---
      // Backend handles ID generation, send data without it
      const newShip: Omit<Ship, 'id'> = shipData;
      this.shipService.createShip(newShip)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdShip) => {
            console.log(`Ship created with ID: ${createdShip.id}`);
            this.cancelEdit(); // Hide form and reset state
            this.refreshShips(); // Refresh list
          },
          error: (err) => {
            this.error = 'Failed to create ship.';
            console.error('Create error:', err);
          }
        });
    }
  }

  // --- Form Getters for easier template access ---
  get name() { return this.shipForm.get('name'); }
  get maxSpeed() { return this.shipForm.get('maxSpeed'); }
}
