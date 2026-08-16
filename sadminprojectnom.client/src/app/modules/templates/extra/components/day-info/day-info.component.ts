import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Liquidacion } from '../../services/liquidaciones.service';

@Component({
  selector: 'app-day-info',
  templateUrl: './day-info.component.html',
  styleUrls: ['./day-info.component.scss'],
  standalone: false
})
export class DayInfoComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Liquidacion,
    public dialogRef: MatDialogRef<DayInfoComponent>
  ) {}

  public close(): void {
    this.dialogRef.close();
  }
}
