// This file is used for development AND production builds
// Angular 20+ recommends using a single environment file with runtime checks
import { isDevMode } from '@angular/core';

export const environment = {
  production: !isDevMode(),
  apiUrl: '/.netlify/functions/api-proxy/api',
};
