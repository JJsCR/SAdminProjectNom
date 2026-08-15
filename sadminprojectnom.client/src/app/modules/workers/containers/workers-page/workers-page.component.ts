import {
  Component,
  OnInit,
  signal,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { WorkersService } from '../../services/workers.service';
import { Worker, CreateWorkerDto, UpdateWorkerDto } from '../../models/worker.model';

const AVATAR_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#00bcd4', '#009688',
  '#4caf50', '#ff9800', '#ff5722', '#795548',
];

@Component({
  selector: 'app-workers-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './workers-page.component.html',
  styleUrls: ['./workers-page.component.scss'],
})
export class WorkersPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form: FormGroup;
  editForm: FormGroup;
  isLoading = signal(false);
  selectedWorker = signal<Worker | null>(null);
  searchValue = signal('');
  dataSource = new MatTableDataSource<Worker>([]);
  displayedColumns = ['avatar', 'nombreCompleto', 'cedula', 'fechaNacimiento', 'celular', 'fechaCreacion', 'estado'];

  constructor(
    private fb: FormBuilder,
    private workersService: WorkersService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cedula: ['', Validators.required],
      fechaNacimiento: [null, Validators.required],
      celular: [''],
    });

    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cedula: ['', Validators.required],
      fechaNacimiento: [null, Validators.required],
      celular: [''],
    });

    this.dataSource.filterPredicate = (data: Worker, filter: string) => {
      const search = filter.trim().toLowerCase();
      return data.nombre.toLowerCase().includes(search) || data.apellido.toLowerCase().includes(search);
    };
  }

  ngOnInit(): void {
    this.loadWorkers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadWorkers(): void {
    this.isLoading.set(true);
    this.workersService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar trabajadores', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
    this.dataSource.filter = value;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const dto: CreateWorkerDto = {
      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,
      cedula: this.form.value.cedula,
      fechaNacimiento: new Date(this.form.value.fechaNacimiento).toISOString(),
      celular: this.form.value.celular || undefined,
    };

    this.workersService.create(dto).subscribe({
      next: (created) => {
        this.dataSource.data = [created, ...this.dataSource.data];
        this.form.reset();
        Object.keys(this.form.controls).forEach(key => {
          this.form.get(key)?.setErrors(null);
          this.form.get(key)?.markAsUntouched();
          this.form.get(key)?.markAsPristine();
        });
        this.snackBar.open('Trabajador guardado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al guardar el trabajador', 'Cerrar', { duration: 3000 });
      },
    });
  }

  toggleStatus(worker: Worker): void {
    const newStatus = !worker.activo;
    this.workersService.patchStatus(worker.trabajadorId, newStatus).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.map((w) =>
          w.trabajadorId === worker.trabajadorId ? { ...w, activo: newStatus } : w,
        );
        this.snackBar.open(
          `Trabajador ${newStatus ? 'activado' : 'desactivado'} correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  selectWorker(worker: Worker): void {
    this.selectedWorker.set(worker);
    this.editForm.patchValue({
      nombre: worker.nombre,
      apellido: worker.apellido,
      cedula: worker.cedula,
      fechaNacimiento: new Date(worker.fechaNacimiento),
      celular: worker.celular || '',
    });
  }

  cancelEdit(): void {
    this.selectedWorker.set(null);
    this.editForm.reset();
  }

  onUpdate(): void {
    const worker = this.selectedWorker();
    if (!worker || this.editForm.invalid) return;

    const dto: UpdateWorkerDto = {
      nombre: this.editForm.value.nombre,
      apellido: this.editForm.value.apellido,
      cedula: this.editForm.value.cedula,
      fechaNacimiento: new Date(this.editForm.value.fechaNacimiento).toISOString(),
      celular: this.editForm.value.celular || undefined,
    };

    this.workersService.update(worker.trabajadorId, dto).subscribe({
      next: (updated) => {
        this.dataSource.data = this.dataSource.data.map((w) =>
          w.trabajadorId === worker.trabajadorId ? updated : w,
        );
        this.selectedWorker.set(null);
        this.editForm.reset();
        this.snackBar.open('Trabajador actualizado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al actualizar el trabajador', 'Cerrar', { duration: 3000 });
      },
    });
  }

  getNombreCompleto(worker: Worker): string {
    return `${worker.nombre} ${worker.apellido}`;
  }

  getInitial(nombre: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(nombre: string): string {
    const index = nombre ? nombre.charCodeAt(0) % AVATAR_COLORS.length : 0;
    return AVATAR_COLORS[index];
  }
}
