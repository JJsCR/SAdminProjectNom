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
import { ProductsService } from '../../services/products.service';
import { Product, CreateProductDto } from '../../models/product.model';

@Component({
  selector: 'app-products-page',
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
  ],
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss'],
})
export class ProductsPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form: FormGroup;
  isLoading = signal(false);
  dataSource = new MatTableDataSource<Product>([]);
  displayedColumns = ['name', 'price', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productsService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const dto: CreateProductDto = {
      name: this.form.value.name,
      price: this.form.value.price,
    };

    this.productsService.create(dto).subscribe({
      next: (created) => {
        this.dataSource.data = [created, ...this.dataSource.data];
        this.form.reset();
        this.snackBar.open('Producto guardado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al guardar el producto', 'Cerrar', { duration: 3000 });
      },
    });
  }

  toggleStatus(product: Product): void {
    const newStatus = !product.isActive;
    this.productsService.patchStatus(product.id, newStatus).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.map((p) =>
          p.id === product.id ? { ...p, isActive: newStatus } : p,
        );
      },
      error: () => {
        this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
      },
    });
  }
}

