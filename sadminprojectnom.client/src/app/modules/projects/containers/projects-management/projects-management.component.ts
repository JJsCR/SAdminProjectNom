import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProjectsService, ProjectListDto, CreateProjectDto } from '../../../../shared/services/projects.service';
import { HttpClient } from '@angular/common/http';

interface ClientOption {
  id: number;
  nombre: string;
  apellido: string;
}

interface WorkerOption {
  trabajadorId: number;
  nombre: string;
  apellido: string;
}

@Component({
  selector: 'app-projects-management',
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
    MatSortModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './projects-management.component.html',
  styleUrls: ['./projects-management.component.scss'],
})
export class ProjectsManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'nombre', 'clienteNombre', 'ubicacion', 'montoObra',
    'numTrabajadores', 'numAbonos', 'estado', 'acciones'
  ];
  dataSource = new MatTableDataSource<ProjectListDto>();
  form!: FormGroup;
  editForm!: FormGroup;
  isEditing = false;
  editingId: number | null = null;
  clients = signal<ClientOption[]>([]);
  workers = signal<WorkerOption[]>([]);
  estados = ['Pendiente', 'En Progreso', 'Finalizado', 'Suspendido'];

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      clienteId: [null, Validators.required],
      nombre: ['', Validators.required],
      ubicacion: ['', Validators.required],
      montoObra: [0, [Validators.required, Validators.min(1)]],
      estado: ['Pendiente', Validators.required],
      fechaInicio: [null],
      fechaFinEstimada: [null],
      trabajadorIds: [[]],
    });

    this.editForm = this.fb.group({
      clienteId: [null, Validators.required],
      nombre: ['', Validators.required],
      ubicacion: ['', Validators.required],
      montoObra: [0, [Validators.required, Validators.min(1)]],
      estado: ['Pendiente', Validators.required],
      fechaInicio: [null],
      fechaFinEstimada: [null],
      trabajadorIds: [[]],
    });

    this.loadProjects();
    this.loadClients();
    this.loadWorkers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProjects(): void {
    this.projectsService.getAll().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  loadClients(): void {
    this.http.get<ClientOption[]>('/api/clients').subscribe((data) => {
      this.clients.set(data);
    });
  }

  loadWorkers(): void {
    this.http.get<WorkerOption[]>('/api/workers').subscribe((data) => {
      this.workers.set(data);
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const dto: CreateProjectDto = {
      nombre: this.form.value.nombre,
      clienteId: this.form.value.clienteId,
      ubicacion: this.form.value.ubicacion,
      montoObra: this.form.value.montoObra,
      estado: this.form.value.estado,
      fechaInicio: this.form.value.fechaInicio
        ? new Date(this.form.value.fechaInicio).toISOString()
        : undefined,
      fechaFinEstimada: this.form.value.fechaFinEstimada
        ? new Date(this.form.value.fechaFinEstimada).toISOString()
        : undefined,
      trabajadorIds: this.form.value.trabajadorIds,
    };

    this.projectsService.create(dto).subscribe(() => {
      this.snackBar.open('Proyecto creado', 'Cerrar', { duration: 3000 });
      this.form.reset({ estado: 'Pendiente', trabajadorIds: [] });
      this.loadProjects();
    });
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || this.editingId === null) return;

    const dto: CreateProjectDto = {
      nombre: this.editForm.value.nombre,
      clienteId: this.editForm.value.clienteId,
      ubicacion: this.editForm.value.ubicacion,
      montoObra: this.editForm.value.montoObra,
      estado: this.editForm.value.estado,
      fechaInicio: this.editForm.value.fechaInicio
        ? new Date(this.editForm.value.fechaInicio).toISOString()
        : undefined,
      fechaFinEstimada: this.editForm.value.fechaFinEstimada
        ? new Date(this.editForm.value.fechaFinEstimada).toISOString()
        : undefined,
      trabajadorIds: this.editForm.value.trabajadorIds,
    };

    this.projectsService.update(this.editingId, dto).subscribe(() => {
      this.snackBar.open('Proyecto actualizado', 'Cerrar', { duration: 3000 });
      this.resetForm();
      this.loadProjects();
    });
  }

  editProject(project: ProjectListDto): void {
    this.isEditing = true;
    this.editingId = project.id;
    this.projectsService.getById(project.id).subscribe((detail) => {
      this.editForm.patchValue({
        clienteId: detail.clienteId,
        nombre: detail.nombre,
        ubicacion: detail.ubicacion,
        montoObra: detail.montoObra,
        estado: detail.estado,
        fechaInicio: detail.fechaInicio ? new Date(detail.fechaInicio) : null,
        fechaFinEstimada: detail.fechaFinEstimada ? new Date(detail.fechaFinEstimada) : null,
        trabajadorIds: detail.trabajadores.map(t => t.trabajadorId),
      });
    });
  }

  viewDetail(project: ProjectListDto): void {
    this.router.navigate(['/projects/detail', project.id]);
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.editForm.reset({ estado: 'Pendiente', trabajadorIds: [] });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'En Progreso': return 'badge-progress';
      case 'Finalizado': return 'badge-done';
      case 'Suspendido': return 'badge-suspended';
      default: return 'badge-pending';
    }
  }
}
