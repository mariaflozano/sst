import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, PlusCircle, AlertCircle, CalendarClock, Target, ListTodo, Eye, AlertTriangle, CheckCircle, X, Lightbulb, Trash2, Pencil, ClipboardList } from 'lucide-react';
import { api } from './services/api';

const ESTADOS_TAREA = ['Abierto', 'En Plan de Acción', 'Cerrado', 'Verificado'];

const estadoTareaColor = {
  'Abierto':           'bg-orange-100 text-orange-700',
  'En Plan de Acción': 'bg-blue-100 text-blue-700',
  'Cerrado':           'bg-green-100 text-green-700',
  'Verificado':        'bg-purple-100 text-purple-700',
};

const PHVA_LABELS = { P: 'Planear', H: 'Hacer', V: 'Verificar', A: 'Actuar' };
const PHVA_COLORS = {
  P: 'bg-blue-100 text-blue-700',
  H: 'bg-yellow-100 text-yellow-700',
  V: 'bg-purple-100 text-purple-700',
  A: 'bg-green-100 text-green-700',
};

const TAREA_EMPTY = { actividad: '', tipo_phva: '', responsable: [], fecha_inicio: '', fecha_fin: '', estado: 'Abierto' };

export default function Auditorias({ companyProfile }) {
  const [auditorias, setAuditorias]           = useState([]);
  const [trabajadores, setTrabajadores]       = useState([]);
  const [searchTerm, setSearchTerm]           = useState('');
  const [activeAuditoria, setActiveAuditoria] = useState(null);

  const [showAuditoriaModal, setShowAuditoriaModal] = useState(false);
  const [showHallazgoModal, setShowHallazgoModal]   = useState(false);
  const [showCierreModal, setShowCierreModal]       = useState(false);
  const [showTareasModal, setShowTareasModal]       = useState(false);

  // Hallazgo cuyas tareas se están gestionando
  const [activeHallazgo, setActiveHallazgo] = useState(null);

  // Tarea que se está editando (null = modo creación)
  const [editingTarea, setEditingTarea]           = useState(null);
  const [formTarea, setFormTarea]                 = useState(TAREA_EMPTY);
  const [showResponsablesDD, setShowResponsablesDD] = useState(false);

  const [formCierre, setFormCierre] = useState({ conclusiones_generales: '' });

  const [formAuditoria, setFormAuditoria] = useState({
    proceso_audit: '', alcance: '', auditor_nombre: '', auditor_perfil: '', fecha_programada: ''
  });

  const [formHallazgo, setFormHallazgo] = useState({
    tipo_hallazgo: 'No Conformidad Menor', descripcion: '', requisito_incumplido: '', fecha_limite_cierre: ''
  });

  const fetchData = async () => {
    if (!companyProfile?.id) return;
    try {
      const res = await api(`/empresas/${companyProfile.id}/auditorias`);
      if (res.ok) {
        const data = await res.json();
        setAuditorias(data);
        if (activeAuditoria) {
          const updated = data.find(a => a.id === activeAuditoria.id);
          setActiveAuditoria(updated || null);
          // keep activeHallazgo in sync
          if (activeHallazgo && updated) {
            const updatedH = updated.hallazgos_legales?.find(h => h.id === activeHallazgo.id);
            if (updatedH) setActiveHallazgo(updatedH);
          }
        }
      }
    } catch (e) { console.error(e); }
  };

  const fetchTrabajadores = async () => {
    if (!companyProfile?.id) return;
    try {
      const res = await api(`/empresas/${companyProfile.id}/trabajadores`);
      if (res.ok) setTrabajadores(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
    fetchTrabajadores();
  }, [companyProfile]);

  // ── Auditoría ──────────────────────────────────────────────────────────────

  const saveAuditoria = async () => {
    if (!formAuditoria.alcance.trim())        { alert('Ingrese el alcance'); return; }
    if (!formAuditoria.auditor_nombre.trim()) { alert('Ingrese el nombre del auditor'); return; }
    if (!formAuditoria.fecha_programada)      { alert('Seleccione la fecha programada'); return; }
    try {
      const res = await api('/empresas/auditorias', {
        method: 'POST',
        body: JSON.stringify({ ...formAuditoria, empresa_id: companyProfile.id }),
      });
      if (res.ok) {
        setShowAuditoriaModal(false);
        setFormAuditoria({ alcance: '', auditor_nombre: '', auditor_perfil: '', fecha_programada: '' });
        fetchData();
      } else {
        const err = await res.json();
        alert('Error: ' + JSON.stringify(err.message || err));
      }
    } catch (e) { console.error(e); }
  };

  const cerrarAuditoria = async () => {
    if (!formCierre.conclusiones_generales.trim()) {
      alert('Ingrese las conclusiones generales'); return;
    }
    try {
      const res = await api(`/empresas/auditorias/${activeAuditoria.id}/cerrar`, {
        method: 'POST',
        body: JSON.stringify(formCierre),
      });
      if (res.ok) {
        setShowCierreModal(false);
        setFormCierre({ conclusiones_generales: '' });
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  // ── Hallazgo ───────────────────────────────────────────────────────────────

  const saveHallazgo = async () => {
    if (!formHallazgo.descripcion.trim()) { alert('Ingrese la descripción del hallazgo'); return; }
    try {
      const res = await api(`/empresas/auditorias/${activeAuditoria.id}/hallazgos`, {
        method: 'POST',
        body: JSON.stringify(formHallazgo),
      });
      if (res.ok) {
        setShowHallazgoModal(false);
        setFormHallazgo({ tipo_hallazgo: 'No Conformidad Menor', descripcion: '', requisito_incumplido: '', fecha_limite_cierre: '' });
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  // ── Tareas ─────────────────────────────────────────────────────────────────

  const openTareasModal = (hallazgo) => {
    setActiveHallazgo(hallazgo);
    setEditingTarea(null);
    setFormTarea(TAREA_EMPTY);
    setShowResponsablesDD(false);
    setShowTareasModal(true);
  };

  const toggleResponsable = (nombre) => {
    setFormTarea(prev => {
      const current = Array.isArray(prev.responsable) ? prev.responsable : [];
      return {
        ...prev,
        responsable: current.includes(nombre)
          ? current.filter(r => r !== nombre)
          : [...current, nombre],
      };
    });
  };

  const saveTarea = async () => {
    if (!formTarea.actividad.trim()) { alert('Describa la actividad'); return; }
    try {
      let res;
      if (editingTarea) {
        res = await api(`/empresas/tareas/${editingTarea.id}`, {
          method: 'PUT',
          body: JSON.stringify(formTarea),
        });
      } else {
        res = await api(`/empresas/hallazgos/${activeHallazgo.id}/tareas`, {
          method: 'POST',
          body: JSON.stringify(formTarea),
        });
      }
      if (res.ok) {
        setEditingTarea(null);
        setFormTarea(TAREA_EMPTY);
        await fetchData();
        // re-sync activeHallazgo from fresh data
      }
    } catch (e) { console.error(e); }
  };

  const deleteTarea = async (tareaId) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      const res = await api(`/empresas/tareas/${tareaId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const changeTareaEstado = async (tarea, nuevoEstado) => {
    try {
      await api(`/empresas/tareas/${tarea.id}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  // keep activeHallazgo updated after fetchData (via effect on auditorias)
  useEffect(() => {
    if (!activeHallazgo || !auditorias.length) return;
    for (const aud of auditorias) {
      const h = aud.hallazgos_legales?.find(h => h.id === activeHallazgo.id);
      if (h) { setActiveHallazgo(h); break; }
    }
  }, [auditorias]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const filtered = auditorias.filter(a =>
    (a.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.alcance || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.auditor_nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    const colors = {
      'Programada': 'bg-blue-100 text-blue-700',
      'En Proceso':  'bg-yellow-100 text-yellow-700',
      'Realizada':   'bg-green-100 text-green-700',
      'Cancelada':   'bg-gray-100 text-gray-700',
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[estado] || colors['Programada']}`}>{estado}</span>;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DETALLE DE AUDITORÍA
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeAuditoria) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <button onClick={() => setActiveAuditoria(null)} className="text-gray-500 hover:text-gray-900 text-sm mb-4 flex items-center font-bold">
              ← Volver al Programa Anual
            </button>
            <h2 className="text-sm font-semibold text-gray-800 mb-1 flex items-start">
              <Target className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
              {activeAuditoria.codigo} — {activeAuditoria.alcance}
            </h2>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              {activeAuditoria.proceso_audit && (
                <span className="flex items-center font-medium text-indigo-700">Proceso: {activeAuditoria.proceso_audit}</span>
              )}
              <span className="flex items-center"><CalendarClock className="w-4 h-4 mr-1"/> Prog: {activeAuditoria.fecha_programada?.substring(0, 10)}</span>
              <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1"/> Auditor: {activeAuditoria.auditor_nombre}</span>
              {activeAuditoria.auditor_perfil && (
                <span className="flex items-center capitalize">Perfil: {activeAuditoria.auditor_perfil}</span>
              )}
              {getEstadoBadge(activeAuditoria.estado)}
            </div>
          </div>
          {activeAuditoria.estado !== 'Realizada' && activeAuditoria.estado !== 'Cancelada' && (
            <button onClick={() => setShowCierreModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow flex items-center transition-colors text-sm whitespace-nowrap">
              <CheckCircle className="w-4 h-4 mr-2" /> Cerrar Auditoría
            </button>
          )}
        </div>

        {/* Hallazgos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center">
              <ListTodo className="w-5 h-5 mr-2 text-indigo-600"/> Registro de Hallazgos
            </h3>
            {activeAuditoria.estado !== 'Realizada' && activeAuditoria.estado !== 'Cancelada' && (
              <button onClick={() => setShowHallazgoModal(true)} className="text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center">
                <PlusCircle className="w-4 h-4 mr-1"/> Levantar Hallazgo
              </button>
            )}
          </div>

          {(!activeAuditoria.hallazgos_legales || activeAuditoria.hallazgos_legales.length === 0) ? (
            <div className="p-12 text-center text-gray-500">Aún no hay hallazgos registrados.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="py-3 px-6">Tipo</th>
                  <th className="py-3 px-6">Descripción</th>
                  <th className="py-3 px-6">Requisito</th>
                  <th className="py-3 px-6 text-center">Fecha Límite</th>
                  <th className="py-3 px-6 text-center">Tareas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeAuditoria.hallazgos_legales.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-semibold">
                      <div className="flex items-center gap-2">
                        {h.tipo_hallazgo === 'Oportunidad de Mejora'
                          ? <Lightbulb className="text-yellow-500 w-4 h-4"/>
                          : <AlertTriangle className="text-rose-500 w-4 h-4"/>}
                        <span className="text-xs">{h.tipo_hallazgo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 max-w-xs">{h.descripcion}</td>
                    <td className="py-4 px-6">
                      {h.requisito_incumplido
                        ? <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">{h.requisito_incumplido}</span>
                        : <span className="text-gray-400 text-xs">N/A</span>}
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-gray-600">
                      {h.fecha_limite_cierre || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => openTareasModal(h)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 transition-colors"
                      >
                        <ClipboardList className="w-3.5 h-3.5"/>
                        Ver Tareas
                        {h.tareas?.length > 0 && (
                          <span className="bg-indigo-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none">{h.tareas.length}</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Informe final si ya fue cerrada */}
        {activeAuditoria.estado === 'Realizada' && (
          <div className="bg-indigo-50/50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
            <div className="p-4 border-b border-indigo-100 flex items-center bg-indigo-100/50">
              <ShieldCheck className="w-5 h-5 mr-2 text-indigo-700"/>
              <h3 className="font-bold text-indigo-900">Informe Final</h3>
              {activeAuditoria.fecha_realizacion && (
                <span className="ml-auto text-xs text-indigo-500">Realizada: {activeAuditoria.fecha_realizacion}</span>
              )}
            </div>
            <div className="p-6">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">Conclusiones Generales</h4>
              <div className="bg-white p-4 font-medium text-gray-700 text-sm whitespace-pre-wrap rounded-xl border border-indigo-50">
                {activeAuditoria.conclusiones_generales || 'Sin conclusiones registradas'}
              </div>
            </div>
          </div>
        )}

        {/* ── Modal Hallazgo ── */}
        {showHallazgoModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-rose-50">
                <h3 className="text-lg font-bold text-rose-800 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2"/> Registrar Hallazgo
                </h3>
                <button onClick={() => setShowHallazgoModal(false)}><X className="w-5 h-5 text-rose-400"/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Hallazgo *</label>
                  <select value={formHallazgo.tipo_hallazgo} onChange={e => setFormHallazgo({...formHallazgo, tipo_hallazgo: e.target.value})}
                    className="w-full rounded-lg border-gray-200 text-sm focus:ring-rose-500 focus:border-rose-500">
                    <option>No Conformidad Mayor</option>
                    <option>No Conformidad Menor</option>
                    <option>Oportunidad de Mejora</option>
                    <option>Observación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Descripción *</label>
                  <textarea rows="3" value={formHallazgo.descripcion} onChange={e => setFormHallazgo({...formHallazgo, descripcion: e.target.value})}
                    placeholder="Describa el hallazgo..." className="w-full rounded-lg border-gray-200 text-sm focus:ring-rose-500 focus:border-rose-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Requisito Legal Incumplido</label>
                  <input type="text" value={formHallazgo.requisito_incumplido} onChange={e => setFormHallazgo({...formHallazgo, requisito_incumplido: e.target.value})}
                    placeholder="Ej: Decreto 1072 - Art 2.2.4.6.29" className="w-full rounded-lg border-gray-200 text-sm focus:ring-rose-500 focus:border-rose-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Límite de Cierre</label>
                  <input type="date" value={formHallazgo.fecha_limite_cierre} onChange={e => setFormHallazgo({...formHallazgo, fecha_limite_cierre: e.target.value})}
                    className="w-full rounded-lg border-gray-200 text-sm focus:ring-rose-500 focus:border-rose-500"/>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button onClick={() => setShowHallazgoModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
                  <button onClick={saveHallazgo} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg">Registrar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal Cierre ── */}
        {showCierreModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
                <h3 className="text-lg font-bold text-indigo-800 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2"/> Cierre de Auditoría
                </h3>
                <button onClick={() => setShowCierreModal(false)}><X className="w-5 h-5 text-indigo-400"/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Conclusiones Generales *</label>
                  <textarea rows="6" value={formCierre.conclusiones_generales} onChange={e => setFormCierre({...formCierre, conclusiones_generales: e.target.value})}
                    placeholder="Resuma el resultado, hallazgos principales y acciones correctivas acordadas..."
                    className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-xs font-medium flex items-start border border-orange-100">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5"/>
                  Una vez guardado, la auditoría quedará en estado "Realizada" y no se podrán agregar más hallazgos.
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button onClick={() => setShowCierreModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
                  <button onClick={cerrarAuditoria} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
                    Formalizar Cierre
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal Tareas ── */}
        {showTareasModal && activeHallazgo && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-indigo-50 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-indigo-800 flex items-center">
                    <ClipboardList className="w-5 h-5 mr-2"/> Plan de Acción — Tareas
                  </h3>
                  <p className="text-xs text-indigo-600 mt-1 max-w-lg">
                    <span className="font-semibold">Hallazgo:</span> {activeHallazgo.descripcion}
                  </p>
                  {activeHallazgo.fecha_limite_cierre && (
                    <p className="text-xs text-orange-600 mt-0.5 font-medium">Fecha límite: {activeHallazgo.fecha_limite_cierre}</p>
                  )}
                </div>
                <button onClick={() => { setShowTareasModal(false); setEditingTarea(null); setFormTarea(TAREA_EMPTY); }}>
                  <X className="w-5 h-5 text-indigo-400"/>
                </button>
              </div>

              {/* Lista de tareas */}
              <div className="overflow-y-auto flex-1 p-5 space-y-2">
                {(!activeHallazgo.tareas || activeHallazgo.tareas.length === 0) ? (
                  <p className="text-center text-gray-400 py-8 text-sm">Aún no hay tareas registradas. Agrega la primera abajo.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 font-semibold uppercase border-b border-gray-100">
                        <th className="py-2 pr-3 text-left">PHVA</th>
                        <th className="py-2 pr-3 text-left">Actividad</th>
                        <th className="py-2 pr-3 text-left">Responsables</th>
                        <th className="py-2 pr-3 text-left">Fechas</th>
                        <th className="py-2 pr-3 text-center">Estado</th>
                        <th className="py-2 text-center">Acc.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {activeHallazgo.tareas.map(t => {
                        const responsables = Array.isArray(t.responsable) ? t.responsable : (t.responsable ? [t.responsable] : []);
                        return (
                          <tr key={t.id} className={`hover:bg-gray-50 ${editingTarea?.id === t.id ? 'bg-yellow-50' : ''}`}>
                            <td className="py-3 pr-3 align-top">
                              {t.tipo_phva
                                ? <span className={`px-2 py-0.5 rounded text-xs font-black ${PHVA_COLORS[t.tipo_phva]}`}>{t.tipo_phva}</span>
                                : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="py-3 pr-3 text-gray-800 align-top text-sm">{t.actividad}</td>
                            <td className="py-3 pr-3 align-top">
                              {responsables.length > 0
                                ? <div className="flex flex-col gap-0.5">{responsables.map(r => <span key={r} className="text-xs text-gray-700">{r}</span>)}</div>
                                : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="py-3 pr-3 align-top text-xs text-gray-600 whitespace-nowrap">
                              {t.fecha_inicio && <div>Inicio: {t.fecha_inicio}</div>}
                              {t.fecha_fin    && <div>Fin: {t.fecha_fin}</div>}
                              {!t.fecha_inicio && !t.fecha_fin && <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 pr-3 align-top">
                              <select
                                value={t.estado}
                                onChange={e => changeTareaEstado(t, e.target.value)}
                                className={`text-xs font-bold rounded-lg border-0 py-1 px-2 cursor-pointer ${estadoTareaColor[t.estado] || ''}`}
                              >
                                {ESTADOS_TAREA.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td className="py-3 align-top">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingTarea(t);
                                    setFormTarea({
                                      actividad:    t.actividad,
                                      tipo_phva:    t.tipo_phva || '',
                                      responsable:  Array.isArray(t.responsable) ? t.responsable : (t.responsable ? [t.responsable] : []),
                                      fecha_inicio: t.fecha_inicio || '',
                                      fecha_fin:    t.fecha_fin || '',
                                      estado:       t.estado,
                                    });
                                    setShowResponsablesDD(false);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                  title="Editar"
                                >
                                  <Pencil className="w-3.5 h-3.5"/>
                                </button>
                                <button
                                  onClick={() => deleteTarea(t.id)}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Formulario nueva / editar tarea */}
              <div className="border-t border-gray-100 bg-gray-50 p-5 flex-shrink-0">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
                  {editingTarea ? '✏️ Editando tarea' : '+ Nueva tarea'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Actividad */}
                  <div className="md:col-span-2">
                    <textarea
                      rows="2"
                      value={formTarea.actividad}
                      onChange={e => setFormTarea({...formTarea, actividad: e.target.value})}
                      placeholder="Descripción de la actividad / acción correctiva *"
                      className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Tipo PHVA */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo PHVA</label>
                    <select
                      value={formTarea.tipo_phva}
                      onChange={e => setFormTarea({...formTarea, tipo_phva: e.target.value})}
                      className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">— Seleccionar —</option>
                      {Object.entries(PHVA_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{val} — {label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Responsables multi-select */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Responsables</label>
                    <button
                      type="button"
                      onClick={() => setShowResponsablesDD(v => !v)}
                      className="w-full rounded-lg border border-gray-200 bg-white text-sm px-3 py-2 text-left flex justify-between items-center focus:ring-2 focus:ring-indigo-500"
                    >
                      <span className={formTarea.responsable?.length ? 'text-gray-800' : 'text-gray-400'}>
                        {formTarea.responsable?.length
                          ? `${formTarea.responsable.length} seleccionado${formTarea.responsable.length > 1 ? 's' : ''}`
                          : '— Seleccionar —'}
                      </span>
                      <span className="text-gray-400 text-xs">{showResponsablesDD ? '▲' : '▼'}</span>
                    </button>
                    {showResponsablesDD && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {trabajadores.length === 0 && (
                          <p className="px-3 py-2 text-xs text-gray-400">No hay trabajadores registrados</p>
                        )}
                        {trabajadores.map(t => {
                          const checked = Array.isArray(formTarea.responsable) && formTarea.responsable.includes(t.nombre_completo);
                          return (
                            <label key={t.id} className="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleResponsable(t.nombre_completo)}
                                className="accent-indigo-600"
                              />
                              <span className="text-gray-800">{t.nombre_completo}</span>
                              {t.cargo && <span className="text-gray-400 text-xs">({t.cargo})</span>}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Fechas */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      value={formTarea.fecha_inicio}
                      onChange={e => setFormTarea({...formTarea, fecha_inicio: e.target.value})}
                      className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      value={formTarea.fecha_fin}
                      onChange={e => setFormTarea({...formTarea, fecha_fin: e.target.value})}
                      className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Chips de seleccionados */}
                {formTarea.responsable?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {formTarea.responsable.map(r => (
                      <span key={r} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {r}
                        <button type="button" onClick={() => toggleResponsable(r)} className="hover:text-indigo-900">×</button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  {editingTarea ? (
                    <button onClick={() => { setEditingTarea(null); setFormTarea(TAREA_EMPTY); setShowResponsablesDD(false); }} className="text-sm text-gray-500 hover:text-gray-700">
                      Cancelar edición
                    </button>
                  ) : <span/>}
                  <button onClick={saveTarea} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm">
                    {editingTarea ? 'Guardar cambios' : 'Agregar tarea'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTA PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
              <ShieldCheck className="w-8 h-8 text-indigo-600 mr-3"/>
              Auditorías SG-SST
            </h2>
            <p className="text-sm text-gray-500 max-w-xl">
              Programa de auditorías internas y externas según ISO 45001 y Res. 0312/2019.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <button
              onClick={() => { setFormAuditoria({ proceso_audit: '', alcance: '', auditor_nombre: '', auditor_perfil: '', fecha_programada: '' }); setShowAuditoriaModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center transition-colors text-sm"
            >
              <PlusCircle className="w-4 h-4 mr-2"/> Nueva Auditoría
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',       value: auditorias.length,                                       color: 'text-gray-800',  icon: <ShieldCheck className="w-8 h-8 text-gray-300"/> },
          { label: 'Programadas', value: auditorias.filter(a => a.estado === 'Programada').length, color: 'text-blue-600',  icon: <CalendarClock className="w-8 h-8 text-blue-300"/> },
          { label: 'En Proceso',  value: auditorias.filter(a => a.estado === 'En Proceso').length, color: 'text-yellow-600',icon: <AlertTriangle className="w-8 h-8 text-yellow-300"/> },
          { label: 'Realizadas',  value: auditorias.filter(a => a.estado === 'Realizada').length,  color: 'text-green-600', icon: <CheckCircle className="w-8 h-8 text-green-300"/> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
          <input type="text" placeholder="Buscar por código, alcance o auditor..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-4 px-6">Código</th>
                <th className="py-4 px-6">Proceso</th>
                <th className="py-4 px-6">Alcance</th>
                <th className="py-4 px-6">Auditor</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-center">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="py-12 text-center text-gray-500">No hay auditorías registradas</td></tr>
              ) : (
                filtered.map(aud => (
                  <tr key={aud.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-indigo-600">{aud.codigo}</td>
                    <td className="py-4 px-6 text-gray-600">{aud.proceso_audit || <span className="text-gray-300">—</span>}</td>
                    <td className="py-4 px-6 font-medium text-gray-800">{aud.alcance}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium">{aud.auditor_nombre}</div>
                      {aud.auditor_perfil && <div className="text-xs text-gray-400">{aud.auditor_perfil}</div>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-gray-700">
                        <CalendarClock className="w-4 h-4 mr-1 text-gray-400"/>
                        {aud.fecha_programada}
                      </div>
                      {aud.fecha_realizacion && (
                        <div className="text-xs text-green-600 mt-1">Realizada: {aud.fecha_realizacion}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">{getEstadoBadge(aud.estado)}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => setActiveAuditoria(aud)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Gestionar">
                        <Eye className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Auditoría */}
      {showAuditoriaModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
              <h3 className="text-lg font-bold text-indigo-800 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2"/> Nueva Auditoría
              </h3>
              <button onClick={() => setShowAuditoriaModal(false)}><X className="w-5 h-5 text-indigo-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Proceso a Auditar</label>
                <input type="text" value={formAuditoria.proceso_audit} onChange={e => setFormAuditoria({...formAuditoria, proceso_audit: e.target.value})}
                  placeholder="Ej: Gestión de Contratistas, EPP, Capacitaciones..."
                  className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alcance / Objeto *</label>
                <textarea rows="4" value={formAuditoria.alcance} onChange={e => setFormAuditoria({...formAuditoria, alcance: e.target.value})}
                  placeholder="Describa el alcance y objeto de la auditoría..."
                  className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Perfil del Auditor</label>
                <select value={formAuditoria.auditor_perfil}
                  onChange={e => setFormAuditoria({...formAuditoria, auditor_perfil: e.target.value, auditor_nombre: ''})}
                  className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Seleccionar...</option>
                  <option value="Interno">Interno</option>
                  <option value="Externo">Externo</option>
                  <option value="ARL / COPASST">ARL / COPASST</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Auditor *</label>
                {formAuditoria.auditor_perfil === 'Interno' ? (
                  <select value={formAuditoria.auditor_nombre}
                    onChange={e => setFormAuditoria({...formAuditoria, auditor_nombre: e.target.value})}
                    className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">— Seleccionar trabajador —</option>
                    {trabajadores.map(t => (
                      <option key={t.id} value={t.nombre_completo}>
                        {t.nombre_completo}{t.cargo ? ` (${t.cargo})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={formAuditoria.auditor_nombre}
                    onChange={e => setFormAuditoria({...formAuditoria, auditor_nombre: e.target.value})}
                    placeholder="Nombre completo del auditor"
                    className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Programada *</label>
                <input type="date" value={formAuditoria.fecha_programada} onChange={e => setFormAuditoria({...formAuditoria, fecha_programada: e.target.value})}
                  className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button onClick={() => setShowAuditoriaModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
                <button onClick={saveAuditoria} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
                  Crear Auditoría
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
