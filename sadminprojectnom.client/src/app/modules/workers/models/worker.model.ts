export interface Worker {
  trabajadorId: number;
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  celular?: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface CreateWorkerDto {
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  celular?: string;
}

export interface UpdateWorkerDto {
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  celular?: string;
}
