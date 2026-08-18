import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LiquidacionesService, CreateLiquidacion } from '../../services/liquidaciones.service';
import { ProjectsService } from '../../../../../shared/services/projects.service';

export interface NewLiquidacionDialogData {
  fechaPago: string;
  workers: any[];
}

@Component({
  selector: 'app-new-day-event',
  templateUrl: './new-day-event.component.html',
  styleUrls: ['./new-day-event.component.scss'],
  standalone: false
})
export class NewDayEventComponent implements OnInit {
  form!: FormGroup;
  workers: any[] = [];
  projects: any[] = [];
  selectedWorkerMontoHora = 0;
  estados = ['Pendiente', 'Pagado'];
  metodosPago = ['Transferencia', 'Efectivo'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NewLiquidacionDialogData,
    public dialogRef: MatDialogRef<NewDayEventComponent>,
    private liquidacionesService: LiquidacionesService,
    private projectsService: ProjectsService
  ) {}

  ngOnInit(): void {
    this.workers = this.data.workers || [];
    this.projects = [];

    this.form = new FormGroup({
      trabajadorId: new FormControl<number | null>(null, Validators.required),
      proyectoId: new FormControl<number | null>({ value: null, disabled: true }, Validators.required),
      totalHoras: new FormControl<number>(0, [Validators.required, Validators.min(0.01)]),
      totalPagar: new FormControl<number>({ value: 0, disabled: true }),
      estado: new FormControl<string>('Pendiente', Validators.required),
      metodoPago: new FormControl<string>('Transferencia'),
      numeroReferencia: new FormControl<string>(''),
      fechaPago: new FormControl<string>({ value: this.data.fechaPago, disabled: true }),
    });

    // Cargar proyectos del trabajador seleccionado
    this.form.get('trabajadorId')!.valueChanges.subscribe((workerId) => {
      this.calcularTotal();
      this.form.get('proyectoId')!.setValue(null);
      if (workerId) {
        this.projectsService.getByWorker(workerId).subscribe({
          next: (projects) => {
            this.projects = projects;
            this.form.get('proyectoId')!.enable();
          },
          error: () => {
            this.projects = [];
            this.form.get('proyectoId')!.disable();
          }
        });
      } else {
        this.projects = [];
        this.form.get('proyectoId')!.disable();
      }
    });
    this.form.get('totalHoras')!.valueChanges.subscribe(() => this.calcularTotal());
  }

  calcularTotal(): void {
    const trabajadorId = this.form.get('trabajadorId')!.value;
    const horas = this.form.get('totalHoras')!.value || 0;
    const worker = this.workers.find(w => w.trabajadorId === trabajadorId);
    this.selectedWorkerMontoHora = worker ? worker.montoHora : 0;
    const total = horas * this.selectedWorkerMontoHora;
    this.form.get('totalPagar')!.setValue(total);
  }

  guardar(): void {
    if (this.form.invalid) return;

    const dto: CreateLiquidacion = {
      trabajadorId: this.form.get('trabajadorId')!.value,
      proyectoId: this.form.get('proyectoId')!.value,
      totalHoras: this.form.get('totalHoras')!.value,
      estado: this.form.get('estado')!.value,
      fechaPago: this.data.fechaPago,
      metodoPago: this.form.get('metodoPago')!.value,
      numeroReferencia: this.form.get('numeroReferencia')!.value || null,
    };

    this.liquidacionesService.create(dto).subscribe({
      next: (result) => this.dialogRef.close(result),
      error: (err) => console.error('Error creando liquidación', err)
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
