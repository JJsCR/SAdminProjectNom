export interface Worker {
  trabajadorId: number;
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  celular?: string | null;
  montoHora: number;
  montoHoraS: number;
  activo: boolean;
  fechaCreacion: string;
}

export interface CreateWorkerDto {
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  celular?: string;
  montoHora: number;
  montoHoraS: number;
}

export interface UpdateWorkerDto {
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  celular?: string;
  montoHora: number;
  montoHoraS: number;
}
