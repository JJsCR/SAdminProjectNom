import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ProjectDto[]> {
    return this.http.get<ProjectDto[]>('/api/projects');
  }
}
