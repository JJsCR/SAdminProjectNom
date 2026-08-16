import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import {
  ProjectsService,
  ProjectDetailDto,
  AbonoDto,
  CreateAbonoDto,
} from '../../../../shared/services/projects.service';
import { CotizacionesService, CotizacionDetailDto } from '../../../../shared/services/cotizaciones.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit {
  project: ProjectDetailDto | null = null;
  cotizaciones: CotizacionDetailDto[] = [];
  showAbonoForm = false;
  abonoForm!: FormGroup;
  metodosPago = ['Efectivo', 'Transferencia', 'Sinpe Móvil', 'Cheque', 'Tarjeta'];

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private cotizacionesService: CotizacionesService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.abonoForm = this.fb.group({
      monto: [0, [Validators.required, Validators.min(1)]],
      fecha: [new Date(), Validators.required],
      metodoPago: [null],
      numeroReferencia: [''],
      observaciones: [''],
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProject(id);
      this.loadCotizaciones(id);
    }
  }

  loadProject(id: number): void {
    this.projectsService.getById(id).subscribe((data) => {
      this.project = data;
    });
  }

  loadCotizaciones(proyectoId: number): void {
    this.cotizacionesService.getByProyecto(proyectoId).subscribe((list) => {
      list.forEach((c) => {
        this.cotizacionesService.getById(c.id).subscribe((detail) => {
          this.cotizaciones.push(detail);
        });
      });
    });
  }

  toggleAbonoForm(): void {
    this.showAbonoForm = !this.showAbonoForm;
  }

  submitAbono(): void {
    if (!this.project || this.abonoForm.invalid) return;

    const dto: CreateAbonoDto = {
      monto: this.abonoForm.value.monto,
      fecha: new Date(this.abonoForm.value.fecha).toISOString(),
      metodoPago: this.abonoForm.value.metodoPago,
      numeroReferencia: this.abonoForm.value.numeroReferencia || undefined,
      observaciones: this.abonoForm.value.observaciones || undefined,
    };

    this.projectsService.createAbono(this.project.id, dto).subscribe(() => {
      this.snackBar.open('Abono registrado exitosamente', 'Cerrar', { duration: 3000 });
      this.showAbonoForm = false;
      this.abonoForm.reset({ fecha: new Date(), monto: 0 });
      this.loadProject(this.project!.id);
    });
  }

  deleteAbono(abono: AbonoDto): void {
    if (!this.project) return;
    this.projectsService.deleteAbono(this.project.id, abono.id).subscribe(() => {
      this.snackBar.open('Abono eliminado', 'Cerrar', { duration: 3000 });
      this.loadProject(this.project!.id);
    });
  }
}
