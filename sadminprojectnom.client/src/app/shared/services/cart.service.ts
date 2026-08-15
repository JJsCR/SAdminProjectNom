import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CartItem {
  productId: string;
  image: string;
  title: string;
  priceBase: number; // Precio lista en colones
  priceApplied: number | null; // Precio especial (null = usar priceBase)
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);

  get items$(): Observable<CartItem[]> {
    return this.cartItems$.asObservable();
  }

  get totalItems$(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((sum, item) => sum + item.quantity, 0))
    );
  }

  get subtotal$(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((sum, item) => {
        const price = item.priceApplied !== null ? item.priceApplied : item.priceBase;
        return sum + (price * item.quantity);
      }, 0))
    );
  }

  addToCart(product: { id: string; image: string; title: string; price: number }): void {
    const items = this.cartItems$.value;
    const existing = items.find(i => i.productId === product.id);

    if (existing) {
      existing.quantity += 1;
      this.cartItems$.next([...items]);
    } else {
      this.cartItems$.next([...items, {
        productId: product.id,
        image: product.image,
        title: product.title,
        priceBase: product.price,
        priceApplied: null,
        quantity: 1
      }]);
    }
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) return;
    const items = this.cartItems$.value;
    const item = items.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.cartItems$.next([...items]);
    }
  }

  updatePriceApplied(productId: string, price: number | null): void {
    const items = this.cartItems$.value;
    const item = items.find(i => i.productId === productId);
    if (item) {
      item.priceApplied = price;
      this.cartItems$.next([...items]);
    }
  }

  removeItem(productId: string): void {
    const items = this.cartItems$.value.filter(i => i.productId !== productId);
    this.cartItems$.next(items);
  }

  clearCart(): void {
    this.cartItems$.next([]);
  }

  getItemCount(): number {
    return this.cartItems$.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this.cartItems$.value.length === 0;
  }
}
