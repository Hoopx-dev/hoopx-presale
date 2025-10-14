import axios from 'axios';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://boot-api.hoopx.gg';
export const http = axios.create({ baseURL: API_BASE });

http.interceptors.request.use((config) => {
  // Log request details in development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== HTTP Request ===');
    console.log('Method:', config.method?.toUpperCase());
    console.log('URL:', `${config.baseURL || ''}${config.url || ''}`);
    console.log('Data:', JSON.stringify(config.data, null, 2));
    console.log('===================');
  }

  return config;
});

http.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== HTTP Response ===');
      console.log('Status:', response.status, response.statusText);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log('====================');
    }
    return response;
  },
  (error) => {
    // Log error response
    console.error('=== HTTP Error ===');
    console.error('Status:', error.response?.status, error.response?.statusText);
    console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error Message:', error.message);
    console.error('==================');

    return Promise.reject(error);
  }
);
