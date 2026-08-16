import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateDetalleCotizacionDto {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface CreateCotizacionDto {
  proyectoId: number;
  items: CreateDetalleCotizacionDto[];
}

export interface CotizacionListDto {
  id: number;
  proyectoId: number;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: string;
  fechaCreacion: string;
  tieneFactura: boolean;
}

export interface DetalleCotizacionDto {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface FacturaDto {
  id: number;
  numeroFactura: string;
  subtotal: number;
  impuesto: number;
  total: number;
  fechaEmision: string;
  estado: string;
}

export interface CotizacionDetailDto {
  id: number;
  proyectoId: number;
  proyectoNombre: string;
  clienteNombre: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: string;
  fechaCreacion: string;
  detalles: DetalleCotizacionDto[];
  factura?: FacturaDto;
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {
  private baseUrl = '/api/cotizaciones';

  constructor(private http: HttpClient) {}

  getByProyecto(proyectoId: number): Observable<CotizacionListDto[]> {
    return this.http.get<CotizacionListDto[]>(`${this.baseUrl}/proyecto/${proyectoId}`);
  }

  getById(id: number): Observable<CotizacionDetailDto> {
    return this.http.get<CotizacionDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateCotizacionDto): Observable<{ cotizacionId: number; facturaId: number; numeroFactura: string }> {
    return this.http.post<{ cotizacionId: number; facturaId: number; numeroFactura: string }>(this.baseUrl, dto);
  }
}
