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
import { MatChipsModule } from '@angular/material/chips';
import { ProductsService } from '../../services/products.service';
import { Product, CreateProductDto, UpdateProductDto } from '../../models/product.model';

const AVATAR_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#00bcd4', '#009688',
  '#4caf50', '#ff9800', '#ff5722', '#795548',
];

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
    MatChipsModule,
  ],
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss'],
})
export class ProductsPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form: FormGroup;
  editForm: FormGroup;
  isLoading = signal(false);
  imagePreview = signal<string | null>(null);
  editImagePreview = signal<string | null>(null);
  selectedProduct = signal<Product | null>(null);
  dataSource = new MatTableDataSource<Product>([]);
  displayedColumns = ['name', 'price', 'status'];

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
    });

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
    });

    this.dataSource.filterPredicate = (data: Product, filter: string) => {
      return data.name.toLowerCase().includes(filter.trim().toLowerCase());
    };
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

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  onEditFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => this.editImagePreview.set(e.target?.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const dto: CreateProductDto = {
      name: this.form.value.name,
      price: this.form.value.price,
      foto: this.imagePreview() ?? undefined,
    };

    this.productsService.create(dto).subscribe({
      next: (created) => {
        this.dataSource.data = [created, ...this.dataSource.data];
        this.form.reset();
        Object.keys(this.form.controls).forEach(key => {
          this.form.get(key)?.setErrors(null);
          this.form.get(key)?.markAsUntouched();
          this.form.get(key)?.markAsPristine();
        });
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
        this.dataSource.data = this.dataSource.data.map((p) =>
          p.id === product.id ? { ...p, isActive: newStatus } : p,
        );
        this.snackBar.open(
          `Producto ${newStatus ? 'activado' : 'desactivado'} correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  selectProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.editImagePreview.set(product.foto || null);
    this.editForm.patchValue({
      name: product.name,
      price: product.price,
    });
  }

  cancelEdit(): void {
    this.selectedProduct.set(null);
    this.editForm.reset();
    this.editImagePreview.set(null);
  }

  onUpdate(): void {
    const product = this.selectedProduct();
    if (!product || this.editForm.invalid) return;

    const dto: UpdateProductDto = {
      name: this.editForm.value.name,
      price: this.editForm.value.price,
      foto: this.editImagePreview() ?? undefined,
    };

    this.productsService.update(product.id, dto).subscribe({
      next: (updated) => {
        this.dataSource.data = this.dataSource.data.map((p) =>
          p.id === product.id ? updated : p,
        );
        this.selectedProduct.set(null);
        this.editForm.reset();
        this.editImagePreview.set(null);
        this.snackBar.open('Producto actualizado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al actualizar el producto', 'Cerrar', { duration: 3000 });
      },
    });
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(name: string): string {
    const index = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
    return AVATAR_COLORS[index];
  }
}
