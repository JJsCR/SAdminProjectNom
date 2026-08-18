import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateClientDto, UpdateClientDto, Client } from '../models/client.model';

const baseUrl = '/api/clients';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(baseUrl);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${baseUrl}/${id}`);
  }

  create(dto: CreateClientDto): Observable<Client> {
    return this.http.post<Client>(baseUrl, dto);
  }

  update(id: number, dto: UpdateClientDto): Observable<Client> {
    return this.http.put<Client>(`${baseUrl}/${id}`, dto);
  }

  patchStatus(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${baseUrl}/${id}/status`, { activo });
  }
}
