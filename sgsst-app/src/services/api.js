const SGSST_URL = import.meta.env.VITE_SGSST_URL ?? 'http://localhost:8000';
const RAP_URL   = import.meta.env.VITE_RAP_URL   ?? 'http://localhost';

const getAuth = () => {
  try {
    const saved = localStorage.getItem('sgsst_auth');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const buildHeaders = (extra = {}) => {
  const auth = getAuth();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...extra,
  };
  if (auth?.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }
  return headers;
};

// Llamadas al backend SG-SST (sgsst-backend)
export const api = async (endpoint, options = {}) => {
  const { headers: extraHeaders, ...rest } = options;
  return fetch(`${SGSST_URL}/api${endpoint}`, {
    ...rest,
    headers: buildHeaders(extraHeaders),
  });
};

// Llamadas al backend RAP (tienda-multitenancy) para auth
export const rapApi = async (endpoint, options = {}) => {
  const { headers: extraHeaders, ...rest } = options;
  return fetch(`${RAP_URL}${endpoint}`, {
    ...rest,
    headers: buildHeaders(extraHeaders),
  });
};
