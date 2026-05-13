export const SGSST_URL = import.meta.env.VITE_SGSST_URL ?? 'http://localhost:8000';
const RAP_URL   = import.meta.env.VITE_RAP_URL   ?? 'http://localhost';

const getAuth = () => {
  try {
    const saved = localStorage.getItem('sgsst_auth');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getCompanyId = () => {
  try {
    const profile = localStorage.getItem('sgsst_company_profile');
    if (profile) return JSON.parse(profile)?.id;
    
    // Fallback: Si no hay perfil, intentar usar el tenant_id de la sesión
    const auth = localStorage.getItem('sgsst_auth');
    return auth ? JSON.parse(auth)?.tenant_id : null;
  } catch {
    return null;
  }
};

const buildHeaders = (extra = {}, skipContentType = false) => {
  const auth = getAuth();
  const companyId = getCompanyId();
  const headers = {
    'Accept': 'application/json',
    ...(!skipContentType && { 'Content-Type': 'application/json' }),
    ...extra,
  };
  if (auth?.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }
  if (companyId) {
    headers['X-Company-ID'] = companyId;
  }
  return headers;
};

// Llamadas al backend SG-SST — JSON
export const api = async (endpoint, options = {}) => {
  const { headers: extraHeaders, ...rest } = options;
  return fetch(`${SGSST_URL}/api${endpoint}`, {
    ...rest,
    headers: buildHeaders(extraHeaders),
  });
};

// Llamadas al backend SG-SST — FormData (sin Content-Type para que el browser ponga el boundary)
export const apiForm = async (endpoint, options = {}) => {
  const { headers: extraHeaders, ...rest } = options;
  return fetch(`${SGSST_URL}/api${endpoint}`, {
    ...rest,
    headers: buildHeaders(extraHeaders, true),
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
