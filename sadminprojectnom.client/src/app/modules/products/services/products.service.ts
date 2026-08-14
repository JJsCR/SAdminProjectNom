import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateProductDto, Product } from '../models/product.model';

const baseUrl = '/api/products';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(baseUrl);
  }

  create(dto: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(baseUrl, dto);
  }

  patchStatus(id: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${baseUrl}/${id}/status`, { isActive });
  }
}
