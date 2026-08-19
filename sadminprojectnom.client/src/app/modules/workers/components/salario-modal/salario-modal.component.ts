import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

export interface SemanaDetalle {
  numeroSemana: number;
  etiqueta: string;
  horasSemana: number;
  totalSSemana: number;
  proyectos: {
    nombreProyecto: string;
    horasEnProyecto: number;
    montoHoraSProyecto: number;
    totalSProyecto: number;
  }[];
}

export interface SalarioModalData {
  nombreTrabajador: string;
  nombreMes: string;
  horasTrabajadas: number;
  totalS: number;
  proyectos: {
    nombreProyecto: string;
    horasEnProyecto: number;
    montoHoraSProyecto: number;
    totalSProyecto: number;
  }[];
  semanas: SemanaDetalle[];
}

@Component({
  selector: 'app-salario-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTabsModule],
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
          <span class="metric-label">Total Salarial</span>
          <span class="metric-value salary">₡{{ data.totalS | number:'1.2-2' }}</span>
        </div>
      </div>

      @if (data.semanas && data.semanas.length > 0) {
        <h3 class="section-title">Desglose por Semana</h3>
        <mat-tab-group animationDuration="200ms" class="week-tabs">
          @for (semana of data.semanas; track semana.numeroSemana) {
            <mat-tab>
              <ng-template mat-tab-label>
                <div class="tab-label">
                  <span class="tab-week">Semana {{ semana.numeroSemana }}</span>
                  <span class="tab-dates">{{ semana.etiqueta }}</span>
                </div>
              </ng-template>
              @if (semana.proyectos.length > 0) {
                <table class="projects-table">
                  <thead>
                    <tr>
                      <th>Proyecto</th>
                      <th>Horas</th>
                      <th>Hora S</th>
                      <th>Total Salarial</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of semana.proyectos; track p.nombreProyecto) {
                      <tr>
                        <td>{{ p.nombreProyecto }}</td>
                        <td>{{ p.horasEnProyecto | number:'1.2-2' }}</td>
                        <td>₡{{ p.montoHoraSProyecto | number:'1.2-2' }}</td>
                        <td class="total-col">₡{{ p.totalSProyecto | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
                <div class="week-totals">
                  <span>Total Semana: <strong>{{ semana.horasSemana | number:'1.2-2' }} hrs</strong></span>
                  <span class="week-total-salary">₡{{ semana.totalSSemana | number:'1.2-2' }}</span>
                </div>
              } @else {
                <p class="no-data">Sin liquidaciones esta semana</p>
              }
            </mat-tab>
          }
        </mat-tab-group>
      } @else {
        <h3 class="section-title">Desglose por Proyecto</h3>
        <table class="projects-table">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Horas</th>
              <th>Hora S</th>
              <th>Total Salarial</th>
            </tr>
          </thead>
          <tbody>
            @for (p of data.proyectos; track p.nombreProyecto) {
              <tr>
                <td>{{ p.nombreProyecto }}</td>
                <td>{{ p.horasEnProyecto | number:'1.2-2' }}</td>
                <td>₡{{ p.montoHoraSProyecto | number:'1.2-2' }}</td>
                <td class="total-col">₡{{ p.totalSProyecto | number:'1.2-2' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
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
    .week-tabs {
      margin-top: 8px;
    }
    .tab-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.3;
    }
    .tab-week { font-size: 12px; font-weight: 600; }
    .tab-dates { font-size: 10px; color: #888; }
    .week-totals {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-top: 8px;
      font-size: 14px;
      color: #333;
    }
    .week-total-salary { font-weight: 700; color: #4caf50; font-size: 16px; }
    .no-data { text-align: center; color: #999; padding: 20px 0; font-size: 14px; }
  `]
})
export class SalarioModalComponent {
  constructor(
    public dialogRef: MatDialogRef<SalarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SalarioModalData
  ) {}
}
