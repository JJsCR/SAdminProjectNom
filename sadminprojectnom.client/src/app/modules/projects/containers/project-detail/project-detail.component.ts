import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
import { ClientsService } from '../../../clients/services/clients.service';
import { Client } from '../../../clients/models/client.model';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/ui-elements/breadcrumb/breadcrumb.component';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

export interface CompanyInfo {
  nombre: string;
  eslogan: string;
  telefono: string;
  logo: string;
}

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
    BreadcrumbComponent,
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
  companyInfo: CompanyInfo | null = null;
  clienteDetalle: Client | null = null;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', route: '/inicio' },
    { label: 'Proyectos', route: '/proyectos' },
    { label: 'Detalle de Proyecto' },
  ];

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private cotizacionesService: CotizacionesService,
    private clientsService: ClientsService,
    private http: HttpClient,
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

    this.http.get<CompanyInfo>('assets/data/company-info.json').subscribe((info) => {
      this.companyInfo = info;
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
      if (data.clienteId) {
        this.clientsService.getById(data.clienteId).subscribe((client) => {
          this.clienteDetalle = client;
        });
      }
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

  exportCotizacionExcel(cot: CotizacionDetailDto): void {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Cotización');

    // Column widths
    sheet.getColumn(1).width = 5;
    sheet.getColumn(2).width = 30;
    sheet.getColumn(3).width = 15;
    sheet.getColumn(4).width = 18;
    sheet.getColumn(5).width = 18;
    sheet.getColumn(6).width = 18;

    // Row 1: Title "COTIZACIÓN"
    const titleRow = sheet.addRow(['COTIZACIÓN']);
    titleRow.font = { bold: true, size: 16, color: { argb: 'FF333333' } };
    sheet.mergeCells('A1:F1');
    titleRow.height = 24;

    sheet.addRow([]);

    // Add logo image
    this.http.get('assets/images/company-logo.png', { responseType: 'arraybuffer' }).subscribe({
      next: (logoBuffer) => {
        const logoId = workbook.addImage({
          buffer: logoBuffer,
          extension: 'png',
        });
        sheet.addImage(logoId, {
          tl: { col: 0, row: 2 },
          ext: { width: 80, height: 80 },
        });

        this.buildExcelContent(workbook, sheet, cot);
      },
      error: () => {
        // If logo fails to load, continue without it
        this.buildExcelContent(workbook, sheet, cot);
      }
    });
  }

  private buildExcelContent(workbook: Workbook, sheet: any, cot: CotizacionDetailDto): void {
    // Leave rows 3-7 for logo space on the left, put company info below
    let currentRow = 3;

    // Company info (left side, rows 3-6)
    if (this.companyInfo) {
      sheet.getCell(`A${currentRow}`).value = '';
      currentRow++;
      sheet.getCell(`A${currentRow}`).value = '';
      currentRow++;
      sheet.getCell(`A${currentRow}`).value = '';
      currentRow++;
      sheet.getCell(`A${currentRow}`).value = '';
      currentRow++;

      // Row 8: Company name
      const compNameRow = sheet.getRow(currentRow);
      sheet.getCell(`A${currentRow}`).value = this.companyInfo.nombre;
      compNameRow.font = { bold: true, size: 12 };
      currentRow++;

      // Row 9: Slogan
      sheet.getCell(`A${currentRow}`).value = this.companyInfo.eslogan;
      sheet.getRow(currentRow).font = { italic: true, size: 10, color: { argb: 'FF777777' } };
      currentRow++;

      // Row 10: Phone
      sheet.getCell(`A${currentRow}`).value = 'Teléfono: ' + this.companyInfo.telefono;
      sheet.getRow(currentRow).font = { size: 10 };
      currentRow++;
    }

    // Client info on the right (column E-F, rows 3-8)
    if (this.clienteDetalle) {
      let clientRow = 3;
      sheet.getCell(`E${clientRow}`).value = 'Información del Cliente';
      sheet.getCell(`E${clientRow}`).font = { bold: true, size: 11, color: { argb: 'FFE0A800' } };
      clientRow++;

      sheet.getCell(`E${clientRow}`).value = this.clienteDetalle.nombre + ' ' + this.clienteDetalle.apellido;
      sheet.getCell(`E${clientRow}`).font = { bold: true, size: 10 };
      clientRow++;

      if (this.clienteDetalle.cedula) {
        sheet.getCell(`E${clientRow}`).value = 'Cédula: ' + this.clienteDetalle.cedula;
        sheet.getCell(`E${clientRow}`).font = { size: 10 };
        clientRow++;
      }

      sheet.getCell(`E${clientRow}`).value = 'Celular: ' + this.clienteDetalle.celular;
      sheet.getCell(`E${clientRow}`).font = { size: 10 };
      clientRow++;

      if (this.clienteDetalle.correo) {
        sheet.getCell(`E${clientRow}`).value = 'Correo: ' + this.clienteDetalle.correo;
        sheet.getCell(`E${clientRow}`).font = { size: 10 };
        clientRow++;
      }
    }

    currentRow++;

    // Cotización info
    sheet.getCell(`A${currentRow}`).value = 'Cotización #' + cot.id;
    sheet.getRow(currentRow).font = { bold: true, size: 11 };
    currentRow++;
    sheet.getCell(`A${currentRow}`).value = 'Proyecto: ' + cot.proyectoNombre;
    currentRow++;
    sheet.getCell(`A${currentRow}`).value = 'Fecha: ' + new Date(cot.fechaCreacion).toLocaleDateString('es-CR');
    currentRow++;
    currentRow++;

    // Table header
    const headerRow = sheet.getRow(currentRow);
    const headers = ['#', 'Producto', 'Cantidad', 'Precio Unitario', 'Total'];
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } } };
      cell.alignment = { horizontal: i >= 3 ? 'right' : 'left' };
    });
    currentRow++;

    // Items
    cot.detalles.forEach((d, i) => {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = i + 1;
      row.getCell(2).value = d.productoNombre;
      row.getCell(3).value = d.cantidad;
      row.getCell(4).value = d.precioUnitario;
      row.getCell(4).numFmt = '₡#,##0.00';
      row.getCell(4).alignment = { horizontal: 'right' };
      row.getCell(5).value = d.subtotal;
      row.getCell(5).numFmt = '₡#,##0.00';
      row.getCell(5).alignment = { horizontal: 'right' };
      row.eachCell((cell: any) => {
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
      });
      currentRow++;
    });

    currentRow++;

    // Totals
    const subtotalRow = sheet.getRow(currentRow);
    subtotalRow.getCell(4).value = 'Subtotal:';
    subtotalRow.getCell(4).font = { bold: true };
    subtotalRow.getCell(4).alignment = { horizontal: 'right' };
    subtotalRow.getCell(5).value = cot.subtotal;
    subtotalRow.getCell(5).numFmt = '₡#,##0.00';
    subtotalRow.getCell(5).alignment = { horizontal: 'right' };
    currentRow++;

    const ivaRow = sheet.getRow(currentRow);
    ivaRow.getCell(4).value = 'IVA (13%):';
    ivaRow.getCell(4).font = { bold: true };
    ivaRow.getCell(4).alignment = { horizontal: 'right' };
    ivaRow.getCell(5).value = cot.impuesto;
    ivaRow.getCell(5).numFmt = '₡#,##0.00';
    ivaRow.getCell(5).alignment = { horizontal: 'right' };
    currentRow++;

    const totalRowExcel = sheet.getRow(currentRow);
    totalRowExcel.getCell(4).value = 'Total:';
    totalRowExcel.getCell(4).font = { bold: true, size: 12 };
    totalRowExcel.getCell(4).alignment = { horizontal: 'right' };
    totalRowExcel.getCell(5).value = cot.total;
    totalRowExcel.getCell(5).numFmt = '₡#,##0.00';
    totalRowExcel.getCell(5).font = { bold: true, size: 12, color: { argb: 'FF1565C0' } };
    totalRowExcel.getCell(5).alignment = { horizontal: 'right' };

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Cotizacion_${cot.id}.xlsx`);
    });
  }
}
