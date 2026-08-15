import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateWorkerDto, UpdateWorkerDto, Worker } from '../models/worker.model';

const baseUrl = '/api/workers';

@Injectable({
  providedIn: 'root',
})
export class WorkersService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Worker[]> {
    return this.http.get<Worker[]>(baseUrl);
  }

  create(dto: CreateWorkerDto): Observable<Worker> {
    return this.http.post<Worker>(baseUrl, dto);
  }

  update(id: number, dto: UpdateWorkerDto): Observable<Worker> {
    return this.http.put<Worker>(`${baseUrl}/${id}`, dto);
  }

  patchStatus(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${baseUrl}/${id}/status`, { activo });
  }
}
