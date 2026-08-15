import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart-empty-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn" style="vertical-align: middle; margin-right: 8px;">shopping_cart</mat-icon>
      Carrito Vacío
    </h2>
    <mat-dialog-content>
      <p>El carrito está vacío. Agregue al menos un producto antes de continuar.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="close()">Entendido</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; }
    p { font-size: 1rem; color: #555; margin: 16px 0; }
  `]
})
export class CartEmptyDialogComponent {
  constructor(private dialogRef: MatDialogRef<CartEmptyDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
