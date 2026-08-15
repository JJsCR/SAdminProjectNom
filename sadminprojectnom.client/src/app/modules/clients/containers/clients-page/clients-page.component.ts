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
import { Client, CreateClientDto } from '../../models/client.model';

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
  isLoading = signal(false);
  dataSource = new MatTableDataSource<Client>([]);
  displayedColumns = ['nombreCompleto', 'cedula', 'celular', 'correo', 'fechaCreacion', 'estado', 'acciones'];

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

  getNombreCompleto(client: Client): string {
    return `${client.nombre} ${client.apellido}`;
  }
}
