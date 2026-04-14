import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye, Trash2, Clock, Shield, X, AlertTriangle, CheckCircle, Wifi, WifiOff,
  User, Calendar, MapPin, Building, Activity, HeartPulse, ChevronLeft,
  ChevronRight, Search, PlusCircle, LayoutDashboard, Database, HardDrive,
  Globe, AlertCircle, FileText, ClipboardList, Info, ShieldCheck, Download,
  ShieldAlert, Save, Users
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';
const STORAGE_KEY_ACCIDENTES = 'sgsst_accidentes_offline';
const STORAGE_KEY_INVESTIGACIONES = 'sgsst_investigaciones_offline';

const ProfessionalDisclaimer = () => {
  const [show, setShow] = useState(() => {
    const hiddenUntil = localStorage.getItem('sgsst_disclaimer_hidden');
    return !hiddenUntil || Date.now() > parseInt(hiddenUntil);
  });

  if (!show) return null;

  const dismiss = () => {
    const sevenDays = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('sgsst_disclaimer_hidden', sevenDays.toString());
    setShow(false);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 mb-6 flex items-center justify-between group">
      <div className="flex items-center">
        <Shield className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
        <p className="text-xs text-gray-300 pr-4">
          <span className="text-yellow-400 font-bold">Aviso importante: </span>
          Esta plataforma es un apoyo para organizar su proceso mejor. <strong className="text-white">No es un reemplazo de un técnico, tecnólogo o profesional de SST con licencia.</strong> El cumplimiento legal requiere siempre la supervisión de personal calificado.
        </p>
      </div>
      <button 
        onClick={dismiss}
        className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
        title="Ocultar por 7 días"
      >
        <X size={16} />
      </button>
    </div>
  );
};


