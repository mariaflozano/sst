import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, FileText, Upload, Download, Search,
  ClipboardList, Activity, Eye, Settings, Trash2, X, AlertTriangle,
  Filter, FolderOpen, ShieldCheck, Info, FileCheck2, FileClock,
  FileX2, PieChart, FileSearch, AlertCircle, Bell,
} from 'lucide-react';

const etapas = [
  { id: 'planear', title: 'Planear', desc: 'Evaluación y Planificación', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50', borderColor: 'border-blue-500' },
  { id: 'hacer', title: 'Hacer', desc: 'Implementación Operativa', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50', borderColor: 'border-orange-500' },
  { id: 'verificar', title: 'Verificar', desc: 'Evaluación de Acción', icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50', borderColor: 'border-purple-500' },
  { id: 'actuar', title: 'Actuar', desc: 'Mejora Continua', icon: Settings, color: 'text-green-500', bg: 'bg-green-50', borderColor: 'border-green-500' },
];

const getInitialDocs = (standards) => {
  if (standards === 7) {
    return {
      planear: [
        { id: 1, name: 'Asignación de persona que diseña el SG-SST', status: 'pending', date: '--' },
        { id: 2, name: 'Afiliación al Sistema de Seguridad Social Integral', status: 'pending', date: '--' },
        { id: 3, name: 'Capacitación en SST', status: 'pending', date: '--' },
        { id: 4, name: 'Plan Anual de Trabajo', status: 'pending', date: '--' },
      ],
      hacer: [
        { id: 5, name: 'Evaluaciones Médicas Ocupacionales', status: 'pending', date: '--' },
        { id: 6, name: 'Identificación de Peligros y Evaluación de Riesgos (Matriz IPERC)', status: 'pending', date: '--' },
        { id: 7, name: 'Medidas de Prevención y Control frente a Peligros', status: 'pending', date: '--' },
      ],
      verificar: [], actuar: [],
    };
  } else if (standards === 21) {
    return {
      planear: [
        { id: 1, name: 'Política de SST y Objetivos', status: 'pending', date: '--' },
        { id: 2, name: 'Plan Anual de Trabajo y Capacitación', status: 'pending', date: '--' },
        { id: 3, name: 'Archivo y Retención Documental', status: 'pending', date: '--' },
        { id: 4, name: 'Acta de Rendición de Cuentas', status: 'pending', date: '--' },
        { id: 5, name: 'Matriz Legal actualizada', status: 'pending', date: '--' },
        { id: 6, name: 'Asignación de Responsabilidades', status: 'pending', date: '--' },
      ],
      hacer: [
        { id: 7, name: 'Descripción Sociodemográfica y Diagnóstico de Salud', status: 'pending', date: '--' },
        { id: 8, name: 'Actividades de Promoción y Prevención', status: 'pending', date: '--' },
        { id: 9, name: 'Conformación COPASST y Comité de Convivencia', status: 'pending', date: '--' },
        { id: 10, name: 'Entrega de EPP y Capacitación en su uso', status: 'pending', date: '--' },
        { id: 11, name: 'Plan de Prevención y Respuesta ante Emergencias', status: 'pending', date: '--' },
        { id: 12, name: 'Reporte de Accidentes y Enfermedades Laborales', status: 'pending', date: '--' },
        { id: 13, name: 'Investigación de Incidentes, Accidentes y Enfermedades', status: 'pending', date: '--' },
      ],
      verificar: [
        { id: 14, name: 'Revisiones por la Alta Dirección', status: 'pending', date: '--' },
        { id: 15, name: 'Inspecciones periódicas de Instalaciones y Equipos', status: 'pending', date: '--' },
        { id: 16, name: 'Mantenimiento de Instalaciones y Equipos', status: 'pending', date: '--' },
        { id: 17, name: 'Auditoría Anual', status: 'pending', date: '--' },
      ],
      actuar: [
        { id: 18, name: 'Acciones Preventivas y Correctivas', status: 'pending', date: '--' },
        { id: 19, name: 'Plan de Mejoramiento Continuo', status: 'pending', date: '--' },
        { id: 20, name: 'Indicadores de Estructura, Proceso y Resultado', status: 'pending', date: '--' },
        { id: 21, name: 'Conservación de los Documentos', status: 'pending', date: '--' },
      ],
    };
  } else {
    return {
      planear: [
        { id: 1, name: '1.1.1 Responsable del SG-SST', status: 'pending', date: '--' },
        { id: 2, name: '1.1.2 Responsabilidades en el SG-SST', status: 'pending', date: '--' },
        { id: 3, name: '1.1.3 Asignación de Recursos para el SG-SST', status: 'pending', date: '--' },
        { id: 4, name: '1.1.4 Afiliación al Sistema General de Riesgos Laborales', status: 'pending', date: '--' },
        { id: 5, name: '1.1.5 Pago de pensión trabajadores de alto riesgo', status: 'pending', date: '--' },
        { id: 6, name: '1.1.6 Conformación COPASST', status: 'pending', date: '--' },
        { id: 7, name: '1.1.7 Capacitación COPASST', status: 'pending', date: '--' },
        { id: 8, name: '1.1.8 Conformación Comité de Convivencia', status: 'pending', date: '--' },
        { id: 9, name: '1.2.1 Programa de capacitación anual', status: 'pending', date: '--' },
        { id: 10, name: '1.2.2 Inducción y reinducción en SST', status: 'pending', date: '--' },
        { id: 11, name: '1.2.3 Responsables de inducción y capacitación', status: 'pending', date: '--' },
        { id: 12, name: '2.1.1 Política de Seguridad y Salud en el Trabajo', status: 'pending', date: '--' },
        { id: 13, name: '2.2.1 Objetivos de SST', status: 'pending', date: '--' },
        { id: 14, name: '2.3.1 Evaluación Inicial del SG-SST', status: 'pending', date: '--' },
        { id: 15, name: '2.4.1 Plan Anual de Trabajo', status: 'pending', date: '--' },
        { id: 16, name: '2.5.1 Archivo y retención documental', status: 'pending', date: '--' },
        { id: 17, name: '2.6.1 Rendición de cuentas', status: 'pending', date: '--' },
        { id: 18, name: '2.7.1 Matriz de Requisitos Legales', status: 'pending', date: '--' },
        { id: 19, name: '2.8.1 Mecanismos de comunicación interna y externa', status: 'pending', date: '--' },
        { id: 20, name: '2.9.1 Identificación y evaluación de adquisiciones', status: 'pending', date: '--' },
        { id: 21, name: '2.10.1 Selección y evaluación de contratistas', status: 'pending', date: '--' },
        { id: 22, name: '2.11.1 Gestión del cambio', status: 'pending', date: '--' },
        { id: 23, name: '2.11.2 Plan de capacitación integral de emergencias', status: 'pending', date: '--' },
        { id: 24, name: '2.11.3 Procedimiento de auditorías previas a adquisiciones', status: 'pending', date: '--' },
      ],
      hacer: [
        { id: 25, name: '3.1.1 Descripción Sociodemográfica y Diagnóstico de Salud', status: 'pending', date: '--' },
        { id: 26, name: '3.1.2 Actividades de Promoción y Prevención', status: 'pending', date: '--' },
        { id: 27, name: '3.1.3 Evaluaciones médicas ocupacionales', status: 'pending', date: '--' },
        { id: 28, name: '3.1.4 Restricciones y recomendaciones médicas', status: 'pending', date: '--' },
        { id: 29, name: '3.1.5 Reporte de Accidentes y Enfermedades Laborales', status: 'pending', date: '--' },
        { id: 30, name: '3.1.6 Investigación de ATEL', status: 'pending', date: '--' },
        { id: 31, name: '3.1.7 Registro y Análisis Estadístico ATEL', status: 'pending', date: '--' },
        { id: 32, name: '3.1.8 Seguimiento de Ausentismo', status: 'pending', date: '--' },
        { id: 33, name: '3.1.9 Frecuencia de accidentalidad', status: 'pending', date: '--' },
        { id: 34, name: '3.1.10 Severidad de accidentalidad', status: 'pending', date: '--' },
        { id: 35, name: '3.1.11 Proporción de accidentes mortales', status: 'pending', date: '--' },
        { id: 36, name: '3.1.12 Prevalencia de enfermedad laboral', status: 'pending', date: '--' },
        { id: 37, name: '3.1.13 Incidencia de enfermedad laboral', status: 'pending', date: '--' },
        { id: 38, name: '4.1.1 Metodología de identificación de peligros (IPERC)', status: 'pending', date: '--' },
        { id: 39, name: '4.1.2 Identificación de peligros con participación', status: 'pending', date: '--' },
        { id: 40, name: '4.1.3 Identificación de sustancias carcinógenas', status: 'pending', date: '--' },
        { id: 41, name: '4.1.4 Mediciones ambientales', status: 'pending', date: '--' },
        { id: 42, name: '4.2.1 Medidas de prevención y control', status: 'pending', date: '--' },
        { id: 43, name: '4.2.2 Aplicación de medidas por parte de trabajadores', status: 'pending', date: '--' },
        { id: 44, name: '4.2.3 Inspecciones a instalaciones, máquinas y equipos', status: 'pending', date: '--' },
        { id: 45, name: '4.2.4 Mantenimiento preventivo y correctivo', status: 'pending', date: '--' },
        { id: 46, name: '4.2.5 Entrega de Elementos de Protección Personal (EPP)', status: 'pending', date: '--' },
        { id: 47, name: '5.1.1 Plan de Prevención, Preparación y Respuesta ante Emergencias', status: 'pending', date: '--' },
        { id: 48, name: '5.1.2 Conformación de Brigadas y simulacros', status: 'pending', date: '--' },
      ],
      verificar: [
        { id: 49, name: '6.1.1 Definición de Indicadores de estructura', status: 'pending', date: '--' },
        { id: 50, name: '6.1.1 Definición de Indicadores de proceso y resultado', status: 'pending', date: '--' },
        { id: 51, name: '6.1.2 Auditoría Anual del SG-SST', status: 'pending', date: '--' },
        { id: 52, name: '6.1.3 Alcance y planeación de la auditoría', status: 'pending', date: '--' },
        { id: 53, name: '6.1.4 Revisión por la Alta Dirección', status: 'pending', date: '--' },
      ],
      actuar: [
        { id: 54, name: '7.1.1 Definición de Acciones Preventivas y Correctivas', status: 'pending', date: '--' },
        { id: 55, name: '7.1.2 Acciones de mejora conforme a evaluación inicial', status: 'pending', date: '--' },
        { id: 56, name: '7.1.3 Acciones de mejora con base en investigaciones ATEL', status: 'pending', date: '--' },
        { id: 57, name: '7.1.4 Acciones de mejora con base en auditorías externas', status: 'pending', date: '--' },
        { id: 58, name: '7.1.5 Seguimiento al impacto de eficacia', status: 'pending', date: '--' },
        { id: 59, name: '7.1.6 Revisión gerencial de acciones', status: 'pending', date: '--' },
        { id: 60, name: '7.1.7 Consolidación del Plan de Mejoramiento Anual', status: 'pending', date: '--' },
      ],
    };
  }
};

// ─── localStorage para compartir estado PHVA con Evaluación Inicial ───────────
export const PHVA_STORAGE_KEY = (id) => `sgsst_phva_status_${id || 'demo'}`;

const loadPHVAStatus = (id) => {
  try { return JSON.parse(localStorage.getItem(PHVA_STORAGE_KEY(id)) || '{}'); }
  catch { return {}; }
};

const savePHVAStatus = (id, stdId, status) => {
  try {
    const current = loadPHVAStatus(id);
    current[stdId] = status;
    localStorage.setItem(PHVA_STORAGE_KEY(id), JSON.stringify(current));
  } catch { /* silent */ }
};

// ─── Leer diagnóstico anual desde localStorage ────────────────────────────────
const getDiagnosisRating = (empresaId, stdId) => {
  try {
    const raw = localStorage.getItem(`sgsst_evaluacion_${empresaId || 'demo'}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const years = Object.keys(data).map(Number).sort((a, b) => b - a);
    for (const yr of years) {
      const rating = data[yr]?.calificaciones?.[stdId];
      if (rating) return { rating, year: yr, estado: data[yr]?.estado };
    }
    return null;
  } catch { return null; }
};

// ─── Badge de calificación del diagnóstico (solo info, no editable aquí) ──────
const DiagnosisBadge = ({ empresaId, stdId }) => {
  const result = getDiagnosisRating(empresaId, stdId);
  if (!result) return (
    <span className="inline-flex items-center text-xs text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
      <FileSearch className="w-3 h-3 mr-1" /> Sin eval.
    </span>
  );
  const { rating, year } = result;
  const map = {
    cumple:    { label: 'Cumple',    cls: 'text-green-700 bg-green-50 border-green-200',  icon: '✅' },
    no_cumple: { label: 'No Cumple', cls: 'text-red-700 bg-red-50 border-red-200',        icon: '❌' },
    no_aplica: { label: 'No Aplica', cls: 'text-gray-600 bg-gray-100 border-gray-200',    icon: '➖' },
  };
  const cfg = map[rating] || map['no_aplica'];
  return (
    <span className={`inline-flex items-center text-xs font-semibold border px-2 py-0.5 rounded-full ${cfg.cls}`}
      title={`Evaluación Inicial ${year}`}>
      {cfg.icon} {cfg.label} <span className="ml-1 opacity-60">({year})</span>
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function PHVA({ profile }) {
  const stds = profile?.cantidad_estandares || 60;
  const empresaId = profile?.id;

  const [activeTab, setActiveTab] = useState('planear');
  const [docsData, setDocsData] = useState(getInitialDocs(stds));
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [filterMode, setFilterMode] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // ── Cargar progreso desde backend ─────────────────────────────────────────
  useEffect(() => {
    const fetchProgreso = async () => {
      if (!profile?.id) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/empresas/${profile.id}/progreso`);
        if (response.ok) {
          const progreso = await response.json();
          if (progreso.length > 0) {
            setDocsData(prev => {
              const newData = { ...prev };
              progreso.forEach(item => {
                Object.keys(newData).forEach(stage => {
                  newData[stage] = newData[stage].map(doc =>
                    doc.id === item.estandar_id
                      ? { ...doc, status: item.estado, date: item.fecha_registro || '--', evidencePath: item.url_evidencia }
                      : doc
                  );
                });
              });
              return newData;
            });
          }
        }
      } catch { /* backend opcional */ }
      finally { setLoading(false); }
    };
    fetchProgreso();
  }, [profile?.id]);

  // ── Subir evidencia ───────────────────────────────────────────────────────
  const handleFileSelected = async (e, docId) => {
    const file = e.target.files[0];
    if (!file || !profile?.id) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Solo se permiten documentos en formato PDF por motivos legales de la plataforma.');
      e.target.value = '';
      return;
    }

    setUploadingId(docId);
    const formData = new FormData();
    formData.append('empresa_id', profile.id);
    formData.append('estandar_id', docId);
    formData.append('archivo', file);

    try {
      const response = await fetch('http://localhost:8000/api/progreso-estandar/upload', {
        method: 'POST', body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setDocsData(prev => {
          const newData = { ...prev };
          Object.keys(newData).forEach(stage => {
            newData[stage] = newData[stage].map(doc =>
              doc.id === docId
                ? { ...doc, status: 'cumplido', date: data.fecha_registro, evidencePath: data.url_evidencia }
                : doc
            );
          });
          // Guardar en localStorage para que Evaluación Inicial lo lea
          savePHVAStatus(empresaId, docId, 'cumplido');
          return newData;
        });
      }
    } catch (err) { console.error('Error al subir archivo:', err); }
    finally { setUploadingId(null); }
  };

  // ── Eliminar evidencia ────────────────────────────────────────────────────
  const handleDeleteEvidence = async (docId) => {
    if (!profile?.id) return;
    if (!confirm('¿Estás seguro de eliminar esta evidencia? El estándar volverá a estado Pendiente.')) return;
    try {
      const response = await fetch('http://localhost:8000/api/progreso-estandar/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: profile.id, estandar_id: docId }),
      });
      if (response.ok) {
        setDocsData(prev => {
          const newData = { ...prev };
          Object.keys(newData).forEach(stage => {
            newData[stage] = newData[stage].map(doc =>
              doc.id === docId ? { ...doc, status: 'pendiente', date: '--', evidencePath: null } : doc
            );
          });
          savePHVAStatus(empresaId, docId, 'pendiente');
          return newData;
        });
      }
    } catch (err) { console.error('Error al eliminar evidencia:', err); }
  };

  // ── Calcula el informe de cumplimiento ────────────────────────────────────
  const calculateReport = () => {
    const allDocs = Object.values(docsData).flat();
    const total = allDocs.length;
    const uploaded = allDocs.filter(d => d.status === 'cumplido').length;
    const percentage = total === 0 ? 0 : Math.round((uploaded / total) * 100);
    let qualification = 'CRÍTICO (INACEPTABLE)';
    let action = 'Realizar y tener a disposición del Ministerio del Trabajo un Plan de Mejoramiento de inmediato.';
    let colorClass = 'text-red-700 bg-red-100 border-red-400';
    if (percentage > 85) {
      qualification = 'ACEPTABLE';
      action = 'Mantener la calificación y evidencia del sistema, e incluir acciones de mejora en el Plan de Trabajo Anual.';
      colorClass = 'text-green-700 bg-green-100 border-green-400';
    } else if (percentage > 60) {
      qualification = 'MODERADAMENTE ACEPTABLE';
      action = 'Remitir a la ARL el Plan de Mejoramiento a los seis (6) meses de haber realizado la autoevaluación inicial.';
      colorClass = 'text-yellow-700 bg-yellow-100 border-yellow-400';
    }
    return { total, uploaded, percentage, qualification, action, colorClass };
  };

  // ── Helper: ¿este estándar REQUIERE evidencia obligatoria? ────────────────
  // Sí cuando en Evaluación Inicial está "Cumple" pero NO hay PDF real cargado
  const needsEvidence = (doc) => {
    const diag = getDiagnosisRating(empresaId, doc.id);
    const tienePDFReal = doc.status === 'cumplido' && !!doc.evidencePath;
    return diag?.rating === 'cumple' && !tienePDFReal;
  };

  // ── Estadísticas ──────────────────────────────────────────────────────────
  const allDocs = Object.values(docsData).flat();
  const totalConEvidencia = allDocs.filter(d => d.status === 'cumplido').length;
  const totalDocs = allDocs.length;
  const pctEvidencia = totalDocs > 0 ? Math.round((totalConEvidencia / totalDocs) * 100) : 0;

  // Conteo GLOBAL de estándares obligatorios pendientes (Cumple + sin PDF)
  const totalObligatoriosPendientes = allDocs.filter(doc => needsEvidence(doc)).length;

  const getTabStats = (tabId) => {
    const docs = docsData[tabId] || [];
    const conEvidencia = docs.filter(d => d.status === 'cumplido').length;
    const obligatoriosPendientes = docs.filter(d => needsEvidence(d)).length;
    return { total: docs.length, conEvidencia, obligatoriosPendientes };
  };

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const getFilteredDocs = () => {
    let docs = docsData[activeTab] || [];
    if (searchTerm) docs = docs.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterMode === 'con_evidencia') return docs.filter(d => d.status === 'cumplido');
    if (filterMode === 'sin_evidencia') return docs.filter(d => d.status !== 'cumplido');
    if (filterMode === 'obligatorios') return docs.filter(d => needsEvidence(d));
    return docs;
  };

  const filteredDocs = getFilteredDocs();

  // ── Al cargar, set filtro automático si hay pendientes obligatorios ────────
  useEffect(() => {
    if (totalObligatoriosPendientes > 0 && filterMode === 'todos') {
      // No forzamos, pero el banner avisa
    }
  }, [totalObligatoriosPendientes]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto bg-gray-50">

      {/* ── ALERTA OBLIGATORIA GLOBAL — solo si hay pendientes ─────────────── */}
      {totalObligatoriosPendientes > 0 && (
        <div className="bg-red-600 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center text-white">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-bold text-sm">
                ⚠️ {totalObligatoriosPendientes} estándar{totalObligatoriosPendientes > 1 ? 'es' : ''} declarado{totalObligatoriosPendientes > 1 ? 's' : ''} como "Cumple" en la Evaluación Inicial {totalObligatoriosPendientes > 1 ? 'no tienen' : 'no tiene'} evidencia documental.
              </span>
              <p className="text-red-200 text-xs mt-0.5">
                Sin el soporte PDF, la empresa no puede demostrar cumplimiento ante una auditoría del Ministerio de Trabajo.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterMode('obligatorios')}
            className="flex-shrink-0 ml-4 px-4 py-2 bg-white text-red-700 font-bold text-sm rounded-lg hover:bg-red-50 transition"
          >
            Ver pendientes →
          </button>
        </div>
      )}

      {/* ── BANNER SUPERIOR ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center text-white text-sm">
          <FolderOpen className="w-4 h-4 mr-2 opacity-80" />
          <span className="font-semibold">Gestión Documental</span>
          <span className="mx-2 opacity-40">·</span>
          <span className="opacity-75">Carga continua de evidencias PDF — Distinto de la Evaluación Inicial</span>
        </div>
        <div className="text-white text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
          {totalConEvidencia}/{totalDocs} con soporte
        </div>
      </div>

      <div className="p-6">
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center mb-1">
              <FileCheck2 className="w-7 h-7 text-blue-700 mr-3" />
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Gestión Documental</h2>
              <span className="ml-3 text-sm font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">PHVA</span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5 ml-10">
              Carga y seguimiento de evidencias documentales — Proceso continuo durante el año
            </p>
          </div>
          <button
            onClick={() => setShowReport(true)}
            className="mt-4 md:mt-0 flex items-center px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm shadow-sm transition"
          >
            <PieChart className="w-4 h-4 mr-2" /> Informe de Cumplimiento
          </button>
        </div>

        {/* ── BANNER INFORMATIVO ───────────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-800 font-semibold text-sm">¿Cuál es la diferencia con la Evaluación Inicial?</p>
            <p className="text-blue-700 text-xs mt-1">
              La <strong>Evaluación Inicial</strong> declara si cumple (SÍ/NO). Este módulo es donde carga los <strong>documentos PDF</strong> que lo prueban.
              Todo estándar marcado <strong className="text-green-700">Cumple</strong> en la evaluación <strong>debe tener su evidencia cargada aquí</strong> — de lo contrario aparecerá como pendiente obligatorio.
            </p>
          </div>
        </div>

        {/* ── BARRA DE PROGRESO ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6">
            <div className="flex-1 w-full">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-700">Cobertura documental global</span>
                <span className={`text-sm font-bold ${pctEvidencia < 60 ? 'text-red-600' : pctEvidencia < 85 ? 'text-yellow-600' : 'text-green-600'}`}>{pctEvidencia}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${pctEvidencia < 60 ? 'bg-red-500' : pctEvidencia < 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${pctEvidencia}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{totalConEvidencia} de {totalDocs} estándares con soporte PDF cargado</p>
            </div>
            <div className="flex space-x-3 flex-shrink-0">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-green-50">
                <FileCheck2 className="w-4 h-4 text-green-600" />
                <div><p className="text-base font-bold text-green-700">{totalConEvidencia}</p><p className="text-xs text-gray-500">Con PDF</p></div>
              </div>
              {totalObligatoriosPendientes > 0 && (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 cursor-pointer" onClick={() => setFilterMode('obligatorios')}>
                  <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
                  <div><p className="text-base font-bold text-red-700">{totalObligatoriosPendientes}</p><p className="text-xs text-red-600 font-semibold">Obligatorios</p></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TABS PHVA ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {etapas.map(etapa => {
            const Icon = etapa.icon;
            const isActive = activeTab === etapa.id;
            const ts = getTabStats(etapa.id);
            const pct = ts.total > 0 ? Math.round((ts.conEvidencia / ts.total) * 100) : 0;
            return (
              <button key={etapa.id} onClick={() => setActiveTab(etapa.id)}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative ${isActive ? `${etapa.borderColor} shadow-lg bg-white -translate-y-0.5` : 'border-transparent bg-white shadow-sm hover:border-gray-200'}`}
              >
                {/* Badge de obligatorios pendientes */}
                {ts.obligatoriosPendientes > 0 && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none animate-pulse">
                    {ts.obligatoriosPendientes}
                  </span>
                )}
                <div className={`p-3 rounded-full mb-2 ${etapa.bg} ${etapa.color}`}><Icon size={22} /></div>
                <h3 className={`font-bold text-base ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>{etapa.title}</h3>
                <p className="text-xs text-center text-gray-500 mt-0.5">{etapa.desc}</p>
                {ts.total > 0 && (
                  <div className="mt-2 w-full">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${etapa.color.replace('text', 'bg')} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-1">{ts.conEvidencia}/{ts.total} con PDF</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TABLA DE DOCUMENTOS ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 space-y-3 md:space-y-0">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-400" />
              Evidencias: <span className={`ml-2 font-extrabold ${etapas.find(e => e.id === activeTab)?.color}`}>{etapas.find(e => e.id === activeTab)?.title}</span>
            </h3>
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {/* Filtros */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 space-x-1">
                <Filter className="w-3.5 h-3.5 text-gray-400 ml-1" />
                {[
                  { key: 'todos', label: 'Todos' },
                  { key: 'con_evidencia', label: '✅ Con PDF' },
                  { key: 'sin_evidencia', label: '⏳ Pendiente' },
                  { key: 'obligatorios', label: `🔴 Obligatorios (${totalObligatoriosPendientes})` },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilterMode(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterMode === f.key ? (f.key === 'obligatorios' ? 'bg-red-600 shadow text-white' : 'bg-white shadow text-blue-700') : 'text-gray-500 hover:text-gray-700'}`}
                  >{f.label}</button>
                ))}
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input type="text" placeholder="Buscar documento..."
                  className="w-52 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Sub-alerta cuando el filtro activo es 'obligatorios' */}
          {filterMode === 'obligatorios' && totalObligatoriosPendientes > 0 && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start">
              <Bell className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">
                <strong>Acción requerida:</strong> Estos estándares fueron declarados como "Cumple" en la Evaluación Inicial
                pero aún no tienen soporte documental cargado. Cargue el PDF correspondiente para cada uno.
              </p>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-3 rounded-tl-xl border-b border-gray-100 w-40">Evidencia</th>
                  <th className="px-5 py-3 border-b border-gray-100">Documento Requerido</th>
                  <th className="px-5 py-3 border-b border-gray-100 w-36">Eval. Inicial</th>
                  <th className="px-5 py-3 border-b border-gray-100 w-28">Fecha Carga</th>
                  <th className="px-5 py-3 rounded-tr-xl border-b border-gray-100 text-right w-52">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map(doc => {
                  const required = needsEvidence(doc);
                  return (
                    <tr key={doc.id}
                      className={`transition-colors group ${required ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' : 'hover:bg-gray-50'}`}
                    >
                      {/* Estado evidencia */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {required ? (
                          <span className="flex items-center text-red-700 bg-red-100 border border-red-300 px-3 py-1.5 rounded-full w-max text-xs font-bold animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Requerida
                          </span>
                        ) : doc.status === 'cumplido' ? (
                          <span className="flex items-center text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full w-max text-xs font-bold">
                            <FileCheck2 className="w-3.5 h-3.5 mr-1.5" /> Con PDF
                          </span>
                        ) : (
                          <span className="flex items-center text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full w-max text-xs font-bold">
                            <FileClock className="w-3.5 h-3.5 mr-1.5" /> Pendiente
                          </span>
                        )}
                      </td>

                      {/* Nombre */}
                      <td className={`px-5 py-4 font-semibold ${required ? 'text-red-900' : 'text-gray-800'}`}>
                        {required && <span className="inline-block mr-2 text-red-500">⚠️</span>}
                        {doc.name}
                      </td>

                      {/* Badge diagnóstico (readonly) */}
                      <td className="px-5 py-4">
                        <DiagnosisBadge empresaId={empresaId} stdId={doc.id} />
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-4 text-xs text-gray-500">{doc.date}</td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-90 group-hover:opacity-100 transition-opacity">

                          {/* ── CASO A: Tiene PDF real → Ver + Eliminar + Actualizar PDF ── */}
                          {doc.evidencePath && (
                            <>
                              <a href={`http://localhost:8000/api/evidencia/ver?path=${encodeURIComponent(doc.evidencePath)}&empresa_id=${profile?.id}`}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-xs font-semibold"
                                title="Ver PDF cargado"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                              </a>
                              <button onClick={() => handleDeleteEvidence(doc.id)}
                                className="inline-flex items-center px-2.5 py-1.5 text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                                title="Eliminar evidencia"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <label className={`inline-flex items-center px-3 py-1.5 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm cursor-pointer text-xs font-semibold ${uploadingId === doc.id ? 'opacity-50 cursor-wait' : ''}`}
                                title="Reemplazar el PDF actual"
                              >
                                <Upload className="w-3.5 h-3.5 mr-1.5" />
                                {uploadingId === doc.id ? 'Subiendo...' : 'Actualizar PDF'}
                                <input type="file" accept=".pdf" className="hidden" onChange={e => handleFileSelected(e, doc.id)} disabled={uploadingId !== null} />
                              </label>
                            </>
                          )}

                          {/* ── CASO B: Cumple en eval pero SIN PDF real → botón rojo obligatorio ── */}
                          {!doc.evidencePath && required && (
                            <label className={`inline-flex items-center px-4 py-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer text-xs font-bold ring-2 ring-red-300 ring-offset-1 ${uploadingId === doc.id ? 'opacity-50 cursor-wait' : ''}`}
                              title="OBLIGATORIO: Este estándar está marcado Cumple — debe adjuntar el soporte documental"
                            >
                              <Upload className="w-3.5 h-3.5 mr-1.5" />
                              {uploadingId === doc.id ? 'Subiendo...' : 'Anexe Documento ⚠️'}
                              <input type="file" accept=".pdf" className="hidden" onChange={e => handleFileSelected(e, doc.id)} disabled={uploadingId !== null} />
                            </label>
                          )}

                          {/* ── CASO C: Sin eval de cumple y sin PDF → botón azul normal ── */}
                          {!doc.evidencePath && !required && (
                            <label className={`inline-flex items-center px-3 py-1.5 text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-sm cursor-pointer text-xs font-semibold ${uploadingId === doc.id ? 'opacity-50 cursor-wait' : ''}`}
                              title="Cargar evidencia PDF"
                            >
                              <Upload className="w-3.5 h-3.5 mr-1.5" />
                              {uploadingId === doc.id ? 'Subiendo...' : 'Cargar PDF'}
                              <input type="file" accept=".pdf" className="hidden" onChange={e => handleFileSelected(e, doc.id)} disabled={uploadingId !== null} />
                            </label>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      <FileX2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      {filterMode === 'obligatorios'
                        ? '✅ ¡Excelente! No hay estándares "Cumple" sin evidencia en esta etapa.'
                        : searchTerm ? 'Sin resultados.' : 'No hay documentos para esta etapa.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center text-xs text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Solo se aceptan archivos PDF. Los estándares con <span className="text-red-600 font-semibold mx-1">⚠️ Requerida</span> son obligatorios según la Evaluación Inicial vigente.
          </div>
        </div>
      </div>

      {/* ═══ MODAL: Informe de cumplimiento ══════════════════════════════════ */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-600" /> Informe de Cumplimiento Documental — Res. 0312
              </h3>
              <button onClick={() => setShowReport(false)} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              {(() => {
                const report = calculateReport();
                return (
                  <div>
                    {/* Alerta en el informe si hay obligatorios pendientes */}
                    {totalObligatoriosPendientes > 0 && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-red-800">⚠️ {totalObligatoriosPendientes} estándares sin evidencia</p>
                          <p className="text-xs text-red-700 mt-0.5">
                            Estos estándares están marcados como "Cumple" pero no tienen PDF cargado. El porcentaje real de cumplimiento demostrable es inferior al declarado en la Evaluación Inicial.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center justify-center mb-8 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                      <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Veredicto Legal — Estándares Mínimos Res. 0312</p>
                      <div className={`px-6 py-3 rounded-full border-2 ${report.colorClass} mb-5`}>
                        <h4 className="text-2xl font-black">{report.qualification}</h4>
                      </div>
                      <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Cobertura Documental Global</p>
                      <p className="text-6xl font-black text-gray-800 tracking-tighter">
                        {report.percentage}<span className="text-3xl text-gray-300 font-bold">%</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">Con Evidencia PDF</span>
                        <span className="text-3xl font-bold text-green-700">{report.uploaded}</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">Total Estándares</span>
                        <span className="text-3xl font-bold text-gray-800">{report.total}</span>
                      </div>
                    </div>
                    <div className={`p-5 rounded-xl border ${report.colorClass}`}>
                      <h5 className="font-bold flex items-center mb-2">
                        <AlertTriangle className="w-5 h-5 mr-2" /> Acción Normativa Requerida
                      </h5>
                      <p className="text-sm opacity-90">{report.action}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => window.print()}
                className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-sm transition">
                <Download className="w-4 h-4 mr-2" /> Exportar a PDF
              </button>
              <button onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed bottom-6 right-6 bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg flex items-center text-sm">
          <Activity className="w-4 h-4 mr-2 animate-spin" /> Cargando evidencias...
        </div>
      )}
    </div>
  );
}
