import {
  Component,
  OnInit,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { SalarioModalComponent, SalarioModalData } from '../../components/salario-modal/salario-modal.component';
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
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/ui-elements/breadcrumb/breadcrumb.component';

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
    MatDialogModule,
    BreadcrumbComponent,
    NgxEchartsDirective,
  ],
  providers: [
    provideEchartsCore({ echarts: () => import('echarts') }),
  ],
  templateUrl: './workers-page.component.html',
  styleUrls: ['./workers-page.component.scss'],
})
export class WorkersPageComponent implements OnInit {
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }
  @ViewChild('editCard', { read: ElementRef }) editCardRef!: ElementRef;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', route: '/inicio' },
    { label: 'Trabajadores' },
  ];

  form: FormGroup;
  editForm: FormGroup;
  isLoading = signal(false);
  selectedWorker = signal<Worker | null>(null);
  searchValue = signal('');
  dataSource = new MatTableDataSource<Worker>([]);
  displayedColumns = ['nombreCompleto', 'cedula', 'fechaNacimiento', 'celular', 'montoHora', 'montoHoraS', 'fechaCreacion', 'estado'];

  salarioChartOptions = signal<EChartsOption | null>(null);
  salarioData = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private workersService: WorkersService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private http: HttpClient,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cedula: ['', Validators.required],
      fechaNacimiento: [null, Validators.required],
      celular: [''],
      montoHora: [null, [Validators.required, Validators.min(0)]],
      montoHoraS: [null, [Validators.required, Validators.min(0)]],
    });

    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cedula: ['', Validators.required],
      fechaNacimiento: [null, Validators.required],
      celular: [''],
      montoHora: [null, [Validators.required, Validators.min(0)]],
      montoHoraS: [null, [Validators.required, Validators.min(0)]],
    });

    this.dataSource.filterPredicate = (data: Worker, filter: string) => {
      const search = filter.trim().toLowerCase();
      return data.nombre.toLowerCase().includes(search) || data.apellido.toLowerCase().includes(search);
    };
  }

  ngOnInit(): void {
    this.loadWorkers();
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
      montoHora: this.form.value.montoHora,
      montoHoraS: this.form.value.montoHoraS,
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
      montoHora: worker.montoHora,
      montoHoraS: worker.montoHoraS,
    });
    this.loadSalarioChart(worker.trabajadorId);
    setTimeout(() => {
      this.editCardRef?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  private readonly MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  private calcYMax(maxVal: number): number {
    if (maxVal <= 0) return 5000;
    const ticks = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 750000,
      1000000, 2000000, 3000000, 5000000];
    const target = maxVal * 1.3;
    for (const t of ticks) {
      if (t >= target) return t;
    }
    return Math.ceil(target / 1000000) * 1000000;
  }

  private formatYLabel(v: number): string {
    if (v >= 1000000) return '₡' + (v / 1000000) + 'M';
    if (v >= 1000) return '₡' + (v / 1000) + 'K';
    return '₡' + v;
  }

  loadSalarioChart(trabajadorId: number): void {
    this.http.get<any[]>(`/api/salarios/historial/${trabajadorId}`).subscribe({
      next: (data) => {
        const allMonths = this.MESES_CORTOS;

        // Build 12-month arrays (index 0=Ene ... 11=Dic)
        const dataByMonth: (any | null)[] = new Array(12).fill(null);
        const valores: number[] = new Array(12).fill(0);

        for (const d of data) {
          const idx = d.mes - 1;
          valores[idx] += d.totalS;
          if (!dataByMonth[idx]) {
            dataByMonth[idx] = {
              nombreMes: d.nombreMes,
              horasTrabajadas: d.horasTrabajadas,
              totalS: d.totalS,
              proyectos: d.proyectos ? [...d.proyectos] : [],
              semanas: d.semanas ? [...d.semanas] : []
            };
          } else {
            dataByMonth[idx].totalS += d.totalS;
            dataByMonth[idx].horasTrabajadas += d.horasTrabajadas;
            if (d.proyectos) {
              dataByMonth[idx].proyectos = [...dataByMonth[idx].proyectos, ...d.proyectos];
            }
            if (d.semanas) {
              dataByMonth[idx].semanas = [...dataByMonth[idx].semanas, ...d.semanas];
            }
          }
        }
        this.salarioData.set(dataByMonth);

        const maxVal = Math.max(...valores);
        const yMax = this.calcYMax(maxVal);

        this.salarioChartOptions.set({
          grid: { top: 30, left: 60, right: 20, bottom: 30, containLabel: true },
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#fff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            textStyle: { color: '#333', fontSize: 13 },
            axisPointer: {
              type: 'cross',
              lineStyle: { color: '#ddd', type: 'dashed' }
            },
            formatter: (params: any) => {
              const p = params[0];
              if (!p || p.value === 0) return `${p.name}<br/>Sin datos`;
              return `<strong>${p.name}</strong><br/>Salario: ₡${Number(p.value).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;
            }
          },
          xAxis: {
            type: 'category',
            data: allMonths,
            boundaryGap: false,
            axisLine: { lineStyle: { color: '#e0e0e0' } },
            axisTick: { show: false },
            axisLabel: { color: '#666', fontSize: 11 }
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: yMax,
            splitLine: { lineStyle: { color: '#f5f5f5' } },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#999', fontSize: 11, formatter: (v: number) => this.formatYLabel(v) }
          },
          series: [{
            type: 'line',
            data: valores,
            smooth: 0.4,
            showSymbol: false,
            symbolSize: 8,
            emphasis: {
              showSymbol: true,
              itemStyle: { borderWidth: 2, borderColor: '#5b8ff9', color: '#fff' }
            },
            areaStyle: {
              opacity: 1,
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(91,143,249,0.3)' },
                  { offset: 1, color: 'rgba(91,143,249,0.02)' }
                ]
              } as any
            },
            lineStyle: { color: '#7B9BF5', width: 2.5 },
            itemStyle: { color: '#7B9BF5' }
          }]
        } as EChartsOption);
      },
      error: () => {
        this.salarioChartOptions.set(null);
      }
    });
  }

  onChartClick(event: any): void {
    const data = this.salarioData();
    if (!data || !data.length) return;
    const idx = event.dataIndex;
    const mesData = data[idx];
    if (!mesData || mesData.totalS == null) return;
    const worker = this.selectedWorker();
    const dialogData: SalarioModalData = {
      nombreTrabajador: worker ? `${worker.nombre} ${worker.apellido}` : '',
      nombreMes: mesData.nombreMes,
      horasTrabajadas: mesData.horasTrabajadas,
      totalS: mesData.totalS,
      proyectos: mesData.proyectos,
      semanas: mesData.semanas ?? []
    };
    this.dialog.open(SalarioModalComponent, {
      width: '720px',
      maxWidth: '90vw',
      autoFocus: false,
      panelClass: 'salario-modal-panel',
      data: dialogData
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
      montoHora: this.editForm.value.montoHora,
      montoHoraS: this.editForm.value.montoHoraS,
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
