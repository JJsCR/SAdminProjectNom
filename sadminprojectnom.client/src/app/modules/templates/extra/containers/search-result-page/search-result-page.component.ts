import { Component, OnInit } from '@angular/core';
import { routes } from '../../../../../consts';
import { BreadcrumbItem } from '../../../../../shared/ui-elements/breadcrumb/breadcrumb.component';
import { Observable } from 'rxjs';
import { CartService, CartItem } from '../../../../../shared/services/cart.service';
import { CotizacionesService, CreateCotizacionDto } from '../../../../../shared/services/cotizaciones.service';
import { ProjectsService, ProjectListDto } from '../../../../../shared/services/projects.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-search-result-page',
    templateUrl: './search-result-page.component.html',
    styleUrls: ['./search-result-page.component.scss'],
    standalone: false
})
export class SearchResultPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public cartItems$: Observable<CartItem[]>;
  public subtotal$: Observable<number>;
  public iva$: Observable<number>;
  public total$: Observable<number>;
  public projects: ProjectListDto[] = [];
  public selectedProjectId: number | null = null;
  public generatedResult: { cotizacionId: number; facturaId: number; numeroFactura: string } | null = null;
  public isGenerating = false;
  public breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', route: '/inicio' },
    { label: 'Cotizaciones' },
  ];

  constructor(
    public cartService: CartService,
    private cotizacionesService: CotizacionesService,
    private projectsService: ProjectsService
  ) {
    this.cartItems$ = this.cartService.items$;
    this.subtotal$ = this.cartService.subtotal$;
    this.iva$ = this.subtotal$.pipe(map(s => s * 0.13));
    this.total$ = this.subtotal$.pipe(map(s => s * 1.13));
  }

  ngOnInit(): void {
    this.projectsService.getAll().subscribe(projects => {
      this.projects = projects;
    });
  }

  increaseQty(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1);
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId, item.quantity - 1);
    }
  }

  onPriceChange(item: CartItem, value: string): void {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      this.cartService.updatePriceApplied(item.productId, num);
    } else {
      this.cartService.updatePriceApplied(item.productId, null);
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.productId);
  }

  generateQuote(): void {
    if (this.cartService.isEmpty()) {
      alert('El carrito debe contener al menos 1 ítem.');
      return;
    }
    if (!this.selectedProjectId) {
      alert('Debe seleccionar un proyecto antes de generar la cotización.');
      return;
    }

    this.isGenerating = true;
    const items = (this.cartService as any).cartItems$.value as CartItem[];

    const dto: CreateCotizacionDto = {
      proyectoId: this.selectedProjectId,
      items: items.map(item => ({
        productoId: parseInt(item.productId, 10),
        cantidad: item.quantity,
        precioUnitario: item.priceApplied !== null ? item.priceApplied : item.priceBase
      }))
    };

    this.cotizacionesService.create(dto).subscribe({
      next: (result) => {
        this.generatedResult = result;
        this.cartService.clearCart();
        this.isGenerating = false;
      },
      error: (err) => {
        console.error('Error al generar cotización:', err);
        alert('Error al generar la cotización. Revise la consola para más detalles.');
        this.isGenerating = false;
      }
    });
  }

  closeConfirmation(): void {
    this.generatedResult = null;
  }
}
