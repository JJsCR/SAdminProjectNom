import {Component, Input} from '@angular/core';
import {ProductCard} from '../../models';
import {routes} from '../../../../consts';
import {CartService} from '../../../../shared/services/cart.service';

@Component({
    selector: 'app-product-card',
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.scss'],
    standalone: false
})
export class ProductCardComponent {
  @Input() product: ProductCard;
  public routes: typeof routes = routes;

  constructor(private cartService: CartService) {}

  addToCart(event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart({
      id: this.product.id,
      image: this.product.image,
      title: this.product.title,
      price: this.product.price
    });
  }
}
