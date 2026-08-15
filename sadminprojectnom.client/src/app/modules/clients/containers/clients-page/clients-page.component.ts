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
import { ClientsService } from '../../services/clients.service';
import { Client, CreateClientDto, UpdateClientDto } from '../../models/client.model';

const AVATAR_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#00bcd4', '#009688',
  '#4caf50', '#ff9800', '#ff5722', '#795548',
];

@Component({
  selector: 'app-clients-page',
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
  ],
  templateUrl: './clients-page.component.html',
  styleUrls: ['./clients-page.component.scss'],
})
export class ClientsPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form: FormGroup;
  editForm: FormGroup;
  isLoading = signal(false);
  selectedClient = signal<Client | null>(null);
  dataSource = new MatTableDataSource<Client>([]);
  displayedColumns = ['nombreCompleto', 'correo', 'cedula', 'celular', 'fechaCreacion', 'estado'];

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cedula: [''],
      celular: ['', Validators.required],
      correo: ['', [Validators.email]],
    });

    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cedula: [''],
      celular: ['', Validators.required],
      correo: ['', [Validators.email]],
    });

    this.dataSource.filterPredicate = (data: Client, filter: string) => {
      const search = filter.trim().toLowerCase();
      return data.nombre.toLowerCase().includes(search) || data.apellido.toLowerCase().includes(search);
    };
  }

  ngOnInit(): void {
    this.loadClients();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadClients(): void {
    this.isLoading.set(true);
    this.clientsService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const dto: CreateClientDto = {
      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,
      cedula: this.form.value.cedula || undefined,
      celular: this.form.value.celular,
      correo: this.form.value.correo || undefined,
    };

    this.clientsService.create(dto).subscribe({
      next: (created) => {
        this.dataSource.data = [created, ...this.dataSource.data];
        this.form.reset();
        Object.keys(this.form.controls).forEach(key => {
          this.form.get(key)?.setErrors(null);
          this.form.get(key)?.markAsUntouched();
          this.form.get(key)?.markAsPristine();
        });
        this.snackBar.open('Cliente guardado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al guardar el cliente', 'Cerrar', { duration: 3000 });
      },
    });
  }

  toggleStatus(client: Client): void {
    const newStatus = !client.activo;
    this.clientsService.patchStatus(client.id, newStatus).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.map((c) =>
          c.id === client.id ? { ...c, activo: newStatus } : c,
        );
        this.snackBar.open(
          `Cliente ${newStatus ? 'activado' : 'desactivado'} correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  selectClient(client: Client): void {
    this.selectedClient.set(client);
    this.editForm.patchValue({
      nombre: client.nombre,
      apellido: client.apellido,
      cedula: client.cedula || '',
      celular: client.celular,
      correo: client.correo || '',
    });
  }

  cancelEdit(): void {
    this.selectedClient.set(null);
    this.editForm.reset();
  }

  onUpdate(): void {
    const client = this.selectedClient();
    if (!client || this.editForm.invalid) return;

    const dto: UpdateClientDto = {
      nombre: this.editForm.value.nombre,
      apellido: this.editForm.value.apellido,
      cedula: this.editForm.value.cedula || undefined,
      celular: this.editForm.value.celular,
      correo: this.editForm.value.correo || undefined,
    };

    this.clientsService.update(client.id, dto).subscribe({
      next: (updated) => {
        this.dataSource.data = this.dataSource.data.map((c) =>
          c.id === client.id ? updated : c,
        );
        this.selectedClient.set(null);
        this.editForm.reset();
        this.snackBar.open('Cliente actualizado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al actualizar el cliente', 'Cerrar', { duration: 3000 });
      },
    });
  }

  getNombreCompleto(client: Client): string {
    return `${client.nombre} ${client.apellido}`;
  }

  getInitial(nombre: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(nombre: string): string {
    const index = nombre ? nombre.charCodeAt(0) % AVATAR_COLORS.length : 0;
    return AVATAR_COLORS[index];
  }
}
