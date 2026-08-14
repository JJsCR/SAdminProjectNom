import {
  Component,
  OnInit,
  signal,
  computed,
  ViewChild,
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
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ProductsService } from '../services/products.service';
import { Product, CreateProductDto } from '../models/product.model';

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
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss'],
})
export class ProductsPageComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form: FormGroup;
  imagePreview = signal<string | null>(null);
  products = signal<Product[]>([]);
  isLoading = signal(false);

  dataSource = computed(() => {
    const ds = new MatTableDataSource(this.products());
    return ds;
  });

  displayedColumns = ['image', 'name', 'price', 'city', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      city: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productsService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource().paginator = this.paginator;
          }
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const dto: CreateProductDto = {
      name: this.form.value.name,
      price: this.form.value.price,
      city: this.form.value.city || undefined,
      imageUrl: this.imagePreview() || undefined,
    };

    this.productsService.create(dto).subscribe({
      next: (created) => {
        this.products.update((list) => [created, ...list]);
        this.form.reset();
        this.imagePreview.set(null);
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
        this.products.update((list) =>
          list.map((p) => (p.id === product.id ? { ...p, isActive: newStatus } : p)),
        );
      },
      error: () => {
        this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }
}
