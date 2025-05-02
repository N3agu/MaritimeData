import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { switchMap, takeUntil, startWith, tap, catchError } from 'rxjs/operators';
import { Voyage, Port } from '../../../models/maritime.models';
import { VoyageService } from '../../../services/voyage.service';
import { PortService } from '../../../services/port.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-voyages-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './voyages-list.component.html',
  providers: [DatePipe]
})
export class VoyagesListComponent implements OnInit, OnDestroy {
  private refreshData$ = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>();

  voyages$: Observable<Voyage[]> | undefined;
  ports$: Observable<Port[]> | undefined;
  isLoading = true;
  error: string | null = null;

  voyageForm: FormGroup;
  isEditing = false;
  editingVoyageId: number | null = null;
  showForm = false;

  constructor(
    private voyageService: VoyageService,
    private portService: PortService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.voyageForm = this.fb.group({
      voyageDate: [this.formatDateForInput(new Date()), Validators.required],
      departurePortId: [null, Validators.required],
      arrivalPortId: [null, Validators.required],
      voyageStart: [this.formatDateTimeForInput(new Date()), Validators.required],
      voyageEnd: [this.formatDateTimeForInput(new Date()), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadVoyages();
    this.loadPortsForDropdown();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private formatDateForInput(date: Date): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  private formatDateTimeForInput(date: Date): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm');
  }

  loadVoyages(): void {
    this.isLoading = true;
    this.error = null;
    this.voyages$ = this.refreshData$.pipe(
      startWith(undefined),
      switchMap(() => this.voyageService.getVoyages()),
      tap(() => this.isLoading = false),
      catchError(err => {
        console.error('Error loading voyages:', err);
        this.error = 'Failed to load voyages.';
        this.isLoading = false;
        return of([]);
      }),
      takeUntil(this.destroy$)
    );
  }

  loadPortsForDropdown(): void {
    this.ports$ = this.portService.getPorts().pipe(
      catchError(err => {
        console.error("Error loading ports for dropdown", err);
        this.error = (this.error ?? '') + ' Failed to load ports for form.';
        return of([]);
      }),
      takeUntil(this.destroy$)
    );
  }

  refreshVoyages(): void {
    this.isLoading = true;
    this.refreshData$.next();
  }

  deleteVoyage(id: number): void {
    if (confirm('Are you sure you want to delete this voyage?')) {
      this.voyageService.deleteVoyage(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Voyage ${id} deleted`);
            this.refreshVoyages();
          },
          error: (err) => {
            this.error = `Failed to delete voyage ${id}.`;
            console.error('Delete error:', err);
          }
        });
    }
  }

  addVoyage(): void {
    this.isEditing = false;
    this.editingVoyageId = null;

    this.voyageForm.reset({
      voyageDate: this.formatDateForInput(new Date()),
      departurePortId: null,
      arrivalPortId: null,
      voyageStart: this.formatDateTimeForInput(new Date()),
      voyageEnd: this.formatDateTimeForInput(new Date())
    });
    this.showForm = true;
  }

  editVoyage(voyage: Voyage): void {
    this.isEditing = true;
    this.editingVoyageId = voyage.id;

    this.voyageForm.patchValue({
      voyageDate: this.formatDateForInput(new Date(voyage.voyageDate)),
      departurePortId: voyage.departurePortId,
      arrivalPortId: voyage.arrivalPortId,
      voyageStart: this.formatDateTimeForInput(new Date(voyage.voyageStart)),
      voyageEnd: this.formatDateTimeForInput(new Date(voyage.voyageEnd))
    });
    this.showForm = true;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingVoyageId = null;
    this.voyageForm.reset();
  }

  onSubmit(): void {
    if (this.voyageForm.invalid) {
      this.voyageForm.markAllAsTouched();
      return;
    }

    const formValue = this.voyageForm.value;
    const voyageData = {
      ...formValue,
      voyageDate: new Date(formValue.voyageDate).toISOString(),
      voyageStart: new Date(formValue.voyageStart).toISOString(),
      voyageEnd: new Date(formValue.voyageEnd).toISOString(),
      departurePortId: Number(formValue.departurePortId),
      arrivalPortId: Number(formValue.arrivalPortId)
    };


    if (this.isEditing && this.editingVoyageId !== null) {
      const updatedVoyage: Voyage = { id: this.editingVoyageId, ...voyageData };
      this.voyageService.updateVoyage(updatedVoyage)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log(`Voyage ${this.editingVoyageId} updated`);
            this.cancelEdit();
            this.refreshVoyages();
          },
          error: (err) => {
            this.error = `Failed to update voyage ${this.editingVoyageId}.`;
            console.error('Update error:', err);
          }
        });
    } else {
      const newVoyage: Omit<Voyage, 'id' | 'departurePort' | 'arrivalPort'> = voyageData;
      this.voyageService.createVoyage(newVoyage)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdVoyage) => {
            console.log(`Voyage created with ID: ${createdVoyage.id}`);
            this.cancelEdit();
            this.refreshVoyages();
          },
          error: (err) => {
            this.error = 'Failed to create voyage.';
            console.error('Create error:', err);
          }
        });
    }
  }

  get voyageDate() { return this.voyageForm.get('voyageDate'); }
  get departurePortId() { return this.voyageForm.get('departurePortId'); }
  get arrivalPortId() { return this.voyageForm.get('arrivalPortId'); }
  get voyageStart() { return this.voyageForm.get('voyageStart'); }
  get voyageEnd() { return this.voyageForm.get('voyageEnd'); }
}
