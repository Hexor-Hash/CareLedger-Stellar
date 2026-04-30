import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

export const providersApi = {
  register: (data: { name: string; wallet: string; specialty: string }) =>
    api.post('/providers', data).then((r) => r.data),
  list: () => api.get('/providers').then((r) => r.data),
};

export const paymentsApi = {
  pay: (data: {
    patient: string;
    providerId: number;
    amount: string;
    tokenAddr: string;
    serviceHash: string;
  }) => api.post('/payments', data).then((r) => r.data),
  byPatient: (patient: string) =>
    api.get('/payments', { params: { patient } }).then((r) => r.data),
  byProvider: (providerId: number) =>
    api.get('/payments', { params: { providerId } }).then((r) => r.data),
};

export const recordsApi = {
  upload: (formData: FormData) =>
    api.post('/records/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  byPatient: (patient: string) =>
    api.get('/records', { params: { patient } }).then((r) => r.data),
  grantAccess: (id: number, data: { patient: string; accessor: string; expiry: number }) =>
    api.post(`/records/${id}/grant`, data).then((r) => r.data),
  revokeAccess: (id: number, data: { patient: string; accessor: string }) =>
    api.post(`/records/${id}/revoke`, data).then((r) => r.data),
};

export const claimsApi = {
  submit: (data: { paymentId: number; insurer: string; amount: string }) =>
    api.post('/claims', data).then((r) => r.data),
  list: () => api.get('/claims').then((r) => r.data),
};
