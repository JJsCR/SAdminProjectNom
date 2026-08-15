import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateProductDto, UpdateProductDto, Product } from '../models/product.model';

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

  update(id: number, dto: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${baseUrl}/${id}`, dto);
  }

  patchStatus(id: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${baseUrl}/${id}/status`, { isActive });
  }
}
