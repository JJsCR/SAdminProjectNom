import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductCard } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  public getProducts(): Observable<ProductCard[]> {
    return this.http.get<any[]>('/api/products').pipe(
      map(products => products
        .filter(p => p.isActive)
        .map(p => ({
          id: String(p.id),
          image: p.foto || './assets/e-commerce/products/1.png',
          title: p.name,
          subtitle: '',
          price: p.price,
          rating: '',
          status: ''
        }))
      )
    );
  }

  public getSimilarProducts(): Observable<ProductCard[]> {
    return this.getProducts();
  }
}
