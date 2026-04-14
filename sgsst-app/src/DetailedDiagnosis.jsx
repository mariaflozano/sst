import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  FileText,
  Search,
  ClipboardList,
  Activity,
  Eye,
  Settings,
  PieChart,
  X,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Lock,
  Unlock,
  Plus,
  ChevronDown,
  History,
  Calendar,
  CheckSquare,
  Shield,
  Clock as ClockIcon,
} from 'lucide-react';
import { api } from './services/api';

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
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 mb-4 flex items-center justify-between group">
      <div className="flex items-center">
        <Shield className="w-4 h-4 text-yellow-400 mr-3 flex-shrink-0" />
        <p className="text-xs text-gray-300 pr-4">
          <span className="text-yellow-400 font-bold">Aviso profesional: </span>
          Esta plataforma es una herramienta de apoyo para la organización y gestión documental del SG-SST.
          <strong className="text-white"> No reemplaza la asesoría, diseño ni supervisión de un profesional, tecnólogo o técnico en SST con licencia vigente.</strong>{' '}
          El cumplimiento normativo real requiere la orientación de personal idóneo según el Decreto 1072/2015 y la Res. 0312/2019.
        </p>
      </div>
      <button 
        onClick={dismiss}
        className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
        title="Ocultar por 7 días"
      >
        <X size={14} />
      </button>
    </div>
  );
};


