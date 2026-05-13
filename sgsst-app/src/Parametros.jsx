import React, { useState, useEffect } from 'react';
import {
  Settings, Building, Shield, User, Upload, Image,
  Save, X, CheckCircle2, AlertTriangle, Eye,
} from 'lucide-react';
import { api, apiForm, SGSST_URL } from './services/api';

const storageUrl = (path) =>
  path ? (path.startsWith('http') ? path : `${SGSST_URL}/storage/${path}`) : null;

export default function Parametros({ profile, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    trabajadores: '',
    nivel_riesgo: '',
    codigo_ciiu: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    email: '',
    sitio_web: '',
    arl_nombre: '',
    arl_nit: '',
    arl_telefono: '',
    arl_direccion: '',
    rep_legal_nombre: '',
    rep_legal_cedula: '',
    rep_legal_cargo: '',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [firmaPreview, setFirmaPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFirma, setUploadingFirma] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profile) return;
    setFormData({
      nombre: profile.nombre || '',
      trabajadores: profile.trabajadores || '',
      nivel_riesgo: profile.nivel_riesgo || '',
      codigo_ciiu: profile.codigo_ciiu || '',
      direccion: profile.direccion || '',
      ciudad: profile.ciudad || '',
      telefono: profile.telefono || '',
      email: profile.email || '',
      sitio_web: profile.sitio_web || '',
      arl_nombre: profile.arl_nombre || '',
      arl_nit: profile.arl_nit || '',
      arl_telefono: profile.arl_telefono || '',
      arl_direccion: profile.arl_direccion || '',
      rep_legal_nombre: profile.rep_legal_nombre || '',
      rep_legal_cedula: profile.rep_legal_cedula || '',
      rep_legal_cargo: profile.rep_legal_cargo || '',
    });
    setLogoPreview(storageUrl(profile.logo_url));
    setFirmaPreview(storageUrl(profile.rep_legal_firma_url));
  }, [profile]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api(`/empresas/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        showMessage('Configuración guardada correctamente');
        if (onSave) onSave(updated);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || 'Error al guardar los cambios');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile?.id) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes PNG, JPG o WEBP');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo debe ser menor a 2MB');
      return;
    }

    setUploadingLogo(true);
    setError(null);
    const fd = new FormData();
    fd.append('logo', file);

    try {
      const res = await apiForm(`/empresas/${profile.id}/logo`, { method: 'POST', body: fd });
      if (res.ok) {
        const updated = await res.json();
        const url = storageUrl(updated.logo_url);
        setLogoPreview(url);
        showMessage('Logo actualizado correctamente');
        if (onSave) onSave(updated);
      } else {
        setError('Error al subir el logo');
      }
    } catch {
      setError('Error de conexión al subir el logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFirmaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile?.id) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes PNG, JPG, WEBP o PDF');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo debe ser menor a 2MB');
      return;
    }

    setUploadingFirma(true);
    setError(null);
    const fd = new FormData();
    fd.append('firma', file);

    try {
      const res = await apiForm(`/empresas/${profile.id}/firma`, { method: 'POST', body: fd });
      if (res.ok) {
        const updated = await res.json();
        const url = storageUrl(updated.rep_legal_firma_url);
        setFirmaPreview(url);
        showMessage('Firma actualizada correctamente');
        if (onSave) onSave(updated);
      } else {
        setError('Error al subir la firma');
      }
    } catch {
      setError('Error de conexión al subir la firma');
    } finally {
      setUploadingFirma(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="bg-orange-100 p-3 rounded-xl mr-4">
          <Settings className="w-8 h-8 text-orange-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Parámetros del SG-SST</h2>
          <p className="text-gray-500 mt-1">Configuración general de la empresa y datos de terceros</p>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-700">
          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Datos de la Empresa ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Datos de la Empresa</h3>
                <p className="text-sm text-gray-500">Información general de la organización</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa *</label>
                <input type="text" name="nombre" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.nombre} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº Trabajadores *</label>
                  <input type="number" name="trabajadores" required min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.trabajadores} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Riesgo *</label>
                  <select name="nivel_riesgo" required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.nivel_riesgo} onChange={handleInputChange}>
                    <option value="">Seleccione...</option>
                    <option value="I">Riesgo I</option>
                    <option value="II">Riesgo II</option>
                    <option value="III">Riesgo III</option>
                    <option value="IV">Riesgo IV</option>
                    <option value="V">Riesgo V</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código CIIU Principal *</label>
                <input type="text" name="codigo_ciiu" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.codigo_ciiu} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input type="text" name="direccion"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.direccion} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input type="text" name="ciudad"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.ciudad} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" name="telefono"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.telefono} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.email} onChange={handleInputChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                <input type="url" name="sitio_web" placeholder="https://"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.sitio_web} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* ── Logo de la Empresa ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <Image className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Logo de la Empresa</h3>
                <p className="text-sm text-gray-500">Imagen institucional para documentos</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-full max-w-xs">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                  {logoPreview ? (
                    <div className="relative">
                      <img src={logoPreview} alt="Logo"
                        className="max-h-40 mx-auto rounded-lg object-contain" />
                      <button type="button" onClick={() => setLogoPreview(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6">
                      <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-2">Subir logo de la empresa</p>
                      <p className="text-xs text-gray-400">PNG, JPG o WEBP (máx. 2MB)</p>
                    </div>
                  )}

                  <label className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingLogo ? 'Subiendo...' : (logoPreview ? 'Cambiar Logo' : 'Seleccionar Archivo')}
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                </div>

                {logoPreview && (
                  <div className="mt-4 flex justify-center">
                    <a href={logoPreview} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                      <Eye className="w-4 h-4 mr-1" /> Ver
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Datos de la ARL ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Datos de la ARL</h3>
                <p className="text-sm text-gray-500">Administradora de Riesgos Laborales</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la ARL</label>
                <input type="text" name="arl_nombre" placeholder="Ej: PositivaARL, Sura, Liberty..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.arl_nombre} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
                  <input type="text" name="arl_nit"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.arl_nit} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" name="arl_telefono"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.arl_telefono} onChange={handleInputChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input type="text" name="arl_direccion"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.arl_direccion} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* ── Representante Legal ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Representante Legal</h3>
                <p className="text-sm text-gray-500">Firma para documentos oficiales</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" name="rep_legal_nombre"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.rep_legal_nombre} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cédula de Ciudadanía</label>
                  <input type="text" name="rep_legal_cedula"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.rep_legal_cedula} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input type="text" name="rep_legal_cargo" placeholder="Ej: Gerente General"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.rep_legal_cargo} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Firma */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Firma Digital o Escaneada</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                {firmaPreview ? (
                  <div className="relative inline-block">
                    <img src={firmaPreview} alt="Firma"
                      className="max-h-24 mx-auto rounded object-contain" />
                    <button type="button" onClick={() => setFirmaPreview(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Subir imagen o PDF de la firma</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP o PDF (máx. 2MB)</p>
                  </div>
                )}

                <label className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingFirma ? 'Subiendo...' : (firmaPreview ? 'Cambiar Firma' : 'Seleccionar Archivo')}
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                    className="hidden" onChange={handleFirmaUpload} disabled={uploadingFirma} />
                </label>

                {firmaPreview && (
                  <div className="mt-3">
                    <a href={firmaPreview} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700">
                      <Eye className="w-4 h-4 mr-1" /> Ver archivo completo
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={saving}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl flex items-center transition-colors shadow-sm">
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
