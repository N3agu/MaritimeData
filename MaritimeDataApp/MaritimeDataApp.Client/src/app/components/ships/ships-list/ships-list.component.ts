import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { switchMap, takeUntil, startWith, tap, catchError } from 'rxjs/operators';
import { Ship } from '../../../models/maritime.models';
import { ShipService } from '../../../services/ship.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ships-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ships-list.component.html'
})
export class ShipsListComponent implements OnInit, OnDestroy {
  private refreshData$ = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>();

  ships$: Observable<Ship[]> | undefined;
  isLoading = true;
  error: string | null = null;

  shipForm: FormGroup;
  isEditing = false;
  editingShipId: number | null = null;
  showForm = false;

  constructor(
    private shipService: ShipService,
    private fb: FormBuilder
  ) {
    this.shipForm = this.fb.group({
      name: ['', Validators.required],
      maxSpeed: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadShips();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadShips(): void {
    this.isLoading = true;
    this.error = null;

    this.ships$ = this.refreshData$.pipe(
      startWith(undefined),
      switchMap(() => this.shipService.getShips()),
      tap(() => this.isLoading = false),
      catchError(err => {
        console.error('Error loading ships:', err);
        this.error = 'Failed to load ships. Please try again later.';
        this.isLoading = false;
        return of([]);
      }),
      takeUntil(this.destroy$)
    );
  }

  // data refresh
  refreshShips(): void {
    this.isLoading = true;
    this.refreshData$.next();
  }

  deleteShip(id: number): void {
    if (confirm('Are you sure you want to delete this ship?')) {
      this.shipService.deleteShip(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Ship ${id} deleted`);
            this.refreshShips();
          },
          error: (err) => {
            this.error = `Failed to delete ship ${id}.`;
            console.error('Delete error:', err);
          }
        });
    }
  }

  addShip(): void {
    this.isEditing = false;
    this.editingShipId = null;
    this.shipForm.reset();
    this.showForm = true;
  }

  editShip(ship: Ship): void {
    this.isEditing = true;
    this.editingShipId = ship.id;
    this.shipForm.patchValue({
      name: ship.name,
      maxSpeed: ship.maxSpeed
    });
    this.showForm = true;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingShipId = null;
    this.shipForm.reset();
  }

  // form submission (Create or Update)
  onSubmit(): void {
    if (this.shipForm.invalid) {
      this.shipForm.markAllAsTouched();
      return;
    }

    const shipData = this.shipForm.value;

    if (this.isEditing && this.editingShipId !== null) {
      const updatedShip: Ship = { id: this.editingShipId, ...shipData };
      this.shipService.updateShip(updatedShip)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Ship ${this.editingShipId} updated`);
            this.cancelEdit();
            this.refreshShips();
          },
          error: (err) => {
            this.error = `Failed to update ship ${this.editingShipId}.`;
            console.error('Update error:', err);
          }
        });
    } else {
      const newShip: Omit<Ship, 'id'> = shipData;
      this.shipService.createShip(newShip)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdShip) => {
            console.log(`Ship created with ID: ${createdShip.id}`);
            this.cancelEdit();
            this.refreshShips();
          },
          error: (err) => {
            this.error = 'Failed to create ship.';
            console.error('Create error:', err);
          }
        });
    }
  }

  get name() { return this.shipForm.get('name'); }
  get maxSpeed() { return this.shipForm.get('maxSpeed'); }
}
