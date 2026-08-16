import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectListDto {
  id: number;
  nombre: string;
  clienteNombre: string;
  ubicacion: string;
  montoObra: number;
  estado: string;
  numTrabajadores: number;
  numAbonos: number;
  fechaInicio?: string;
  fechaFinEstimada?: string;
}

export interface TrabajadorAsignadoDto {
  trabajadorId: number;
  nombreCompleto: string;
}

export interface AbonoDto {
  id: number;
  monto: number;
  fecha: string;
  metodoPago?: string;
  numeroReferencia?: string;
  observaciones?: string;
}

export interface ProjectDetailDto {
  id: number;
  nombre: string;
  clienteId: number;
  clienteNombre: string;
  ubicacion: string;
  montoObra: number;
  estado: string;
  fechaInicio?: string;
  fechaFinEstimada?: string;
  fechaCreacion: string;
  totalAbonos: number;
  saldoPendiente: number;
  trabajadores: TrabajadorAsignadoDto[];
  abonos: AbonoDto[];
}

export interface CreateProjectDto {
  nombre: string;
  clienteId: number;
  ubicacion: string;
  montoObra: number;
  estado: string;
  fechaInicio?: string;
  fechaFinEstimada?: string;
  trabajadorIds?: number[];
}

export interface CreateAbonoDto {
  monto: number;
  fecha: string;
  metodoPago?: string;
  numeroReferencia?: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private baseUrl = '/api/projects';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProjectListDto[]> {
    return this.http.get<ProjectListDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<ProjectDetailDto> {
    return this.http.get<ProjectDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateProjectDto): Observable<any> {
    return this.http.post(this.baseUrl, dto);
  }

  update(id: number, dto: CreateProjectDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, dto);
  }

  createAbono(projectId: number, dto: CreateAbonoDto): Observable<AbonoDto> {
    return this.http.post<AbonoDto>(`${this.baseUrl}/${projectId}/abonos`, dto);
  }

  deleteAbono(projectId: number, abonoId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${projectId}/abonos/${abonoId}`);
  }
}

