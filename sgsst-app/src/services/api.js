// src/services/api.js

export const api = async (endpoint, options = {}) => {
  const url = `http://localhost:8000/api${endpoint}`;

  // Obtener el perfil actual de la empresa
  let companyId = null;
  try {
    const saved = localStorage.getItem('sgsst_company_profile');
    if (saved) {
      companyId = JSON.parse(saved).id;
    }
  } catch (e) {
    console.warn("Fallo leyendo perfil para el token de empresa", e);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Inyectar el token de multi-tenencia si existe
  if (companyId) {
    headers['X-Company-ID'] = companyId.toString();
  }

  // Futuro: Aquí se inyectará el Authorization: Bearer {token} de Sanctum

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};
