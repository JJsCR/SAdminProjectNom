import { InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';

export interface AppRuntimeConfig {
  version: string;
  remote: string;
  isBackend: boolean;
  hostApi: string;
  portApi: string;
  baseURLApi: string;
  auth: {
    email: string;
    password: string;
  };
}

const buildRuntimeConfig = (): AppRuntimeConfig => {
  // El backend (.NET) sirve el frontend Angular desde el mismo origen (misma
  // URL/puerto), tanto en desarrollo (via proxy.conf.js) como en producción
  // (wwwroot). Por eso las llamadas a la API usan una ruta relativa vacía en
  // lugar de apuntar a un host externo.
  const hostApi = '';
  const portApi = '';
  const baseURLApi = '';

  return {
    version: '1.2.0',
    remote: '',
    isBackend: environment.backend,
    hostApi,
    portApi,
    baseURLApi,
    auth: {
      email: '',
      password: '',
    },
  };
};

export const APP_RUNTIME_CONFIG = new InjectionToken<AppRuntimeConfig>(
  'APP_RUNTIME_CONFIG',
  {
    providedIn: 'root',
    factory: buildRuntimeConfig,
  },
);