export default function Accidentalidad({ profile }) {
  const [view, setView] = useState('list'); // list, report, investigate, detail
  const [accidentes, setAccidentes] = useState([]);
  const [investigaciones, setInvestigaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [alertas, setAlertas] = useState([]);

  // Estado para el formulario de reporte
  const [formData, setFormData] = useState(getInitialFormData());
  const [saving, setSaving] = useState(false);

  // Estado para investigación
  const [investigacionActual, setInvestigacionActual] = useState(null);
  const [invFormData, setInvFormData] = useState(null);

  function getInitialFormData() {
    return {
      // Trabajador
      nombre_trabajador: '',
      documento_identidad: '',
      cargo: '',
      area: '',
      tipo_contrato: '',
      antiguedad: '',
      // Accidente
      fecha_evento: '',
      hora_evento: '',
      fecha_reporte: new Date().toISOString().split('T')[0],
      lugar_exacto: '',
      tipo_accidente: '',
      tipo_evento: 'Incidente',
      // Descripción
      descripcion: '',
      // Consecuencias
      tipo_lesion: '',
      parte_cuerpo: '',
      clasificacion_accidente: '',
      dias_incapacidad: 0,
      // Info adicional
      sucursal_id: '',
      testigos: [],
      jefe_inmediato: '',
      reportado_arl: false,
      fecha_reporte_arl: '',
      numero_radicado_arl: '',
    };
  }

  // Monitorear conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar datos
  useEffect(() => {
    if (profile?.id) {
      loadLocalData();
      fetchSucursales();
      fetchAccidentes();
      fetchInvestigaciones();
      fetchAlertas();
    }
  }, [profile?.id]);

  // Auto-sync
  useEffect(() => {
    if (isOnline && pendingSync > 0) {
      syncPendingData();
    }
  }, [isOnline]);

  const loadLocalData = useCallback(() => {
    try {
      const storedAcc = localStorage.getItem(STORAGE_KEY_ACCIDENTES);
      const storedInv = localStorage.getItem(STORAGE_KEY_INVESTIGACIONES);
      if (storedAcc) setPendingSync(JSON.parse(storedAcc).filter(a => !a.synced).length);
    } catch (e) {
      console.error('Error:', e);
    }
  }, []);

  const saveLocally = (data, type = 'accidente') => {
    const key = type === 'accidente' ? STORAGE_KEY_ACCIDENTES : STORAGE_KEY_INVESTIGACIONES;
    try {
      const stored = localStorage.getItem(key);
      const localData = stored ? JSON.parse(stored) : [];
      const newItem = { ...data, id: `${type}_${Date.now()}`, synced: false, localCreatedAt: new Date().toISOString() };
      localData.push(newItem);
      localStorage.setItem(key, JSON.stringify(localData));
      setPendingSync(prev => prev + 1);
      return newItem;
    } catch (e) {
      console.error('Error guardando:', e);
      throw e;
    }
  };

  const fetchSucursales = async () => {
    if (!profile?.id) return;
    try {
      const res = await fetch(`${API_BASE}/empresas/${profile.id}/sucursales`);
      if (res.ok) setSucursales(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchAccidentes = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/empresas/${profile.id}/accidentes`);
      if (res.ok) {
        const data = await res.json();
        setAccidentes(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestigaciones = async () => {
    if (!profile?.id) return;
    try {
      const res = await fetch(`${API_BASE}/empresas/${profile.id}/investigaciones`);
      if (res.ok) {
        const data = await res.json();
        setInvestigaciones(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAlertas = async () => {
    if (!profile?.id) return;
    try {
      const res = await fetch(`${API_BASE}/empresas/${profile.id}/investigaciones/alertas`);
      if (res.ok) setAlertas(await res.json());
    } catch (e) { console.error(e); }
  };

  const syncPendingData = async () => {
    // Implementar sync si es necesario
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTestigoChange = (index, field, value) => {
    const newTestigos = [...formData.testigos];
    newTestigos[index] = { ...newTestigos[index], [field]: value };
    setFormData(prev => ({ ...prev, testigos: newTestigos }));
  };

  const addTestigo = () => {
    setFormData(prev => ({
      ...prev,
      testigos: [...prev.testigos, { nombre: '', contacto: '', testimonio: '' }]
    }));
  };

  const removeTestigo = (index) => {
    const newTestigos = formData.testigos.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, testigos: newTestigos }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validación Manual (para evitar bloqueos visuales mudos del navegador)
    if (!formData.nombre_trabajador || !formData.documento_identidad || !formData.cargo || !formData.fecha_evento || !formData.tipo_evento || !formData.descripcion) {
      setErrorMessage("Por favor complete todos los campos obligatorios (*).");
      return;
    }

    if (!profile?.id) {
      setErrorMessage('Error: No hay empresa asociada.');
      return;
    }

    setSaving(true);

    const accidenteData = {
      empresa_id: profile.id,
      ...formData,
      testigos: formData.testigos.length > 0 ? formData.testigos : null,
    };

    try {
      if (isOnline) {
        const res = await fetch(`${API_BASE}/empresas/accidentes`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify(accidenteData)
        });

        if (res.ok) {
          const saved = await res.json();
          setAccidentes(prev => [saved, ...prev]);
          setSuccessMessage('Accidente reportado correctamente.');
          setView('list');
          setFormData(getInitialFormData());
        } else {
          try {
            const err = await res.json();
            throw new Error(err.message || 'La validación del servidor falló');
          } catch(e) {
            throw new Error("El servidor respondió con un formato incorrecto y el registro falló.");
          }
        }
      } else {
        const local = saveLocally(accidenteData, 'accidente');
        setAccidentes(prev => [local, ...prev]);
        setSuccessMessage('Guardado localmente. Se sincronizará cuando haya conexión.');
        setView('list');
        setFormData(getInitialFormData());
      }
    } catch (error) {
      try {
        const local = saveLocally(accidenteData, 'accidente');
        setAccidentes(prev => [local, ...prev]);
        setSuccessMessage('Guardado localmente. Error: ' + error.message);
        setView('list');
        setFormData(getInitialFormData());
      } catch (localError) {
        setErrorMessage('Error al guardar: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const iniciarInvestigacion = async (accidente) => {
    if (!isOnline) {
      setErrorMessage('Se necesita conexión para iniciar una investigación.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/investigaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accidente_id: accidente.id,
          empresa_id: profile.id
        })
      });
      if (res.ok) {
        const inv = await res.json();
        setInvestigaciones(prev => [...prev, inv]);
        setInvestigacionActual(inv);
        setInvFormData({
          ...getInitialInvFormData(),
          secuencia_hechos: accidente.descripcion || '',
        });
        setView('investigate');
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Error al iniciar investigación.');
    }
  };

  function getInitialInvFormData() {
    return {
      responsable_sst: '',
      jefe_inmediato_investigador: '',
      incluye_copasst: false,
      metodologia: '5 Porqués',
      secuencia_hechos: '',
      causas_inmediatas_actos: [],
      causas_inmediatas_condiciones: [],
      causas_basicas_personales: [],
      causas_basicas_trabajo: [],
      acciones_correctivas: [],
      acciones_preventivas: [],
    };
  }

  const addCausa = (field) => {
    setInvFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeCausa = (field, index) => {
    setInvFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateCausa = (field, index, value) => {
    setInvFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addAccion = (field) => {
    setInvFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { descripcion: '', responsable: '', fecha_ejecucion: '', estado: 'Abierta' }]
    }));
  };

  const removeAccion = (field, index) => {
    setInvFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateAccionItem = (field, index, itemField, value) => {
    setInvFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, [itemField]: value } : item)
    }));
  };

  const guardarInvestigacion = async () => {
    if (!investigacionActual) return;

    try {
      const res = await fetch(`${API_BASE}/investigaciones/${investigacionActual.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invFormData,
          estado: 'En Proceso',
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setInvestigacionActual(updated);
        setSuccessMessage('Investigación guardada. Puede continuar editando o cerrarla.');
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Error al guardar.');
    }
  };

  const cerrarInvestigacion = async () => {
    if (!investigacionActual) return;

    try {
      const res = await fetch(`${API_BASE}/investigaciones/${investigacionActual.id}/cerrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eficacia_verificada: false })
      });

      if (res.ok) {
        const closed = await res.json();
        setInvestigacionActual(closed);
        setInvestigaciones(prev => prev.map(i => i.id === closed.id ? closed : i));
        setView('list');
        fetchAccidentes();
        setSuccessMessage('Investigación cerrada correctamente.');
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Error al cerrar.');
    }
  };

  const getStatusColor = (tipo) => {
    switch (tipo) {
      case 'Enfermedad Laboral': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Accidente Grave':
      case 'Mortal': return 'bg-red-100 text-red-700 border-red-200';
      case 'Accidente Leve': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Incidente': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Reportado': return 'bg-blue-100 text-blue-700';
      case 'Investigacion': return 'bg-yellow-100 text-yellow-700';
      case 'Cerrado': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalEventos = accidentes.length;
  const totalGraves = accidentes.filter(a => a.tipo_evento === 'Accidente Grave' || a.tipo_evento === 'Mortal').length;
  const diasPerdidos = accidentes.reduce((sum, current) => sum + (current.dias_incapacidad || 0), 0);
  const investigacionesPendientes = investigaciones.filter(i => i.estado !== 'Cerrado').length;

  // Vista de formulario de reporte
    if (view === 'report') {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50 h-full">
        <div className="max-w-4xl mx-auto">
          
          {/* ── DESCARGO DE RESPONSABILIDAD ───────────────────────────────── */}
          <ProfessionalDisclaimer />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-red-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center">
                <ShieldAlert className="w-6 h-6 mr-2" />
                Reporte de Accidente / Incidente
              </h2>
              <button onClick={() => setView('list')} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            {errorMessage && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-red-800">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Sección: Información del Trabajador */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-400" />
                  1. Información del Trabajador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                    <input type="text" name="nombre_trabajador" required value={formData.nombre_trabajador} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad *</label>
                    <input type="text" name="documento_identidad" required value={formData.documento_identidad} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                    <input type="text" name="cargo" required value={formData.cargo} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                    <input type="text" name="area" value={formData.area} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
                    <select name="tipo_contrato" value={formData.tipo_contrato} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                      <option value="">Seleccionar...</option>
                      <option value="Termino Fijo">Término Fijo</option>
                      <option value="Termino Indefinido">Término Indefinido</option>
                      <option value="Obra Labor">Obra Labor</option>
                      <option value="Aprendizaje">Aprendizaje</option>
                      <option value="Temporal">Temporal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Antigüedad</label>
                    <input type="text" name="antiguedad" value={formData.antiguedad} onChange={handleInputChange}
                      placeholder="Ej. 2 años"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                </div>
              </section>

              {/* Sección: Datos del Accidente */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                  2. Datos del Accidente / Incidente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Evento *</label>
                    <input type="date" name="fecha_evento" required value={formData.fecha_evento} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora del Evento</label>
                    <input type="time" name="hora_evento" value={formData.hora_evento} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Reporte</label>
                    <input type="date" name="fecha_reporte" value={formData.fecha_reporte} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal / Ubicación</label>
                    <select name="sucursal_id" value={formData.sucursal_id} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                      <option value="">Principal / No especificado</option>
                      {sucursales.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} {s.ciudad ? `(${s.ciudad})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lugar Exacto</label>
                    <input type="text" name="lugar_exacto" value={formData.lugar_exacto} onChange={handleInputChange}
                      placeholder="Ej. Planta de producción, Área de ensamble"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento *</label>
                    <select name="tipo_evento" required value={formData.tipo_evento} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                      <option value="Incidente">Incidente (Casi accidente)</option>
                      <option value="Accidente Leve">Accidente Leve</option>
                      <option value="Accidente Grave">Accidente Grave</option>
                      <option value="Mortal">Mortal</option>
                      <option value="Enfermedad Laboral">Enfermedad Laboral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Accidente</label>
                    <select name="tipo_accidente" value={formData.tipo_accidente} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                      <option value="">Seleccionar...</option>
                      <option value="Caída de altura">Caída de altura</option>
                      <option value="Caída de mismo nivel">Caída de mismo nivel</option>
                      <option value="Golpe por objeto">Golpe por objeto</option>
                      <option value="Golpe contra objeto">Golpe contra objeto</option>
                      <option value="Atrapamiento">Atrapamiento</option>
                      <option value="Contacto con energía">Contacto con energía</option>
                      <option value="Contacto con sustancia peligrosa">Contacto con sustancia peligrosa</option>
                      <option value="Sobreesfuerzo">Sobreesfuerzo</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada de lo Ocurrido *</label>
                    <textarea name="descripcion" required value={formData.descripcion} onChange={handleInputChange} rows="4"
                      placeholder="Describa paso a paso cómo ocurrió el evento..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none" />
                  </div>
                </div>
              </section>

              {/* Sección: Consecuencias */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-gray-400" />
                  3. Consecuencias
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Lesión</label>
                    <select name="tipo_lesion" value={formData.tipo_lesion} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                      <option value="">Seleccionar...</option>
                      <option value="Herida cortante">Herida cortante</option>
                      <option value="Fractura">Fractura</option>
                      <option value="Contusión">Contusión</option>
                      <option value="Esguince">Esguince</option>
                      <option value="Quemadura">Quemadura</option>
                      <option value="Aplastamiento">Aplastamiento</option>
                      <option value="Amputación">Amputación</option>
                      <option value="Conmoción">Conmoción</option>
                      <option value="Intoxicación">Intoxicación</option>
                      <option value="Sin lesión">Sin lesión</option>
                      <option value="Otra">Otra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parte del Cuerpo Afectada</label>
                    <select name="parte_cuerpo" value={formData.parte_cuerpo} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                      <option value="">Seleccionar...</option>
                      <option value="Cabeza">Cabeza</option>
                      <option value="Ojos">Ojos</option>
                      <option value="Cuello">Cuello</option>
                      <option value="Hombro">Hombro</option>
                      <option value="Brazo">Brazo</option>
                      <option value="Codo">Codo</option>
                      <option value="Antebrazo">Antebrazo</option>
                      <option value="Mano">Mano</option>
                      <option value="Dedo">Dedo</option>
                      <option value="Torso">Torso</option>
                      <option value="Espalda">Espalda</option>
                      <option value="Rodilla">Rodilla</option>
                      <option value="Pierna">Pierna</option>
                      <option value="Pie">Pie</option>
                      <option value="Múltiples">Múltiples partes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clasificación del Accidente</label>
                    <select name="clasificacion_accidente" value={formData.clasificacion_accidente} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                      <option value="">Seleccionar...</option>
                      <option value="Leve">Leve</option>
                      <option value="Grave">Grave</option>
                      <option value="Mortales">Mortales</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Días de Incapacidad (si aplica)</label>
                    <input type="number" min="0" name="dias_incapacidad" value={formData.dias_incapacidad} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                </div>
              </section>

              {/* Sección: Información Adicional */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-400" />
                  4. Información Adicional
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jefe Inmediato</label>
                  <input type="text" name="jefe_inmediato" value={formData.jefe_inmediato} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input type="checkbox" name="reportado_arl" checked={formData.reportado_arl} onChange={handleInputChange}
                      className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Reportado a la ARL</span>
                  </label>
                </div>

                {formData.reportado_arl && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Reporte ARL</label>
                      <input type="date" name="fecha_reporte_arl" value={formData.fecha_reporte_arl} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No. Radicado ARL</label>
                      <input type="text" name="numero_radicado_arl" value={formData.numero_radicado_arl} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Testigos</label>
                    <button type="button" onClick={addTestigo}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <PlusCircle className="w-4 h-4 mr-1" /> Agregar testigo
                    </button>
                  </div>
                  {formData.testigos.map((testigo, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-3 bg-gray-50 rounded-xl">
                      <input type="text" placeholder="Nombre" value={testigo.nombre}
                        onChange={(e) => handleTestigoChange(index, 'nombre', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                      <input type="text" placeholder="Contacto" value={testigo.contacto}
                        onChange={(e) => handleTestigoChange(index, 'contacto', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                      <div className="flex gap-2">
                        <input type="text" placeholder="Testimonio" value={testigo.testimonio}
                          onChange={(e) => handleTestigoChange(index, 'testimonio', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                        <button type="button" onClick={() => removeTestigo(index)}
                          className="text-red-500 hover:text-red-700 px-2">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => setView('list')}
                  className="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold flex items-center hover:bg-red-700 transition-colors">
                  {saving ? 'Guardando...' : <><Save className="w-5 h-5 mr-2" /> {isOnline ? 'Guardar' : 'Guardar Localmente'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Vista de Investigación
  if (view === 'investigate' && investigacionActual && invFormData) {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50 h-full">
        <div className="max-w-7xl mx-auto">

          {/* ── DESCARGO DE RESPONSABILIDAD ───────────────────────────────── */}
          {(() => {
            const [showDisclaimer, setShowDisclaimer] = React.useState(() => {
              const hiddenUntil = localStorage.getItem('sgsst_disclaimer_hidden');
              return !hiddenUntil || Date.now() > parseInt(hiddenUntil);
            });

            if (!showDisclaimer) return null;

            const dismiss = () => {
              const sevenDays = Date.now() + (7 * 24 * 60 * 60 * 1000);
              localStorage.setItem('sgsst_disclaimer_hidden', sevenDays.toString());
              setShowDisclaimer(false);
            };

            return (
              <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 mb-6 flex items-center justify-between group">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                  <p className="text-xs text-gray-300 pr-4">
                    <span className="text-yellow-400 font-bold">Aviso profesional: </span>
                    Esta plataforma es un apoyo tecnológico para organizar su proceso. <strong className="text-white">No sustituye la gestión ni responsabilidades de un técnico, tecnólogo o profesional en SST con licencia vigente.</strong> El cumplimiento legal requiere la supervisión de personal calificado.
                  </p>
                </div>
                <button 
                  onClick={dismiss}
                  className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
                  title="Ocultar por 7 días"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })()}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-purple-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <ClipboardList className="w-6 h-6 mr-2" />
                  Investigación de Accidente
                </h2>
                <p className="text-purple-200 text-sm mt-1">
                  Resolución 1401 de 2007 — Plazo máximo: 15 días
                </p>
              </div>
              <button onClick={() => setView('list')} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            {errorMessage && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-red-800">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">{successMessage}</span>
              </div>
            )}

            <div className="p-6 space-y-8">
              {/* Info del accidente */}
              <section className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-bold text-gray-700 mb-2">Accidente en investigación:</h4>
                <p className="text-gray-600">
                  <strong>{investigacionActual.accidente?.nombre_trabajador}</strong> —
                  {investigacionActual.accidente?.fecha_evento}
                </p>
                <p className="text-sm text-gray-500 mt-1">{investigacionActual.accidente?.descripcion}</p>
                <div className="mt-2 flex gap-4">
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(investigacionActual.accidente?.tipo_evento)}`}>
                    {investigacionActual.accidente?.tipo_evento}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                    Límite: {new Date(investigacionActual.fecha_limite).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${investigacionActual.diasRestantes < 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {investigacionActual.diasRestantes < 0 ? `Vencido ${Math.abs(investigacionActual.diasRestantes)} días` : `${investigacionActual.diasRestantes} días restantes`}
                  </span>
                </div>
              </section>

              {/* Equipo investigador */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  1. Equipo Investigador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable SST</label>
                    <input type="text" value={invFormData.responsable_sst}
                      onChange={(e) => setInvFormData({ ...invFormData, responsable_sst: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jefe Inmediato</label>
                    <input type="text" value={invFormData.jefe_inmediato_investigador}
                      onChange={(e) => setInvFormData({ ...invFormData, jefe_inmediato_investigador: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center mb-2">
                    <input type="checkbox" checked={invFormData.incluye_copasst}
                      onChange={(e) => setInvFormData({ ...invFormData, incluye_copasst: e.target.checked })}
                      className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Incluye integrantes del COPASST</span>
                  </label>
                </div>
              </section>

              {/* Metodología */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  2. Metodología de Análisis
                </h3>
                <select value={invFormData.metodologia}
                  onChange={(e) => setInvFormData({ ...invFormData, metodologia: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none mb-4">
                  <option value="5 Porqués">5 Porqués</option>
                  <option value="Árbol de Causas">Árbol de Causas</option>
                  <option value="Ishikawa">Diagrama de Ishikawa</option>
                </select>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secuencia de Hechos (Descripción cronológica)</label>
                  <textarea value={invFormData.secuencia_hechos} rows="4"
                    onChange={(e) => setInvFormData({ ...invFormData, secuencia_hechos: e.target.value })}
                    placeholder="Describa paso a paso qué ocurrió..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                </div>
              </section>

              {/* Causas */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4">3. Identificación de Causas</h3>

                {/* Causas Inmediatas - Actos */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Causas Inmediatas — Actos Inseguros</h4>
                  {invFormData.causas_inmediatas_actos.map((causa, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={causa}
                        onChange={(e) => updateCausa('causas_inmediatas_actos', index, e.target.value)}
                        placeholder="Ej. No usó equipo de protección"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                      <button onClick={() => removeCausa('causas_inmediatas_actos', index)} className="text-red-500 hover:text-red-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addCausa('causas_inmediatas_actos')}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                    <PlusCircle className="w-4 h-4 mr-1" /> Agregar acto inseguro
                  </button>
                </div>

                {/* Causas Inmediatas - Condiciones */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Causas Inmediatas — Condiciones Inseguras</h4>
                  {invFormData.causas_inmediatas_condiciones.map((causa, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={causa}
                        onChange={(e) => updateCausa('causas_inmediatas_condiciones', index, e.target.value)}
                        placeholder="Ej. piso mojado sin señalización"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                      <button onClick={() => removeCausa('causas_inmediatas_condiciones', index)} className="text-red-500 hover:text-red-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addCausa('causas_inmediatas_condiciones')}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                    <PlusCircle className="w-4 h-4 mr-1" /> Agregar condición insegura
                  </button>
                </div>

                {/* Causas Básicas - Personales */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Causas Básicas — Factores Personales</h4>
                  {invFormData.causas_basicas_personales.map((causa, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={causa}
                        onChange={(e) => updateCausa('causas_basicas_personales', index, e.target.value)}
                        placeholder="Ej. Falta de capacitación, Fatiga"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                      <button onClick={() => removeCausa('causas_basicas_personales', index)} className="text-red-500 hover:text-red-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addCausa('causas_basicas_personales')}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                    <PlusCircle className="w-4 h-4 mr-1" /> Agregar factor personal
                  </button>
                </div>

                {/* Causas Básicas - Trabajo */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Causas Básicas — Factores del Trabajo</h4>
                  {invFormData.causas_basicas_trabajo.map((causa, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={causa}
                        onChange={(e) => updateCausa('causas_basicas_trabajo', index, e.target.value)}
                        placeholder="Ej. Mantenimiento deficiente, Procedimientos inadecuados"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                      <button onClick={() => removeCausa('causas_basicas_trabajo', index)} className="text-red-500 hover:text-red-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addCausa('causas_basicas_trabajo')}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                    <PlusCircle className="w-4 h-4 mr-1" /> Agregar factor del trabajo
                  </button>
                </div>
              </section>

              {/* Acciones Correctivas */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4">4. Acciones Correctivas</h3>
                {invFormData.acciones_correctivas.map((accion, index) => (
                  <div key={index} className="bg-orange-50 p-3 rounded-xl mb-2">
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={accion.descripcion}
                        onChange={(e) => updateAccionItem('acciones_correctivas', index, 'descripcion', e.target.value)}
                        placeholder="Descripción de la acción"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                      <button onClick={() => removeAccion('acciones_correctivas', index)} className="text-red-500 hover:text-red-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={accion.responsable}
                        onChange={(e) => updateAccionItem('acciones_correctivas', index, 'responsable', e.target.value)}
                        placeholder="Responsable"
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                      <input type="date" value={accion.fecha_ejecucion}
                        onChange={(e) => updateAccionItem('acciones_correctivas', index, 'fecha_ejecucion', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                  </div>
                ))}
                <button onClick={() => addAccion('acciones_correctivas')}
                  className="text-sm text-orange-600 hover:text-orange-800 flex items-center">
                  <PlusCircle className="w-4 h-4 mr-1" /> Agregar acción correctiva
                </button>
              </section>

              {/* Acciones Preventivas */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4">5. Acciones Preventivas</h3>
                {invFormData.acciones_preventivas.map((accion, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-xl mb-2">
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={accion.descripcion}
                        onChange={(e) => updateAccionItem('acciones_preventivas', index, 'descripcion', e.target.value)}
                        placeholder="Descripción de la acción"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      <button onClick={() => removeAccion('acciones_preventivas', index)} className="text-red-500 hover:text-red-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={accion.responsable}
                        onChange={(e) => updateAccionItem('acciones_preventivas', index, 'responsable', e.target.value)}
                        placeholder="Responsable"
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input type="date" value={accion.fecha_ejecucion}
                        onChange={(e) => updateAccionItem('acciones_preventivas', index, 'fecha_ejecucion', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                ))}
                <button onClick={() => addAccion('acciones_preventivas')}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  <PlusCircle className="w-4 h-4 mr-1" /> Agregar acción preventiva
                </button>
              </section>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button onClick={() => setView('list')}
                  className="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-medium">
                  Cancelar
                </button>
                <button onClick={guardarInvestigacion}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold flex items-center hover:bg-purple-700 transition-colors">
                  <Save className="w-5 h-5 mr-2" /> Guardar Avance
                </button>
                <button onClick={cerrarInvestigacion}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold flex items-center hover:bg-green-700 transition-colors">
                  <CheckCircle className="w-5 h-5 mr-2" /> Cerrar Investigación
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50 h-full">
      <div className="max-w-7xl mx-auto">

        {/* ── DESCARGO DE RESPONSABILIDAD ───────────────────────────────── */}
        <ProfessionalDisclaimer />

        {/* Barra de estado */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <WifiOff className="w-5 h-5 text-yellow-600 mr-3" />
            <span className="text-yellow-800 font-medium">Modo offline</span>
          </div>
          <span className="text-yellow-700 text-sm">{pendingSync} pendiente(s) de sincronizar</span>
        </div>
      )}

      {/* Alertas de investigación */}
      {alertas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <h4 className="font-bold text-red-800 flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alertas de Investigación
          </h4>
          {alertas.map((alerta, index) => (
            <div key={index} className="text-sm text-red-700 mb-1">
              <strong>{alerta.tipo}:</strong> {alerta.mensaje} — {alerta.trabajador}
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
          <span className="text-red-800">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center">
            <HeartPulse className="w-8 h-8 mr-3 text-red-500" /> Reporte de Accidentalidad (ATEL)
          </h2>
          <p className="text-gray-500 mt-1">Decreto 1072 de 2015 — Resolución 1401 de 2007</p>
        </div>
        <div className="flex items-center space-x-3">
          {isOnline && (
            <div className="flex items-center text-green-600 text-sm">
              <Wifi className="w-4 h-4 mr-1" />
              Conectado
            </div>
          )}
          <button
            onClick={() => setView('report')}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-md transition-all"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Reportar Evento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mr-4">
            <Activity className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Eventos</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalEventos}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mr-4">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Accidentes Graves/Mortales</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalGraves}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mr-4">
            <Calendar className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Días Perdidos</p>
            <h3 className="text-2xl font-bold text-gray-800">{diasPerdidos}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
          <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mr-4">
            <ClipboardList className="w-7 h-7 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Investigaciones</p>
            <h3 className="text-2xl font-bold text-gray-800">{investigacionesPendientes}</h3>
          </div>
        </div>
      </div>

      {/* Lista de Accidentes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Eventos Registrados</h3>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : accidentes.length === 0 ? (
          <div className="text-center py-20 bg-gray-50">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Cero Accidentes</h3>
            <p className="text-gray-500">Sin eventos registrados hasta el momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-bold">Trabajador</th>
                  <th className="px-6 py-4 font-bold">Tipo</th>
                  <th className="px-6 py-4 font-bold">Fecha</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 font-bold">Investigación</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accidentes.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-800 block">{acc.nombre_trabajador}</span>
                      <span className="text-xs text-gray-500 block">{acc.documento_identidad}</span>
                      <span className="text-xs text-blue-500 block">{acc.cargo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(acc.tipo_evento)}`}>
                        {acc.tipo_evento}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 block">{acc.fecha_evento}</span>
                      {acc.hora_evento && <span className="text-xs text-gray-500">{acc.hora_evento}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getEstadoColor(acc.estado)}`}>
                        {acc.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {acc.investigacion ? (
                        <span className="text-sm text-purple-600 font-medium flex items-center">
                          <ClipboardList className="w-4 h-4 mr-1" />
                          {acc.investigacion.estado}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Sin iniciar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            if (acc.investigacion) {
                              setInvestigacionActual(acc.investigacion);
                              setInvFormData({
                                responsable_sst: acc.investigacion.responsable_sst || '',
                                jefe_inmediato_investigador: acc.investigacion.jefe_inmediato_investigador || '',
                                incluye_copasst: acc.investigacion.incluye_copasst || false,
                                metodologia: acc.investigacion.metodologia || '5 Porqués',
                                secuencia_hechos: acc.investigacion.secuencia_hechos || '',
                                causas_inmediatas_actos: acc.investigacion.causas_inmediatas_actos || [],
                                causas_inmediatas_condiciones: acc.investigacion.causas_inmediatas_condiciones || [],
                                causas_basicas_personales: acc.investigacion.causas_basicas_personales || [],
                                causas_basicas_trabajo: acc.investigacion.causas_basicas_trabajo || [],
                                acciones_correctivas: acc.investigacion.acciones_correctivas || [],
                                acciones_preventivas: acc.investigacion.acciones_preventivas || [],
                              });
                              setView('investigate');
                            } else {
                              iniciarInvestigacion(acc);
                            }
                          }}
                          className="px-3 py-2 text-purple-600 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-600 hover:text-white transition-colors text-sm font-medium flex items-center"
                        >
                          {acc.investigacion ? <Eye className="w-4 h-4 mr-1" /> : <ClipboardList className="w-4 h-4 mr-1" />}
                          {acc.investigacion ? 'Ver' : 'Investigar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