// ─── Estructura de etapas PHVA ────────────────────────────────────────────────
const etapas = [
  { id: 'planear', title: 'Planear', desc: 'Evaluación y Planificación', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50', borderColor: 'border-blue-500' },
  { id: 'hacer', title: 'Hacer', desc: 'Implementación Operativa', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50', borderColor: 'border-orange-500' },
  { id: 'verificar', title: 'Verificar', desc: 'Evaluación de Acción', icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50', borderColor: 'border-purple-500' },
  { id: 'actuar', title: 'Actuar', desc: 'Mejora Continua', icon: Settings, color: 'text-green-500', bg: 'bg-green-50', borderColor: 'border-green-500' },
];

// ─── Lista de estándares por perfil ───────────────────────────────────────────
const getStandardsList = (standards) => {
  if (standards === 7) {
    return {
      planear: [
        { id: 1, name: 'Asignación de persona que diseña el SG-SST' },
        { id: 2, name: 'Afiliación al Sistema de Seguridad Social Integral' },
        { id: 3, name: 'Capacitación en SST' },
        { id: 4, name: 'Plan Anual de Trabajo' },
      ],
      hacer: [
        { id: 5, name: 'Evaluaciones Médicas Ocupacionales' },
        { id: 6, name: 'Identificación de Peligros y Evaluación de Riesgos (Matriz IPERC)' },
        { id: 7, name: 'Medidas de Prevención y Control frente a Peligros' },
      ],
      verificar: [],
      actuar: [],
    };
  } else if (standards === 21) {
    return {
      planear: [
        { id: 1, name: 'Política de SST y Objetivos' },
        { id: 2, name: 'Plan Anual de Trabajo y Capacitación' },
        { id: 3, name: 'Archivo y Retención Documental' },
        { id: 4, name: 'Acta de Rendición de Cuentas' },
        { id: 5, name: 'Matriz Legal actualizada' },
        { id: 6, name: 'Asignación de Responsabilidades' },
      ],
      hacer: [
        { id: 7, name: 'Descripción Sociodemográfica y Diagnóstico de Salud' },
        { id: 8, name: 'Actividades de Promoción y Prevención' },
        { id: 9, name: 'Conformación COPASST y Comité de Convivencia' },
        { id: 10, name: 'Entrega de EPP y Capacitación en su uso' },
        { id: 11, name: 'Plan de Prevención y Respuesta ante Emergencias' },
        { id: 12, name: 'Reporte de Accidentes y Enfermedades Laborales' },
        { id: 13, name: 'Investigación de Incidentes, Accidentes y Enfermedades' },
      ],
      verificar: [
        { id: 14, name: 'Revisiones por la Alta Dirección' },
        { id: 15, name: 'Inspecciones periódicas de Instalaciones y Equipos' },
        { id: 16, name: 'Mantenimiento de Instalaciones y Equipos' },
        { id: 17, name: 'Auditoría Anual' },
      ],
      actuar: [
        { id: 18, name: 'Acciones Preventivas y Correctivas' },
        { id: 19, name: 'Plan de Mejoramiento Continuo' },
        { id: 20, name: 'Indicadores de Estructura, Proceso y Resultado' },
        { id: 21, name: 'Conservación de los Documentos' },
      ],
    };
  } else {
    return {
      planear: [
        { id: 1, name: '1.1.1 Responsable del SG-SST' },
        { id: 2, name: '1.1.2 Responsabilidades en el SG-SST' },
        { id: 3, name: '1.1.3 Asignación de Recursos para el SG-SST' },
        { id: 4, name: '1.1.4 Afiliación al Sistema General de Riesgos Laborales' },
        { id: 5, name: '1.1.5 Pago de pensión trabajadores de alto riesgo' },
        { id: 6, name: '1.1.6 Conformación COPASST' },
        { id: 7, name: '1.1.7 Capacitación COPASST' },
        { id: 8, name: '1.1.8 Conformación Comité de Convivencia' },
        { id: 9, name: '1.2.1 Programa de capacitación anual' },
        { id: 10, name: '1.2.2 Inducción y reinducción en SST' },
        { id: 11, name: '1.2.3 Responsables de inducción y capacitación' },
        { id: 12, name: '2.1.1 Política de Seguridad y Salud en el Trabajo' },
        { id: 13, name: '2.2.1 Objetivos de SST' },
        { id: 14, name: '2.3.1 Evaluación Inicial del SG-SST' },
        { id: 15, name: '2.4.1 Plan Anual de Trabajo' },
        { id: 16, name: '2.5.1 Archivo y retención documental' },
        { id: 17, name: '2.6.1 Rendición de cuentas' },
        { id: 18, name: '2.7.1 Matriz de Requisitos Legales' },
        { id: 19, name: '2.8.1 Mecanismos de comunicación interna y externa' },
        { id: 20, name: '2.9.1 Identificación y evaluación de adquisiciones' },
        { id: 21, name: '2.10.1 Selección y evaluación de contratistas' },
        { id: 22, name: '2.11.1 Gestión del cambio' },
        { id: 23, name: '2.11.2 Plan de capacitación integral de emergencias' },
        { id: 24, name: '2.11.3 Procedimiento de auditorías previas a adquisiciones' },
      ],
      hacer: [
        { id: 25, name: '3.1.1 Descripción Sociodemográfica y Diagnóstico de Salud' },
        { id: 26, name: '3.1.2 Actividades de Promoción y Prevención' },
        { id: 27, name: '3.1.3 Evaluaciones médicas ocupacionales' },
        { id: 28, name: '3.1.4 Restricciones y recomendaciones médicas' },
        { id: 29, name: '3.1.5 Reporte de Accidentes y Enfermedades Laborales' },
        { id: 30, name: '3.1.6 Investigación de ATEL' },
        { id: 31, name: '3.1.7 Registro y Análisis Estadístico ATEL' },
        { id: 32, name: '3.1.8 Seguimiento de Ausentismo' },
        { id: 33, name: '3.1.9 Frecuencia de accidentalidad' },
        { id: 34, name: '3.1.10 Severidad de accidentalidad' },
        { id: 35, name: '3.1.11 Proporción de accidentes mortales' },
        { id: 36, name: '3.1.12 Prevalencia de enfermedad laboral' },
        { id: 37, name: '3.1.13 Incidencia de enfermedad laboral' },
        { id: 38, name: '4.1.1 Metodología de identificación de peligros (IPERC)' },
        { id: 39, name: '4.1.2 Identificación de peligros con participación' },
        { id: 40, name: '4.1.3 Identificación de sustancias carcinógenas' },
        { id: 41, name: '4.1.4 Mediciones ambientales' },
        { id: 42, name: '4.2.1 Medidas de prevención y control' },
        { id: 43, name: '4.2.2 Aplicación de medidas por parte de trabajadores' },
        { id: 44, name: '4.2.3 Inspecciones a instalaciones, máquinas y equipos' },
        { id: 45, name: '4.2.4 Mantenimiento preventivo y correctivo' },
        { id: 46, name: '4.2.5 Entrega de Elementos de Protección Personal (EPP)' },
        { id: 47, name: '5.1.1 Plan de Prevención, Preparación y Respuesta ante Emergencias' },
        { id: 48, name: '5.1.2 Conformación de Brigadas y simulacros' },
      ],
      verificar: [
        { id: 49, name: '6.1.1 Definición de Indicadores de estructura' },
        { id: 50, name: '6.1.1 Definición de Indicadores de proceso y resultado' },
        { id: 51, name: '6.1.2 Auditoría Anual del SG-SST' },
        { id: 52, name: '6.1.3 Alcance y planeación de la auditoría' },
        { id: 53, name: '6.1.4 Revisión por la Alta Dirección' },
      ],
      actuar: [
        { id: 54, name: '7.1.1 Definición de Acciones Preventivas y Correctivas' },
        { id: 55, name: '7.1.2 Acciones de mejora conforme a evaluación inicial' },
        { id: 56, name: '7.1.3 Acciones de mejora con base en investigaciones ATEL' },
        { id: 57, name: '7.1.4 Acciones de mejora con base en auditorías externas' },
        { id: 58, name: '7.1.5 Seguimiento al impacto de eficacia' },
        { id: 59, name: '7.1.6 Revisión gerencial de acciones' },
        { id: 60, name: '7.1.7 Consolidación del Plan de Mejoramiento Anual' },
      ],
    };
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const YEAR_NOW = new Date().getFullYear();
const storageKey = (empresaId) => `sgsst_evaluacion_${empresaId || 'demo'}`;

const loadFromStorage = (empresaId) => {
  try {
    const raw = localStorage.getItem(storageKey(empresaId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveToStorage = (empresaId, data) => {
  try {
    localStorage.setItem(storageKey(empresaId), JSON.stringify(data));
  } catch (e) { console.error('Error guardando evaluación:', e); }
};

// Leer estado de evidencias de Gestión Documental
const loadPHVAFromStorage = (empresaId) => {
  try {
    const raw = localStorage.getItem(`sgsst_phva_status_${empresaId || 'demo'}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const calcStats = (calificaciones, standardsList) => {
  const all = Object.values(standardsList).flat();
  const total = all.length;
  const cumple = all.filter(s => calificaciones[s.id] === 'cumple').length;
  const noCumple = all.filter(s => calificaciones[s.id] === 'no_cumple').length;
  const noAplica = all.filter(s => calificaciones[s.id] === 'no_aplica').length;
  const sinCalificar = all.filter(s => !calificaciones[s.id]).length;
  const aplicables = total - noAplica;
  const pct = aplicables > 0 ? Math.round((cumple / aplicables) * 100) : 0;

  let nivel = 'CRÍTICO';
  let nivelColor = 'text-red-700 bg-red-100 border-red-300';
  if (pct > 85) { nivel = 'ACEPTABLE'; nivelColor = 'text-green-700 bg-green-100 border-green-300'; }
  else if (pct > 60) { nivel = 'MODERADO'; nivelColor = 'text-yellow-700 bg-yellow-100 border-yellow-300'; }

  const porEtapa = {};
  etapas.forEach(e => {
    const eStds = standardsList[e.id] || [];
    const eCumple = eStds.filter(s => calificaciones[s.id] === 'cumple').length;
    const eNoAplica = eStds.filter(s => calificaciones[s.id] === 'no_aplica').length;
    const eNoCumple = eStds.filter(s => calificaciones[s.id] === 'no_cumple').length;
    const eAplicables = eStds.length - eNoAplica;
    porEtapa[e.id] = {
      total: eStds.length, cumple: eCumple, noCumple: eNoCumple, noAplica: eNoAplica,
      sinCalificar: eStds.length - eCumple - eNoCumple - eNoAplica,
      pct: eAplicables > 0 ? Math.round((eCumple / eAplicables) * 100) : 0,
    };
  });

  return { total, cumple, noCumple, noAplica, sinCalificar, pct, nivel, nivelColor, porEtapa };
};

// ─────────────────────────────────────────────────────────────────────────────
export default function DetailedDiagnosis({ profile, onClose }) {
  const stds = profile?.cantidad_estandares || 60;
  const standardsList = getStandardsList(stds);
  const empresaId = profile?.id;

  // Estado principal
  const [allEvals, setAllEvals] = useState(() => loadFromStorage(empresaId));
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = loadFromStorage(empresaId);
    const open = Object.keys(saved).filter(y => saved[y].estado === 'abierta').map(Number);
    if (open.length > 0) return Math.max(...open);
    const all = Object.keys(saved).map(Number);
    if (all.length > 0) return Math.max(...all);
    return YEAR_NOW;
  });

  const [activeTab, setActiveTab] = useState('planear');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [yearToCopy, setYearToCopy] = useState(false);
  const [smartFromPHVA, setSmartFromPHVA] = useState(true);
  const [newYearTarget, setNewYearTarget] = useState(YEAR_NOW + 1);

  // --- SINCRONIZACIÓN INICIAL CON EL BACKEND ---
  useEffect(() => {
    if (!empresaId) return;
    api(`/empresas/${empresaId}/progreso`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const newCals = {};
        const reverseMap = { cumplido: 'cumple', no_cumple: 'no_cumple', no_aplica: 'no_aplica' };
        data.forEach(item => {
           if(item.estado && item.estado !== 'pendiente') {
             newCals[item.estandar_id] = reverseMap[item.estado] || item.estado;
           }
        });
        
        setAllEvals(prev => {
          const yearToUpdate = selectedYear || YEAR_NOW;
          const currentEvals = prev[yearToUpdate]?.calificaciones || {};
          
          // Solo actualizamos si hay diferencias para evitar re-renders infinitos
          const hasChanges = Object.keys(newCals).some(key => newCals[key] !== currentEvals[key]);
          
          if (hasChanges) {
            const updated = {
              ...prev,
              [yearToUpdate]: {
                 ...(prev[yearToUpdate] || { estado: 'abierta', fecha_apertura: new Date().toLocaleDateString('es-CO'), fecha_cierre: null }),
                 calificaciones: { ...currentEvals, ...newCals } // Backend tiene prioridad
              }
            };
            saveToStorage(empresaId, updated);
            return updated;
          }
          return prev;
        });
      })
      .catch(e => console.warn("Error cargando el progreso desde backend:", e));
  }, [empresaId, selectedYear]);

  // Calcula el primer año que NO existe en allEvals y está en el rango permitido
  const getNextAvailableYear = () => {
    const opts = [YEAR_NOW - 1, YEAR_NOW, YEAR_NOW + 1, YEAR_NOW + 2].filter(y => !allEvals[y]);
    return opts[0] ?? YEAR_NOW + 1;
  };

  const openNewYearModal = () => {
    setNewYearTarget(getNextAvailableYear());
    setShowNewYearModal(true);
  };

  // Inicializar año si no existe
  useEffect(() => {
    if (!allEvals[selectedYear]) {
      const updated = {
        ...allEvals,
        [selectedYear]: {
          estado: 'abierta',
          fecha_apertura: new Date().toLocaleDateString('es-CO'),
          fecha_cierre: null,
          calificaciones: {},
        },
      };
      setAllEvals(updated);
      saveToStorage(empresaId, updated);
    }
  }, [selectedYear]);

  const currentEval = allEvals[selectedYear] || { estado: 'abierta', calificaciones: {} };
  const isClosed = currentEval.estado === 'cerrada';
  const calificaciones = currentEval.calificaciones || {};
  const stats = calcStats(calificaciones, standardsList);
  const yearsAvailable = Object.keys(allEvals).map(Number).sort((a, b) => b - a);

  // ── Calificar estándar ────────────────────────────────────────────────────
  const handleRating = useCallback(async (stdId, rating) => {
    if (isClosed) return;
    const updated = {
      ...allEvals,
      [selectedYear]: {
        ...currentEval,
        calificaciones: { ...calificaciones, [stdId]: rating },
      },
    };
    setAllEvals(updated);
    saveToStorage(empresaId, updated);

    // Intento opcional de guardar en backend
    try {
      const estadoMap = { cumple: 'cumplido', no_cumple: 'no_cumple', no_aplica: 'no_aplica' };
      await api('/progreso-estandar', {
        method: 'POST',
        body: JSON.stringify({
          empresa_id: empresaId,
          estandar_id: stdId,
          estado: estadoMap[rating],
          anio: selectedYear,
        }),
      });
    } catch { /* Backend opcional */ }
  }, [allEvals, selectedYear, currentEval, calificaciones, isClosed, empresaId]);

  // ── Cerrar evaluación del año ─────────────────────────────────────────────
  const handleCloseYear = async () => {
    // Validación: no cerrar si no hay calificaciones
    const totalCalificados = Object.keys(calificaciones).length;
    if (totalCalificados === 0) {
      alert('No puede cerrar la evaluación sin haber calificado ningún estándar.');
      return;
    }

    // Validación: solo permitir cerrar si todos los estandares aplicables estan calificados
    const totalAplicables = Object.values(standardsList).flat().length;
    if (totalCalificados < totalAplicables) {
      if (!confirm(`Solo ha calificado ${totalCalificados} de ${totalAplicables} estándares. ¿Desea cerrar de todos modos?`)) {
        return;
      }
    }

    const updated = {
      ...allEvals,
      [selectedYear]: {
        ...currentEval,
        estado: 'cerrada',
        fecha_cierre: new Date().toLocaleDateString('es-CO'),
      },
    };
    setAllEvals(updated);
    saveToStorage(empresaId, updated);
    setShowCloseModal(false);

     // Sincronización Forzosa con Base de Datos
     const estadoMap = { cumple: 'cumplido', no_cumple: 'no_cumple', no_aplica: 'no_aplica' };
     for (const [sId, rating] of Object.entries(calificaciones)) {
        try {
            await api('/progreso-estandar', {
              method: 'POST',
              body: JSON.stringify({
                empresa_id: empresaId,
                estandar_id: parseInt(sId),
                estado: estadoMap[rating]
              })
            });
        } catch (e) { console.error("Error sincronizando estándar", sId, e); }
     }

     // Disparar Generación de Plan Anual
     try {
       await api('/plan-anual/generar', {
         method: 'POST',
         body: JSON.stringify({ empresa_id: empresaId })
       });
       console.log("Plan Anual generado exitosamente desde diagnóstico");
     } catch (e) {
       console.error("Error generando Plan Anual", e);
     }
   };

  // ── Abrir nueva evaluación anual (con inteligencia de Gestión Documental) ──
  const handleOpenNewYear = () => {
    let baseCals = yearToCopy ? { ...calificaciones } : {};

    if (smartFromPHVA) {
      // Leer evidencias cargadas en Gestión Documental
      const phvaStatus = loadPHVAFromStorage(empresaId);
      const allStds = Object.values(standardsList).flat();

      allStds.forEach(std => {
        const tieneEvidencia = phvaStatus[std.id] === 'cumplido';
        const eraCalificado  = baseCals[std.id];

        if (tieneEvidencia) {
          // Tiene PDF → mantener o poner Cumple
          baseCals[std.id] = 'cumple';
        } else if (eraCalificado === 'cumple' && !tieneEvidencia) {
          // Declaró Cumple pero NO tiene soporte → borrar para forzar revisión
          delete baseCals[std.id];
        }
        // no_cumple y no_aplica se copian tal cual si yearToCopy está activo
      });
    }

    const updated = {
      ...allEvals,
      [newYearTarget]: {
        estado: 'abierta',
        fecha_apertura: new Date().toLocaleDateString('es-CO'),
        fecha_cierre: null,
        calificaciones: baseCals,
      },
    };
    setAllEvals(updated);
    saveToStorage(empresaId, updated);
    setSelectedYear(newYearTarget);
    setShowNewYearModal(false);
  };

  // ── Filtro de búsqueda ────────────────────────────────────────────────────
  const docsToDisplay = (standardsList[activeTab] || []).filter(
    s => !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const etapaStats = stats.porEtapa[activeTab] || {};

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto bg-gray-50">

      {/* ── BANNER: Año cerrado ────────────────────────────────────────────── */}
      {isClosed && (
        <div className="bg-amber-50 border-b-2 border-amber-300 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Lock className="w-5 h-5 text-amber-600 mr-3" />
            <div>
              <span className="font-bold text-amber-800">Evaluación {selectedYear} — CERRADA · Solo Lectura</span>
              <span className="text-amber-600 text-sm ml-3">Cerrada el {currentEval.fecha_cierre}</span>
            </div>
          </div>
          <button
            onClick={openNewYearModal}
            className="flex items-center px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition"
          >
            <Plus className="w-4 h-4 mr-1" /> Nueva Evaluación
          </button>
        </div>
      )}

      <div className="p-6">
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center mb-1">
              <Shield className="w-7 h-7 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Evaluación Inicial</h2>
              <span className="ml-3 text-sm font-bold text-blue-600 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">Línea Base</span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5 ml-10">
              Autoevaluación declarativa — Res. 0312/2019 · Decreto 1072/2015
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-4 md:mt-0 flex-wrap gap-y-2">
            {/* Selector de año */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="appearance-none pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {[...yearsAvailable, ...(yearsAvailable.includes(YEAR_NOW) ? [] : [YEAR_NOW])].sort((a,b)=>b-a).map(y => (
                  <option key={y} value={y}>
                    {y} {allEvals[y]?.estado === 'cerrada' ? '🔒' : '✏️'}
                  </option>
                ))}
              </select>
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center px-3 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium shadow-sm transition"
            >
              <History className="w-4 h-4 mr-1.5" /> Historial
            </button>

            <button
              onClick={() => setShowSummaryModal(true)}
              className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition"
            >
              <BarChart3 className="w-4 h-4 mr-1.5" /> Resumen {selectedYear}
            </button>

            {!isClosed && (
              <button
                onClick={() => setShowCloseModal(true)}
                disabled={stats.sinCalificar > 0}
                title={stats.sinCalificar > 0 ? `Quedan ${stats.sinCalificar} estándares sin calificar` : 'Cerrar y bloquear este período'}
                className="flex items-center px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm shadow-sm transition"
              >
                <Lock className="w-4 h-4 mr-1.5" /> Cerrar {selectedYear}
              </button>
            )}

            {!yearsAvailable.some(y => y > selectedYear) && isClosed && (
              <button
                onClick={openNewYearModal}
                className="flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-sm transition"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Abrir {getNextAvailableYear()}
              </button>
            )}
          </div>
        </div>

        {/* ── DESCARGO DE RESPONSABILIDAD PROFESIONAL ────────────────── */}
        <ProfessionalDisclaimer />

        {/* ── BANNER Informativo ───────────────────────────────────────────── */}
        <div className={`border rounded-xl p-4 mb-6 flex items-start ${isClosed ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
          {isClosed ? <Lock className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />}
          <div>
            {isClosed ? (
              <>
                <p className="text-amber-800 font-semibold text-sm">Evaluación {selectedYear} finalizada y bloqueada.</p>
                <p className="text-amber-600 text-xs mt-1">Este período es de solo lectura. Para el siguiente ciclo anual, abra una nueva evaluación. Los resultados aquí registrados sirven como línea base para el Plan Anual de Trabajo.</p>
              </>
            ) : (
              <>
                <p className="text-blue-800 font-semibold text-sm">Período activo: Evaluación Inicial {selectedYear}</p>
                <p className="text-blue-600 text-xs mt-1">
                  Califique cada estándar según el estado actual de su empresa: <strong>Cumple</strong> (lo tiene implementado), <strong>No Cumple</strong> (pendiente de implementar) o <strong>No Aplica</strong> (excluido por su actividad económica o tamaño). 
                  Una vez completada, cierre este período para generar la línea base oficial. La Gestión Documental PHVA es el módulo donde cargará los soportes de cada estándar.
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── MINI STATS BANNER ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Estándares', value: stats.total, color: 'text-gray-800', bg: 'bg-white' },
            { label: '✅ Cumple', value: stats.cumple, color: 'text-green-700', bg: 'bg-green-50' },
            { label: '❌ No Cumple', value: stats.noCumple, color: 'text-red-700', bg: 'bg-red-50' },
            { label: '➖ No Aplica', value: stats.noAplica, color: 'text-gray-600', bg: 'bg-gray-100' },
            { label: '⏳ Sin Calificar', value: stats.sinCalificar, color: 'text-orange-700', bg: 'bg-orange-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col items-center`}>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-500 text-center mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── TABS PHVA ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {etapas.map(etapa => {
            const Icon = etapa.icon;
            const isActive = activeTab === etapa.id;
            const ep = stats.porEtapa[etapa.id] || {};
            return (
              <button
                key={etapa.id}
                onClick={() => setActiveTab(etapa.id)}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative ${isActive ? `${etapa.borderColor} shadow-lg bg-white -translate-y-0.5` : 'border-transparent bg-white shadow-sm hover:border-gray-200'}`}
              >
                {ep.sinCalificar > 0 && (
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">{ep.sinCalificar}</span>
                )}
                <div className={`p-3 rounded-full mb-2 ${etapa.bg} ${etapa.color}`}>
                  <Icon size={22} />
                </div>
                <h3 className={`font-bold text-base ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>{etapa.title}</h3>
                <p className="text-xs text-center text-gray-500 mt-0.5">{etapa.desc}</p>
                {ep.total > 0 && (
                  <div className="mt-2 w-full">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${etapa.color.replace('text', 'bg')} transition-all`} style={{ width: `${ep.pct}%` }} />
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-1">{ep.pct}% cumplimiento</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TABLA DE ESTÁNDARES ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 space-y-3 md:space-y-0">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                Estándares de la etapa: <span className={`ml-2 font-extrabold ${etapas.find(e => e.id === activeTab)?.color}`}>{etapas.find(e => e.id === activeTab)?.title}</span>
              </h3>
              {isClosed && (
                <p className="text-xs text-amber-600 flex items-center mt-1"><Lock className="w-3 h-3 mr-1"/>Evaluación cerrada — solo lectura</p>
              )}
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar estándar..."
                className="w-full md:w-60 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-3 rounded-tl-xl border-b border-gray-100 w-12">#</th>
                  <th className="px-5 py-3 border-b border-gray-100">Requisito del Estándar Mínimo</th>
                  <th className="px-5 py-3 rounded-tr-xl border-b border-gray-100 text-center w-52">Calificación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docsToDisplay.map(std => {
                  const rating = calificaciones[std.id];
                  return (
                    <tr key={std.id} className={`transition-colors ${isClosed ? 'bg-white' : 'hover:bg-gray-50'}`}>
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">#{std.id}</td>
                      <td className="px-5 py-4 font-medium text-gray-800">{std.name}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Cumple */}
                          <button
                            onClick={() => handleRating(std.id, 'cumple')}
                            disabled={isClosed}
                            title="Cumple — El estándar está implementado"
                            className={`flex items-center px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                              rating === 'cumple'
                                ? 'bg-green-100 border-green-500 text-green-700 shadow-sm'
                                : 'border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-60'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Cumple
                          </button>
                          {/* No Cumple */}
                          <button
                            onClick={() => handleRating(std.id, 'no_cumple')}
                            disabled={isClosed}
                            title="No Cumple — Pendiente de implementar"
                            className={`flex items-center px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                              rating === 'no_cumple'
                                ? 'bg-red-100 border-red-500 text-red-700 shadow-sm'
                                : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60'
                            }`}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> No Cumple
                          </button>
                          {/* No Aplica */}
                          <button
                            onClick={() => handleRating(std.id, 'no_aplica')}
                            disabled={isClosed}
                            title="No Aplica — Excluido por actividad o tamaño"
                            className={`flex items-center px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                              rating === 'no_aplica'
                                ? 'bg-gray-200 border-gray-500 text-gray-700 shadow-sm'
                                : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60'
                            }`}
                          >
                            <MinusCircle className="w-4 h-4 mr-1" /> N/A
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {docsToDisplay.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                      {searchTerm ? 'Sin resultados para la búsqueda.' : 'No hay estándares definidos para esta etapa según el perfil de empresa.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: Resumen de la evaluación
      ═══════════════════════════════════════════════════════════════════ */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" /> Resumen Evaluación Inicial — {selectedYear}
              </h3>
              <button onClick={() => setShowSummaryModal(false)} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-auto max-h-[75vh]">
              {/* Indicador global */}
              <div className="flex flex-col items-center mb-8 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Nivel de Cumplimiento — {selectedYear}</p>
                <div className={`px-8 py-3 rounded-full border-2 mb-4 ${stats.nivelColor}`}>
                  <span className="text-3xl font-black">{stats.nivel}</span>
                </div>
                <p className="text-7xl font-black text-gray-800 tracking-tighter">
                  {stats.pct}<span className="text-3xl text-gray-300 font-bold">%</span>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {stats.cumple} de {stats.total - stats.noAplica} estándares aplicables
                </p>
                {isClosed && (
                  <div className="mt-3 flex items-center text-amber-600 text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5 mr-1" /> Evaluación cerrada el {currentEval.fecha_cierre}
                  </div>
                )}
              </div>

              {/* Stats globales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: CheckCircle2, label: 'Cumple', value: stats.cumple, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
                  { icon: XCircle, label: 'No Cumple', value: stats.noCumple, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
                  { icon: MinusCircle, label: 'No Aplica', value: stats.noAplica, color: 'text-gray-500', bg: 'bg-gray-100 border-gray-300' },
                  { icon: ClockIcon, label: 'Sin Calificar', value: stats.sinCalificar, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
                ].map((s, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex flex-col items-center ${s.bg}`}>
                    <s.icon className={`w-7 h-7 mb-2 ${s.color}`} />
                    <span className="text-3xl font-bold text-gray-800">{s.value}</span>
                    <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Por etapa */}
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" /> Avance por Etapa PHVA
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {etapas.map(etapa => {
                  const ep = stats.porEtapa[etapa.id];
                  return (
                    <div key={etapa.id} className={`p-4 rounded-xl border-2 ${etapa.borderColor} ${etapa.bg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold ${etapa.color}`}>{etapa.title}</span>
                        <span className="text-xl font-black text-gray-800">{ep.pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className={`h-2 rounded-full ${etapa.color.replace('text', 'bg')}`} style={{ width: `${ep.pct}%` }} />
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div className="flex justify-between"><span>✅ Cumple</span><span className="font-bold text-green-600">{ep.cumple}</span></div>
                        <div className="flex justify-between"><span>❌ No Cumple</span><span className="font-bold text-red-600">{ep.noCumple}</span></div>
                        <div className="flex justify-between"><span>➖ No Aplica</span><span className="font-bold text-gray-500">{ep.noAplica}</span></div>
                        {ep.sinCalificar > 0 && <div className="flex justify-between"><span>⏳ Sin Calificar</span><span className="font-bold text-orange-600">{ep.sinCalificar}</span></div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nota legal */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h5 className="font-bold text-blue-800 text-sm flex items-center mb-1">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Próximo Paso
                </h5>
                <p className="text-xs text-blue-700">
                  Una vez completada la Evaluación Inicial, diríjase al módulo <strong>Gestión Documental PHVA</strong> para cargar los soportes documentales que respaldan cada estándar marcado como "Cumple". Solo con evidencias físicas su sistema cumple plenamente con los requisitos del Ministerio de Trabajo.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowSummaryModal(false)} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-sm transition">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: Historial de evaluaciones
      ═══════════════════════════════════════════════════════════════════ */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-500" /> Historial de Evaluaciones Anuales
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[60vh]">
              {yearsAvailable.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No hay evaluaciones registradas todavía.</p>
              ) : (
                <div className="space-y-3">
                  {yearsAvailable.map(yr => {
                    const ev = allEvals[yr];
                    const s = calcStats(ev?.calificaciones || {}, standardsList);
                    const isOpen = ev?.estado === 'abierta';
                    return (
                      <div
                        key={yr}
                        onClick={() => { setSelectedYear(yr); setShowHistoryModal(false); }}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${yr === selectedYear ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${isOpen ? 'bg-green-100' : 'bg-amber-100'}`}>
                            {isOpen ? <Unlock className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-amber-600" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">Evaluación {yr}</p>
                            <p className="text-xs text-gray-500">
                              {isOpen ? `Abierta desde ${ev?.fecha_apertura}` : `Cerrada el ${ev?.fecha_cierre}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-black ${s.pct >= 86 ? 'text-green-600' : s.pct >= 61 ? 'text-yellow-600' : 'text-red-600'}`}>{s.pct}%</p>
                          <p className="text-xs text-gray-400">{s.cumple}/{s.total - s.noAplica} estándares</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isOpen ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isOpen ? 'Abierta' : 'Cerrada'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => { openNewYearModal(); setShowHistoryModal(false); }}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition"
              >
                <Plus className="w-4 h-4 mr-1" /> Nueva Evaluación
              </button>
              <button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl text-sm transition">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: Cerrar evaluación del año
      ═══════════════════════════════════════════════════════════════════ */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-amber-100 rounded-xl mr-4">
                  <Lock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Cerrar Evaluación {selectedYear}</h3>
                  <p className="text-sm text-gray-500">Esta acción es permanente</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800">
                  Al cerrar la evaluación <strong>{selectedYear}</strong>, esta quedará en <strong>modo lectura permanentemente</strong>. No podrá modificar las calificaciones de este período. Esta es la Línea Base oficial del año {selectedYear} para el Ministerio de Trabajo.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center text-sm mb-6">
                <div className="p-3 bg-green-50 rounded-xl">
                  <span className="text-2xl font-bold text-gray-800">{stats.cumple}</span>
                  <p className="text-green-700 font-medium">Cumplen</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <span className="text-2xl font-bold text-gray-800">{stats.noCumple}</span>
                  <p className="text-red-700 font-medium">No Cumplen</p>
                </div>
              </div>

              {/* Opción de autogen del plan anual */}
              <div className="flex items-center mb-6 pl-2">
                <input type="checkbox" id="genPlan" defaultChecked className="w-5 h-5 text-amber-500 rounded border-gray-300 mr-3" />
                <label htmlFor="genPlan" className="text-sm font-semibold text-gray-700 cursor-pointer text-left">
                  Autogenerar Plan Anual <span className="text-xs font-normal text-gray-500 block">
                    Exportará los {stats.noCumple} "No Cumplen" como tareas al Cronograma. Respeta tareas ya agendadas.
                  </span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setShowCloseModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition">
                  Cancelar
                </button>
                <button onClick={() => handleCloseYear()} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center">
                  <Lock className="w-4 h-4 mr-1.5" /> Confirmar Cierre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: Nueva evaluación anual
      ═══════════════════════════════════════════════════════════════════ */}
      {showNewYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-5">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Nueva Evaluación Anual</h3>
                  <p className="text-sm text-gray-500">Abrir nuevo período de diagnóstico</p>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Año de la nueva evaluación</label>
                <select
                  value={newYearTarget}
                  onChange={e => setNewYearTarget(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {[YEAR_NOW - 1, YEAR_NOW, YEAR_NOW + 1, YEAR_NOW + 2].filter(y => !allEvals[y]).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Opción 1: Copiar del año anterior */}
              <div onClick={() => setYearToCopy(!yearToCopy)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all mb-3 ${yearToCopy ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center flex-shrink-0 ${yearToCopy ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                    {yearToCopy && <CheckSquare className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Copiar calificaciones del año anterior ({selectedYear})</p>
                    <p className="text-xs text-gray-500">Parte de la línea base existente y solo actualiza lo que cambie</p>
                  </div>
                </div>
              </div>

              {/* Opción 2: Análisis inteligente con Gestión Documental */}
              <div onClick={() => setSmartFromPHVA(!smartFromPHVA)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all mb-5 ${smartFromPHVA ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center flex-shrink-0 ${smartFromPHVA ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {smartFromPHVA && <CheckSquare className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">🔁 Análisis inteligente con Gestión Documental</p>
                    <p className="text-xs text-gray-500">
                      Los estándares que tenían <strong>"Cumple"</strong> pero <strong>no tienen PDF</strong> cargado quedan en blanco para forzar re-evaluación. Los que sí tienen evidencia se marcan automáticamente como Cumple.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`border rounded-xl p-3 mb-5 text-xs ${smartFromPHVA ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                {smartFromPHVA
                  ? '✅ Recomendado: Los estándares sin evidencia documental quedarán en blanco — el responsable SG-SST deberá re-evaluarlos conscientemente.'
                  : yearToCopy
                    ? `Se copiarán todas las calificaciones del ${selectedYear}, incluyendo los "Cumple" sin PDF.`
                    : `La evaluación ${newYearTarget} comenzará completamente en blanco.`
                }
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setShowNewYearModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition">
                  Cancelar
                </button>
                <button
                  onClick={handleOpenNewYear}
                  disabled={!newYearTarget || !!allEvals[newYearTarget]}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Abrir Evaluación {newYearTarget}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}