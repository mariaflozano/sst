import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  BarChart3, 
  ChevronRight, 
  UserPlus, 
  Trash2, 
  Edit3, 
  ClipboardList, 
  ShieldCheck, 
  AlertTriangle,
  X,
  Save,
  ArrowRight,
  BookOpen,
  PieChart as PieChartIcon,
  ShieldAlert,
  Flame,
  Stethoscope,
  MoveHorizontal,
  ChevronLeft,
  Link as LinkIcon,
  BellRing,
  Play,
  FileCheck,
  Maximize2,
  ExternalLink,
  Upload,
  FileUp
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';
const STORAGE_KEY_PROGRAMA = 'sgsst_programa_capacitacion'; // Para migración inicial
const STORAGE_KEY_WIZARD_STEP = 'sgsst_capacitaciones_step';
const STORAGE_KEY_HAZARDS = 'sgsst_capacitaciones_hazards';
const STORAGE_KEY_THREATS = 'sgsst_capacitaciones_threats';

// --- INTELIGENCIA DE MAPEO ---
const HAZARD_MAP = {
  'Biomecánico': { themes: [{ name: 'Higiene Postural y Escuela de Espalda', type: 'Interna', recommend: 'Fisioterapeuta ARL/IPS' }, { name: 'Manejo Manual de Cargas (GTC 45)', type: 'Interna', recommend: 'Personal SST' }] },
  'Psicosocial': { themes: [{ name: 'Prevención del Estrés Laboral y Burnout', type: 'Interna', recommend: 'Psicólogo Especialista SST' }, { name: 'Liderazgo y Relaciones Interpersonales', type: 'Interna', recommend: 'Bienestar / ARL' }] },
  'Biológico': { themes: [{ name: 'Riesgo Biológico y Bioseguridad', type: 'Interna', recommend: 'Personal Salud / ARL' }, { name: 'Gestión Integral de Residuos (PGIR)', type: 'Interna', recommend: 'Gestor Ambiental' }] },
  'Alturas': { themes: [{ name: 'Trabajo Seguro en Alturas (Curso Certificado)', type: 'Externa', recommend: 'SENA / Centros Autorizados' }, { name: 'Reentrenamiento de Alturas', type: 'Externa', recommend: 'Entidad Certificada SENA' }] },
  'Mecánico': { themes: [{ name: 'Seguridad en el Uso de Herramientas y Máquinas', type: 'Interna', recommend: 'Mantenimiento / SST' }, { name: 'Bloqueo y Etiquetado (LOTO)', type: 'Interna', recommend: 'Ingeniería / ARL' }] },
  'Químico': { themes: [{ name: 'Manejo Seguro de Sustancias Químicas (SGA)', type: 'Interna', recommend: 'Químico / ARL' }, { name: 'Primer Respondiente en Derrames Químicos', type: 'Externa', recommend: 'Bomberos / ARL' }] },
  'Eléctrico': { themes: [{ name: 'Riesgo Eléctrico y Normatividad RETIE', type: 'Externa', recommend: 'Ingeniero Eléctrico / ARL' }] }
};

const THREAT_MAP = {
  'Incendio': { themes: [{ name: 'Brigada Contra Incendios (Extintores)', type: 'Externa', recommend: 'Bomberos / Defensa Civil' }] },
  'Sismo': { themes: [{ name: 'Simulacro de Evacuación', type: 'Interna', recommend: 'Comité Emergencias' }] },
  'Emergencia Médica': { themes: [{ name: 'Primeros Auxilios Básicos y RCP', type: 'Externa', recommend: 'Cruz Roja / Defensa Civil' }] }
};

const BASE_TRAININGS = ['Inducción en SST', 'Reinducción Anual', 'POLITICA Y OBJETIVOS SST', 'Comité COPASST', 'Comité Convivencia'];

