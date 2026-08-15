import { Component, OnInit } from '@angular/core';
import { routes } from '../../../../../consts';
import { Observable } from 'rxjs';
import { CartService, CartItem } from '../../../../../shared/services/cart.service';
import { QuotesService } from '../../../../../shared/services/quotes.service';
import { Project, Quote } from '../../../../../shared/models/quote.model';
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
  public projects: Project[] = [];
  public selectedProjectId: string = '';
  public generatedQuote: Quote | null = null;

  constructor(
    public cartService: CartService,
    private quotesService: QuotesService
  ) {
    this.cartItems$ = this.cartService.items$;
    this.subtotal$ = this.cartService.subtotal$;
    this.iva$ = this.subtotal$.pipe(map(s => s * 0.13));
    this.total$ = this.subtotal$.pipe(map(s => s * 1.13));
  }

  ngOnInit(): void {
    this.projects = this.quotesService.getProjects();
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

    const items = (this.cartService as any).cartItems$.value;
    this.generatedQuote = this.quotesService.generateQuote(items, this.selectedProjectId);
    this.cartService.clearCart();
  }

  closeConfirmation(): void {
    this.generatedQuote = null;
  }
}
