export interface Client {
  id: number;
  nombre: string;
  apellido: string;
  cedula?: string | null;
  celular: string;
  correo?: string | null;
  activo: boolean;
  fechaCreacion: Date;
}

export interface CreateClientDto {
  nombre: string;
  apellido: string;
  cedula?: string;
  celular: string;
  correo?: string;
}

export interface UpdateClientDto {
  nombre: string;
  apellido: string;
  cedula?: string;
  celular: string;
  correo?: string;
}