export default function Capacitaciones({ profile }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [programa, setPrograma] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const fileInputRef = useRef(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showPDF, setShowPDF] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [dateField, setDateField] = useState('');
  const [timeField, setTimeField] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [selectedHazards, setSelectedHazards] = useState([]);
  const [selectedThreats, setSelectedThreats] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);

  // --- CARGA INICIAL DESDE DB ---
  useEffect(() => {
    if (profile?.id) {
      fetchCapacitaciones();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const fetchCapacitaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/empresas/${profile.id}/capacitaciones`);
      if (!response.ok) throw new Error('Backend offline');
      const data = await response.json();
      setPrograma(data);
      
      // Guardar en local como respaldo de la última versión del servidor
      localStorage.setItem(STORAGE_KEY_PROGRAMA, JSON.stringify(data));
      
      const hasSeenWizard = localStorage.getItem('sgsst_capacitaciones_initialized');
      if (data.length > 0) {
        setShowWizard(false);
        setHasInitialized(true);
        localStorage.setItem('sgsst_capacitaciones_initialized', 'true');
      } else if (hasSeenWizard === 'true') {
        setShowWizard(false);
      } else {
        setShowWizard(true);
      }
    } catch (err) {
      console.warn("API falló, usando respaldo local", err);
      // FALLBACK a LocalStorage si la API falla
      const savedProg = localStorage.getItem(STORAGE_KEY_PROGRAMA);
      if (savedProg) {
        const localData = JSON.parse(savedProg);
        setPrograma(localData);
        if (localData.length > 0) {
          setShowWizard(false);
          setHasInitialized(true);
        } else {
          const hasSeen = localStorage.getItem('sgsst_capacitaciones_initialized');
          setShowWizard(hasSeen !== 'true');
        }
      } else {
        setShowWizard(true);
      }
    } finally {
      // Cargar info del asistente siempre (esto es local)
      const savedHaz = localStorage.getItem(STORAGE_KEY_HAZARDS);
      const savedThr = localStorage.getItem(STORAGE_KEY_THREATS);
      const savedStep = localStorage.getItem(STORAGE_KEY_WIZARD_STEP);
      if (savedHaz) setSelectedHazards(JSON.parse(savedHaz));
      if (savedThr) setSelectedThreats(JSON.parse(savedThr));
      if (savedStep) setWizardStep(parseInt(savedStep));
      setLoading(false);
    }
  };

  const migrateLocalDataToDB = async (items) => {
    try {
      const payload = { 
        empresa_id: profile.id, 
        items: items.map(it => ({
            tema: it.tema,
            fuente: it.source || 'Importado',
            tipo: it.tipo || 'Interna',
            recomienda: it.recomienda || 'SST'
        })) 
      };
      await fetch(`${API_BASE}/capacitaciones/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      localStorage.removeItem(STORAGE_KEY_PROGRAMA);
      fetchCapacitaciones();
    } catch (err) {
      console.error("Error migrando datos", err);
    }
  };

  // Guardar estado del asistente localmente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HAZARDS, JSON.stringify(selectedHazards));
    localStorage.setItem(STORAGE_KEY_THREATS, JSON.stringify(selectedThreats));
    localStorage.setItem(STORAGE_KEY_WIZARD_STEP, wizardStep.toString());
  }, [selectedHazards, selectedThreats, wizardStep]);

  const trainingAlerts = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return programa.filter(p => p.fecha_programada && p.estado !== 'Ejecutado').map(p => {
       const progDate = new Date(p.fecha_programada);
       progDate.setHours(24,0,0,0);
       const diffDays = Math.ceil((progDate - today) / (1000 * 60 * 60 * 24));
       return { ...p, diffDays };
    }).filter(p => p.diffDays <= 2);
  }, [programa]);

  const handleOpenSchedule = (item) => {
    setSelectedItem(item);
    setDateField(item.fecha_programada || '');
    setTimeField(item.hora_programada || '08:00');
    setShowScheduleModal(true);
  };

  const saveSchedule = async () => {
    const updatedProg = programa.map(p => p.id === selectedItem.id ? { ...p, fecha_programada: dateField, hora_programada: timeField, estado: 'Programado' } : p);
    
    // Actualizar LOCAL primero para respuesta inmediata
    setPrograma(updatedProg);
    localStorage.setItem(STORAGE_KEY_PROGRAMA, JSON.stringify(updatedProg));
    setShowScheduleModal(false);

    try {
      const res = await fetch(`${API_BASE}/capacitaciones/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha_programada: dateField, hora_programada: timeField, estado: 'Programado' })
      });
      if (res.ok) {
        const data = await res.json();
        setPrograma(programa.map(p => p.id === selectedItem.id ? data : p));
      }
    } catch (err) { console.warn("Sync falló, se mantiene local"); }
  };

  const handleOpenExecute = (item) => {
    setSelectedItem(item);
    setDateField(new Date().toISOString().split('T')[0]);
    setEvidenceUrl(item.evidencia_url || '');
    setShowExecuteModal(true);
  };

  const saveExecution = async () => {
    const updatedProg = programa.map(p => p.id === selectedItem.id ? { ...p, estado: 'Ejecutado', fecha_ejecucion: dateField, evidencia_url: evidenceUrl } : p);
    
    // Local Update
    setPrograma(updatedProg);
    localStorage.setItem(STORAGE_KEY_PROGRAMA, JSON.stringify(updatedProg));
    setShowExecuteModal(false);

    try {
      if (evidenceUrl && !evidenceUrl.startsWith('blob:')) {
         await fetch(`${API_BASE}/capacitaciones/${selectedItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha_ejecucion: dateField, estado: 'Ejecutado', observaciones: evidenceUrl })
         });
      }
    } catch (err) { console.warn("Sync execution falló"); }
  };

  const generateSuggestions = () => {
    const pool = [];
    BASE_TRAININGS.forEach(t => pool.push({ tema: t, source: 'Base Obligatoria', type: 'Interna', recommend: 'SST Empresa', accepted: true }));
    selectedHazards.forEach(hazard => {
      HAZARD_MAP[hazard.id]?.themes.forEach(t => {
        pool.push({ tema: t.name, source: `Peligro: ${hazard.id}`, type: t.type, recommend: t.recommend, accepted: true });
      });
    });
    selectedThreats.forEach(tId => {
      THREAT_MAP[tId]?.themes.forEach(t => {
        pool.push({ tema: t.name, source: `Emergencia: ${tId}`, type: t.type, recommend: t.recommend, accepted: true });
      });
    });
    setSuggestedItems(pool);
  };

  const finalizeProgram = async () => {
    if (suggestedItems.filter(it => it.accepted).length === 0) {
      alert("Por favor selecciona al menos un tema");
      return;
    }

    // GENERACIÓN LOCAL INMEDIATA
    const newItems = suggestedItems.filter(it => it.accepted).map((item) => ({ 
      id: crypto.randomUUID(), 
      tema: item.tema, 
      estado: 'Programado', 
      fuente: item.source,
      tipo: item.type,
      recomienda: item.recommend
    }));
    
    setPrograma(newItems);
    localStorage.setItem(STORAGE_KEY_PROGRAMA, JSON.stringify(newItems));
    localStorage.setItem('sgsst_capacitaciones_initialized', 'true');
    setShowWizard(false);
    setActiveTab('program');

    try {
      const itemsToSync = newItems.map(it => ({
        tema: it.tema,
        fuente: it.fuente,
        tipo: it.tipo,
        recomienda: it.recomienda
      }));
      
      await fetch(`${API_BASE}/capacitaciones/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: profile.id, items: itemsToSync })
      });
      fetchCapacitaciones(); // Sync real post-save
    } catch (err) { console.warn("Error sync backend, se conserva local"); }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      const res = await fetch(`${API_BASE}/capacitaciones/${selectedItem.id}/upload-evidencia`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setEvidenceUrl(data.public_url);
    } catch (err) {
      alert("Error al subir archivo");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading && !showWizard) return <div className="h-full flex items-center justify-center font-black text-gray-300 uppercase tracking-tighter">Cargando Programa Maestro...</div>;

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50 h-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-6">
            <div className="bg-blue-600 p-4 rounded-[2rem] shadow-2xl"><GraduationCap className="w-10 h-10 text-white" /></div>
            <div>
               <h1 className="text-4xl font-black text-gray-800 tracking-tighter">Capacitaciones Smart</h1>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Conectado a Base de Datos Central</p>
            </div>
          </div>
          <div className="flex bg-white p-1 rounded-2xl shadow-sm">
            {[ {id: 'dashboard', label: 'Tablero'}, {id: 'program', label: 'Agenda Anual'} ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>{tab.label}</button>
            ))}
          </div>
        </div>

        {/* ALERT BANNERS */}
        <div className="space-y-3 mb-8">
          {trainingAlerts.map(alert => (
            <div key={alert.id} className="bg-red-600 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-4 transition-all">
               <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-2 rounded-xl"><BellRing className="w-6 h-6 animate-bounce" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-70">Alerta: {alert.diffDays === 0 ? 'Para Hoy' : alert.diffDays === 1 ? 'Para Mañana' : 'En 2 días'}</p>
                    <h5 className="text-lg font-black">{alert.tema} — {alert.hora_programada || '08:00 AM'}</h5>
                  </div>
               </div>
               <button onClick={() => handleOpenExecute(alert)} className="bg-white text-red-600 px-6 py-2.5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all">Ejecutar ✅</button>
            </div>
          ))}
        </div>

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center space-x-4 border-l-4 border-l-blue-500">
               <div className="bg-blue-50 p-4 rounded-2xl"><GraduationCap className="text-blue-600"/></div>
               <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Plan Maestro</p><h4 className="text-3xl font-black">{programa.length}</h4><p className="text-[10px] text-gray-300 font-bold">Temas Guardados</p></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center space-x-4 border-l-4 border-l-green-500">
               <div className="bg-green-50 p-4 rounded-2xl"><CheckCircle2 className="text-green-600"/></div>
               <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cumplimiento</p><h4 className="text-3xl font-black">{programa.filter(p => p.estado === 'Ejecutado').length}</h4><p className="text-[10px] text-gray-300 font-bold">En Tiempo Real</p></div>
            </div>
            <button 
              onClick={() => { setWizardStep(1); setShowWizard(true); }}
              className="bg-gray-800 p-6 rounded-3xl text-white flex items-center space-x-4 hover:bg-gray-700 transition-all border-l-4 border-l-purple-500 text-left shadow-xl shadow-gray-200/50"
            >
               <div className="bg-white/10 p-4 rounded-2xl"><ShieldCheck className="text-purple-400"/></div>
               <div><p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Configurar</p><h4 className="text-sm font-black leading-tight">Sync con Matriz</h4></div>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
             <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Cronograma de Capacitación (Base de Datos)</h3>
                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase">Res. 0312 Standard 1.2.1</span>
             </div>
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Fecha y Hora</th>
                    <th className="px-8 py-6">Tema / Fuente</th>
                    <th className="px-8 py-6">Evidencia Central</th>
                    <th className="px-8 py-6">Operación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {programa.map(p => (
                     <tr key={p.id} className={`hover:bg-gray-50/50 transition-all ${p.estado === 'Ejecutado' ? 'bg-green-50/10' : ''}`}>
                        <td className="px-8 py-6">
                           <div className={`w-3 h-3 rounded-full ${p.estado === 'Ejecutado' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-200'}`}></div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="text-sm font-black text-gray-800">{p.fecha_programada || 'SIN AGENDAR'}</div>
                           <div className="text-[10px] font-bold text-blue-600 flex items-center mt-1 uppercase"><Clock className="w-3 h-3 mr-1" /> {p.hora_programada || '08:00 AM'}</div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="text-sm font-black text-gray-800">{p.tema}</div>
                           <div className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter mt-1">{p.fuente} • {p.tipo}</div>
                        </td>
                        <td className="px-8 py-6">
                           {p.evidencia_url ? (
                             <button onClick={() => setShowPDF(p.evidencia_url.startsWith('http') ? p.evidencia_url : `http://localhost:8000/storage/${p.evidencia_url}`)} className="flex items-center text-blue-600 text-xs font-black hover:bg-blue-50 py-2 px-3 rounded-xl transition-all border border-blue-100">
                               <Maximize2 className="w-3 h-3 mr-2" /> Ver Soporte PDF
                             </button>
                           ) : <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Sin Evidencia</span>}
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex space-x-3">
                              {p.estado !== 'Ejecutado' && <button onClick={() => handleOpenSchedule(p)} className="p-3 bg-gray-100 text-gray-500 rounded-2xl hover:bg-white hover:shadow-md transition-all"><Calendar size={18}/></button>}
                              {p.estado !== 'Ejecutado' && <button onClick={() => handleOpenExecute(p)} className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center space-x-2"><Play size={14} fill="currentColor"/><span className="text-[10px] font-black uppercase">Ejecutar</span></button>}
                              <button onClick={async () => { 
                                if(window.confirm('¿Eliminar?')) { 
                                  await fetch(`${API_BASE}/capacitaciones/${p.id}`, { method: 'DELETE' }); 
                                  fetchCapacitaciones(); 
                                } 
                              }} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18}/></button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {/* MODAL EJECUCION */}
        {showExecuteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <div className="bg-white p-10 rounded-[3rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-8">
                  <div className="bg-green-100 w-16 h-16 rounded-3xl flex items-center justify-center"><FileCheck className="text-green-600 w-8 h-8" /></div>
                  <button onClick={() => setShowExecuteModal(false)} className="text-gray-400 hover:text-gray-600"><X/></button>
                </div>
                
                <h4 className="text-3xl font-black mb-2 tracking-tight">Cerrar Capacitación</h4>
                <p className="text-sm text-gray-400 mb-8 font-medium italic">Se guardará permanentemente en el servidor.</p>
                
                <div className="space-y-6 mb-10">
                   <div>
                     <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Fecha de Realización</label>
                     <input type="date" value={dateField} onChange={e => setDateField(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-100 transition-all" />
                   </div>
                   
                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-gray-400 block">Soporte de Evidencia</label>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                          <button 
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading}
                            className={`w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all group ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                          >
                             <FileUp className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                             <span className="text-[10px] font-black text-gray-500 group-hover:text-blue-600 uppercase tracking-widest">{isUploading ? 'Subiendo...' : 'SUBIR PDF (RECOMENDADO)'}</span>
                          </button>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <div className="h-32 p-4 bg-gray-50 border border-gray-100 rounded-3xl flex flex-col justify-center">
                             <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input placeholder="Link Externo..." value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs outline-none" />
                             </div>
                             <p className="text-[9px] text-gray-400 mt-2 text-center uppercase font-bold tracking-tighter">O pega un link de Drive</p>
                          </div>
                        </div>
                     </div>

                     {evidenceUrl && (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                           <div className="flex items-center space-x-3">
                              <ShieldCheck className="text-green-600 w-5 h-5" />
                              <span className="text-xs font-black text-green-800 uppercase tracking-tight">Documento Vinculado Correctamente</span>
                           </div>
                           <button onClick={() => setEvidenceUrl('')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                     )}
                   </div>
                </div>

                <div className="flex space-x-3">
                   <button onClick={() => setShowExecuteModal(false)} className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all">Cancelar</button>
                   <button onClick={saveExecution} disabled={!evidenceUrl || isUploading} className="flex-1 py-4 bg-green-600 text-white font-black rounded-[1.5rem] shadow-xl disabled:opacity-50">Guardar en Base de Datos</button>
                </div>
             </div>
          </div>
        )}

        {/* MODAL AGENDAR */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <h4 className="text-3xl font-black mb-10 tracking-tight">Agendar Fecha</h4>
                <div className="space-y-6 mb-12">
                   <div><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Fecha Programada</label><input type="date" value={dateField} onChange={e => setDateField(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" /></div>
                   <div><label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Hora de Inicio</label><input type="time" value={timeField} onChange={e => setTimeField(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" /></div>
                </div>
                <div className="flex space-x-3">
                   <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-4 text-gray-400 font-bold">Cancelar</button>
                   <button onClick={saveSchedule} className="flex-1 py-4 bg-gray-900 text-white font-black rounded-[1.5rem] shadow-xl">Guardar Turno</button>
                </div>
             </div>
          </div>
        )}

        {showPDF && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-6">
             <div className="w-full max-w-6xl h-full flex flex-col bg-white rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                   <div className="flex items-center space-x-4"><ShieldCheck className="text-blue-400" /><h4 className="text-xl font-black tracking-tighter uppercase">Visor de Evidencia (Servidor)</h4></div>
                   <button onClick={() => setShowPDF(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X/></button>
                </div>
                <div className="flex-1 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                   <iframe src={showPDF} className="w-full h-full border-none" title="SST PDF VIEWER" />
                </div>
             </div>
          </div>
        )}

        {/* WIZARD */}
        {showWizard && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[300] flex items-center justify-center p-4">
             <div className="bg-white rounded-[3.5rem] max-w-4xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="bg-gray-900 p-12 text-white flex justify-between items-start">
                   <div><h3 className="text-4xl font-black leading-none mb-3 tracking-tighter">Plan Maestro Capacitación</h3><p className="text-gray-500 text-xs font-black uppercase tracking-widest">Paso {wizardStep} / 3 — Inteligencia de Riesgos</p></div>
                   <button onClick={() => { setShowWizard(false); localStorage.setItem('sgsst_capacitaciones_initialized', 'true'); }} className="p-3 bg-white/5 rounded-full hover:bg-white/10"><X/></button>
                </div>
                <div className="p-12 overflow-y-auto flex-1 bg-white">
                   {wizardStep === 1 ? (
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.keys(HAZARD_MAP).map(h => (
                          <button key={h} onClick={() => setSelectedHazards(p => p.find(sh => sh.id === h) ? p.filter(it => it.id !== h) : [...p, {id: h, level: 'Medio'}])} 
                                  className={`p-6 rounded-[2.5rem] border-2 text-left transition-all ${selectedHazards.find(sh => sh.id === h) ? 'border-blue-600 bg-blue-50 shadow-2xl scale-[1.02]' : 'border-gray-50 bg-gray-50 hover:bg-white hover:border-gray-100'}`}>
                            <div className={`w-8 h-8 rounded-full mb-3 flex items-center justify-center ${selectedHazards.find(sh => sh.id === h) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}><ShieldAlert size={16}/></div>
                            <div className="font-black text-gray-800 text-sm mb-1">{h}</div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cruzar con Matriz</p>
                          </button>
                        ))}
                     </div>
                   ) : wizardStep === 2 ? (
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.keys(THREAT_MAP).map(t => (
                          <button key={t} onClick={() => setSelectedThreats(p => p.includes(t) ? p.filter(it => it !== t) : [...p, t])}
                                  className={`p-6 rounded-[2.5rem] border-2 text-left transition-all ${selectedThreats.includes(t) ? 'border-orange-600 bg-orange-50 shadow-2xl scale-[1.02]' : 'border-gray-50 bg-gray-50 hover:bg-white hover:border-gray-100'}`}>
                             <div className={`w-8 h-8 rounded-full mb-3 flex items-center justify-center ${selectedThreats.includes(t) ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}><Flame size={16}/></div>
                             <div className="font-black text-gray-800 text-sm mb-1">{t}</div>
                             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Emergencia Crítica</p>
                          </button>
                        ))}
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {suggestedItems.map((item, idx) => (
                          <div key={idx} className="p-6 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                             <div className="flex space-x-5 items-center">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 border border-blue-100 text-lg">{idx+1}</div>
                                <div><div className="text-md font-black text-gray-800">{item.tema}</div><div className="flex items-center space-x-2 mt-1"><span className="text-[10px] font-black text-blue-500 uppercase">{item.source}</span><span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.type === 'Externa' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>{item.type}</span></div></div>
                             </div>
                             <input type="checkbox" checked={item.accepted} onChange={() => setSuggestedItems(it => it.map((s, i) => i === idx ? {...s, accepted: !s.accepted} : s))} className="w-8 h-8 rounded-xl text-blue-600 accent-blue-600 cursor-pointer" />
                          </div>
                        ))}
                     </div>
                   )}
                </div>
                <div className="p-10 bg-gray-50 flex justify-between items-center px-12">
                   <button onClick={() => setWizardStep(p => p - 1)} disabled={wizardStep === 1} className="font-black text-gray-400 disabled:opacity-0 flex items-center px-6 py-4 hover:text-gray-600 transition-colors"><ChevronLeft className="mr-2" /> Paso Anterior</button>
                   {wizardStep < 3 ? (
                     <button onClick={() => { if(wizardStep === 2) generateSuggestions(); setWizardStep(p => p + 1); }} className="px-12 py-5 bg-gray-900 text-white font-black rounded-3xl shadow-2xl flex items-center group">Siguiente Nivel <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" /></button>
                   ) : (
                     <button onClick={finalizeProgram} className="px-12 py-5 bg-blue-600 text-white font-black rounded-3xl shadow-2xl flex items-center hover:bg-blue-700 transition-all">Construir Programa Maestro <Plus className="ml-2" /></button>
                   )}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
