import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Liquidacion {
  liquidacionId: number;
  trabajadorId: number;
  trabajadorNombre: string;
  trabajadorCedula: string;
  montoHora: number;
  montoHoraS: number;
  totalHoras: number;
  totalPagar: number;
  totalS: number;
  estado: string;
  fechaPago: string | null;
  metodoPago: string | null;
  numeroReferencia: string | null;
  fechaCreacion: string;
  proyectoId: number | null;
  proyectoNombre: string | null;
  proyectoUbicacion: string | null;
}

export interface CreateLiquidacion {
  trabajadorId: number;
  proyectoId: number;
  totalHoras: number;
  estado: string;
  fechaPago: string | null;
  metodoPago: string | null;
  numeroReferencia: string | null;
}

const baseUrl = '/api/liquidaciones';

@Injectable({
  providedIn: 'root',
})
export class LiquidacionesService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Liquidacion[]> {
    return this.http.get<Liquidacion[]>(baseUrl);
  }

  getById(id: number): Observable<Liquidacion> {
    return this.http.get<Liquidacion>(`${baseUrl}/${id}`);
  }

  create(dto: CreateLiquidacion): Observable<Liquidacion> {
    return this.http.post<Liquidacion>(baseUrl, dto);
  }

  getByProyecto(proyectoId: number): Observable<Liquidacion[]> {
    return this.http.get<Liquidacion[]>(`${baseUrl}/by-proyecto/${proyectoId}`);
  }
}
