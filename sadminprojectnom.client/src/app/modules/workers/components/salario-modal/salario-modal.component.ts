import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SalarioModalData {
  nombreTrabajador: string;
  nombreMes: string;
  horasTrabajadas: number;
  salarioReal: number;
  tarifaHoraReal: number;
  proyectos: {
    nombreProyecto: string;
    horasEnProyecto: number;
    montoHoraProyecto: number;
    totalGanadoProyecto: number;
  }[];
}

@Component({
  selector: 'app-salario-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="modal-title">
      <mat-icon>calendar_month</mat-icon>
      {{ data.nombreMes }}
      <button mat-icon-button mat-dialog-close class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-dialog-content class="modal-content">
      <div class="worker-name">
        <mat-icon>person</mat-icon>
        <strong>{{ data.nombreTrabajador }}</strong>
      </div>

      <div class="metrics-row">
        <div class="metric">
          <span class="metric-label">Horas Trabajadas</span>
          <span class="metric-value">{{ data.horasTrabajadas | number:'1.2-2' }} hrs</span>
        </div>
        <div class="metric">
          <span class="metric-label">Salario Real</span>
          <span class="metric-value salary">₡{{ data.salarioReal | number:'1.2-2' }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Tarifa/Hora Real</span>
          <span class="metric-value">₡{{ data.tarifaHoraReal | number:'1.2-2' }}</span>
        </div>
      </div>

      <h3 class="section-title">Desglose por Proyecto</h3>
      <table class="projects-table">
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Horas</th>
            <th>₡/Hora</th>
            <th>Total Ganado</th>
          </tr>
        </thead>
        <tbody>
          @for (p of data.proyectos; track p.nombreProyecto) {
            <tr>
              <td>{{ p.nombreProyecto }}</td>
              <td>{{ p.horasEnProyecto | number:'1.2-2' }}</td>
              <td>₡{{ p.montoHoraProyecto | number:'1.2-2' }}</td>
              <td class="total-col">₡{{ p.totalGanadoProyecto | number:'1.2-2' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close color="primary">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; }
    .modal-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      padding: 20px 28px 12px;
      font-size: 20px;
      .close-btn { margin-left: auto; }
    }
    .modal-content {
      min-width: 560px;
      padding: 8px 28px 20px;
    }
    .worker-name {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 17px;
      margin-bottom: 20px;
      color: #333;
    }
    .metrics-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #f5f5f5;
      padding: 14px 20px;
      border-radius: 10px;
      min-width: 150px;
      flex: 1;
    }
    .metric-label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .metric-value { font-size: 20px; font-weight: 600; color: #333; }
    .metric-value.salary { color: #4caf50; }
    .section-title { margin: 20px 0 12px; font-size: 15px; color: #555; font-weight: 600; }
    .projects-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      th, td {
        padding: 12px 14px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }
      th { font-size: 12px; color: #888; text-transform: uppercase; }
      .total-col { font-weight: 600; color: #1976d2; }
    }
  `]
})
export class SalarioModalComponent {
  constructor(
    public dialogRef: MatDialogRef<SalarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SalarioModalData
  ) {}
}
