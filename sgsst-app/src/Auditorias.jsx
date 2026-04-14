import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, PlusCircle, AlertCircle, CalendarClock, Target, ListTodo, FileWarning, Eye, AlertTriangle, CheckCircle, Save, X, Lightbulb } from 'lucide-react';
import { api } from './services/api';

export default function Auditorias({ companyProfile }) {
  const [auditorias, setAuditorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAuditoria, setActiveAuditoria] = useState(null);

  const [showAuditoriaModal, setShowAuditoriaModal] = useState(false);
  const [showHallazgoModal, setShowHallazgoModal] = useState(false);
  const [showCierreModal, setShowCierreModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [activeHallazgo, setActiveHallazgo] = useState(null);

  const [formPlan, setFormPlan] = useState({
    plan_accion: '',
    responsable: '',
    fecha_compromiso: '',
    estado: 'En Plan de Acción'
  });

  const [formCierre, setFormCierre] = useState({
    resultado: 'cumple',
    conclusiones: '',
    recomendaciones: '' // Este campo servirá para el Plan de Acción / Acciones Correctivas
  });

  const [formAuditoria, setFormAuditoria] = useState({
    tipo: 'interna',
    objeto: '',
    auditor_lider: '',
    fecha_programada: ''
  });

  const [formHallazgo, setFormHallazgo] = useState({
    tipo_hallazgo: 'No Conformidad Menor',
    descripcion: '',
    requisito_incumplido: ''
  });

  const fetchData = async () => {
    if (!companyProfile?.id) return;
    try {
      const response = await api(`/empresas/${companyProfile.id}/auditorias`);
      if (response.ok) {
        const data = await response.json();
        setAuditorias(data);
        if (activeAuditoria) {
           const updated = data.find(a => a.id === activeAuditoria.id);
           setActiveAuditoria(updated || null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyProfile]);

  const saveAuditoria = async () => {
    if (!formAuditoria.objeto.trim()) {
      alert("Por favor ingrese el alcance o objeto de la auditoría");
      return;
    }
    if (!formAuditoria.auditor_lider.trim()) {
      alert("Por favor ingrese el nombre del auditor");
      return;
    }
    if (!formAuditoria.fecha_programada) {
      alert("Por favor seleccione la fecha programada");
      return;
    }

    try {
      const response = await api('/empresas/auditorias', {
        method: 'POST',
        body: JSON.stringify({ ...formAuditoria, empresa_id: companyProfile.id })
      });
      if (response.ok) {
        setShowAuditoriaModal(false);
        setFormAuditoria({ tipo: 'interna', objeto: '', auditor_lider: '', fecha_programada: '' });
        fetchData();
        alert("✓ Auditoría creada exitosamente");
      } else {
        alert("Error al guardar la auditoría");
      }
    } catch (e) { console.error(e); }
  };

  const saveHallazgo = async () => {
    if (!formHallazgo.descripcion.trim()) {
      alert("Por favor ingrese la descripción del hallazgo");
      return;
    }

    try {
      const response = await api(`/empresas/auditorias/${activeAuditoria.id}/hallazgos`, {
        method: 'POST',
        body: JSON.stringify(formHallazgo)
      });
      if (response.ok) {
        setShowHallazgoModal(false);
        setFormHallazgo({ tipo_hallazgo: 'No Conformidad Menor', descripcion: '', requisito_incumplido: '' });
        fetchData();
        alert("✓ Hallazgo registrado exitosamente");
      }
    } catch (e) { console.error(e); }
  };

  const savePlanAccion = async () => {
    if (!formPlan.plan_accion.trim()) {
       alert("Por favor describa el plan de acción");
       return;
    }
    try {
      const response = await api(`/empresas/hallazgos/${activeHallazgo.id}`, {
        method: 'PUT',
        body: JSON.stringify(formPlan)
      });
      if(response.ok) {
        setShowPlanModal(false);
        setFormPlan({ plan_accion: '', responsable: '', fecha_compromiso: '', estado: 'En Plan de Acción' });
        setActiveHallazgo(null);
        fetchData();
        alert("✓ Plan de Acción guardado con éxito");
      }
    } catch(e) { console.error(e); }
  };

  const cerrarAuditoria = async () => {
    if (!formCierre.recomendaciones.trim()) {
      alert("Por favor agregue el Plan de Acción / Acciones Correctivas.");
      return;
    }
    
    try {
      const response = await api(`/empresas/auditorias/${activeAuditoria.id}/cerrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCierre)
      });
      if (response.ok) {
        setShowCierreModal(false);
        fetchData();
        alert("✓ Auditoría cerrada con su respectivo Plan de Mejora.");
      }
    } catch (e) { console.error(e); }
  };

  const filtered = auditorias.filter(a =>
    `AUD-${a.id}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.objeto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.auditor_lider || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    const colors = {
      'Programada': 'bg-blue-100 text-blue-700',
      'En Proceso': 'bg-yellow-100 text-yellow-700',
      'Realizada': 'bg-green-100 text-green-700',
      'Cancelada': 'bg-gray-100 text-gray-700'
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[estado] || colors['Programada']}`}>{estado}</span>;
  };

  // Render Detalle Auditoria
  if (activeAuditoria) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-start">
            <div>
              <button onClick={() => setActiveAuditoria(null)} className="text-gray-500 hover:text-gray-900 text-sm mb-4 flex items-center font-bold">
                 ← Volver al Programa Anual de Auditorías
              </button>
              <h2 className="text-2xl font-black text-gray-800 mb-1 flex items-center">
                <Target className="w-6 h-6 text-indigo-600 mr-2" />
                AUD-{activeAuditoria.id} - {activeAuditoria.objeto}
              </h2>
              <div className="flex gap-4 mt-3 text-sm text-gray-600">
                 <span className="flex items-center"><CalendarClock className="w-4 h-4 mr-1"/> Prog: {activeAuditoria.fecha_programada}</span>
                 <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1"/> Auditor: {activeAuditoria.auditor_lider}</span>
                 <span className="flex items-center capitalize">Perfil: {activeAuditoria.tipo}</span>
                 {getEstadoBadge(activeAuditoria.estado)}
              </div>
            </div>
            {activeAuditoria.estado !== 'Realizada' && activeAuditoria.estado !== 'Cancelada' && (
              <button onClick={() => setShowCierreModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow flex items-center transition-colors text-sm">
                 <CheckCircle className="w-4 h-4 mr-2" /> Redactar Cierre y Plan de Acción
              </button>
            )}
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-gray-800 flex items-center">
                 <ListTodo className="w-5 h-5 mr-2 text-indigo-600"/> Registro de Hallazgos y Desviaciones
               </h3>
               {activeAuditoria.estado !== 'Realizada' && activeAuditoria.estado !== 'Cancelada' && (
               <button onClick={() => setShowHallazgoModal(true)} className="text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center">
                  <PlusCircle className="w-4 h-4 mr-1"/> Levantar Hallazgo
               </button>
               )}
            </div>

            <div className="p-0">
               {(!activeAuditoria.hallazgos_legales || activeAuditoria.hallazgos_legales.length === 0) ? (
                 <div className="p-12 text-center text-gray-500">
                   Aún no hay hallazgos registrados para esta auditoría. ¡Buen desempeño!
                 </div>
               ) : (
                 <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50 text-gray-600 font-medium">
                     <tr>
                       <th className="py-3 px-6">Tipo</th>
                       <th className="py-3 px-6">Hallazgo / Incumplimiento</th>
                       <th className="py-3 px-6 max-w-sm">Requisito Legal</th>
                       <th className="py-3 px-6 text-center">Estado / Plan de Acción</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {activeAuditoria.hallazgos_legales.map(h => (
                         <tr key={h.id} className="hover:bg-gray-50">
                            <td className="py-4 px-6 font-semibold flex items-center gap-2">
                               {h.tipo_hallazgo === 'Oportunidad de Mejora' ? <Lightbulb className="text-yellow-500 w-4 h-4"/> : <AlertTriangle className="text-rose-500 w-4 h-4"/>}
                               {h.tipo_hallazgo}
                            </td>
                            <td className="py-4 px-6 text-gray-700">
                               {h.descripcion}
                               {h.plan_accion && (
                                  <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs flex flex-col gap-1">
                                     <div className="font-bold text-indigo-700">Responsable: {h.responsable} (Cierre: {h.fecha_compromiso})</div>
                                     <div className="text-indigo-900">{h.plan_accion}</div>
                                  </div>
                               )}
                            </td>
                            <td className="py-4 px-6">
                               {h.requisito_incumplido ? <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">{h.requisito_incumplido}</span> : <span className="text-gray-400">N/A</span>}
                            </td>
                            <td className="py-4 px-6">
                               <div className="flex flex-col items-center gap-2">
                                 <span className={`px-2 py-1 rounded text-xs font-bold ${h.estado === 'Cerrado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{h.estado}</span>
                                 {activeAuditoria.estado !== 'Realizada' && (
                                    <button 
                                      onClick={() => {
                                         setActiveHallazgo(h);
                                         setFormPlan({ plan_accion: h.plan_accion || '', responsable: h.responsable || '', fecha_compromiso: h.fecha_compromiso || '', estado: h.estado });
                                         setShowPlanModal(true);
                                      }}
                                      className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded border border-indigo-200 w-full text-center"
                                    >
                                       {h.plan_accion ? 'Editar Plan' : 'Asignar Plan'}
                                    </button>
                                 )}
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                 </table>
               )}
            </div>
         </div>

         {/* SECCIÓN VISIBLE CUANDO LA AUDITORÍA ESTÁ CERRADA (VER ACCIONES) */}
         {activeAuditoria.estado === 'Realizada' && (
           <div className="bg-indigo-50/50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden mb-6">
               <div className="p-4 border-b border-indigo-100 flex items-center bg-indigo-100/50">
                  <ShieldCheck className="w-5 h-5 mr-2 text-indigo-700"/>
                  <h3 className="font-bold text-indigo-900">Informe Final (Plan de Acción y Conclusiones)</h3>
               </div>
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">Dictamen de la Auditoría</h4>
                     <p className="text-sm font-semibold capitalize text-indigo-900">{activeAuditoria.resultado?.replace('_', ' ')}</p>
                  </div>
                  <div className="md:col-span-2">
                     <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">Acciones Correctivas / Plan de Mejora</h4>
                     <div className="bg-white p-4 font-medium text-gray-700 text-sm whitespace-pre-wrap rounded-xl border border-indigo-50">
                        {activeAuditoria.recomendaciones || 'Sin acciones levantadas'}
                     </div>
                  </div>
                  <div className="md:col-span-2">
                     <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">Conclusiones Generales</h4>
                     <div className="bg-white p-4 font-medium text-gray-700 text-sm whitespace-pre-wrap rounded-xl border border-indigo-50">
                        {activeAuditoria.conclusiones || 'Sin conclusiones listadas'}
                     </div>
                  </div>
               </div>
           </div>
         )}

         {/* Modal Hallazgo */}
         {showHallazgoModal && (
           <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-rose-50">
                 <h3 className="text-lg font-bold text-rose-800 flex items-center">
                   <AlertTriangle className="w-5 h-5 mr-2" /> Registrar Hallazgo
                 </h3>
                 <button onClick={() => setShowHallazgoModal(false)} className="text-rose-400 hover:text-rose-600"><X className="w-5 h-5"/></button>
               </div>
               <div className="p-6 space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Hallazgo *</label>
                   <select
                     value={formHallazgo.tipo_hallazgo}
                     onChange={(e) => setFormHallazgo({...formHallazgo, tipo_hallazgo: e.target.value})}
                     className="w-full rounded-lg border-gray-200 text-sm focus:ring-rose-500 focus:border-rose-500"
                   >
                     <option>No Conformidad Mayor</option>
                     <option>No Conformidad Menor</option>
                     <option>Oportunidad de Mejora</option>
                     <option>Observación</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Descripción *</label>
                   <textarea
                     rows="3"
                     value={formHallazgo.descripcion}
                     onChange={(e) => setFormHallazgo({...formHallazgo, descripcion: e.target.value})}
                     placeholder="Describa el hallazgo encontrado..."
                     className="w-full rounded-lg border-gray-200 text-sm focus:ring-rose-500 focus:border-rose-500"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Requisito Legal Incumplido</label>
                   <input
                     type="text"
                     value={formHallazgo.requisito_incumplido}
                     onChange={(e) => setFormHallazgo({...formHallazgo, requisito_incumplido: e.target.value})}
                     placeholder="Ej: Decreto 1072 - Art 2.2.4.6.29"
                     className="w-full rounded-lg border-gray-200 text-sm focus:ring-rose-500 focus:border-rose-500"
                   />
                 </div>
                 <div className="flex justify-end gap-3 pt-4 border-t">
                   <button onClick={() => setShowHallazgoModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancelar</button>
                   <button onClick={saveHallazgo} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg">Registrar Hallazgo</button>
                 </div>
               </div>
             </div>
           </div>
         )}

          {/* Modal Plan de Accion Individual */}
          {showPlanModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
                  <h3 className="text-lg font-bold text-indigo-800 flex items-center">
                    <Target className="w-5 h-5 mr-2" /> Plan de Acción / CAPA
                  </h3>
                  <button onClick={() => setShowPlanModal(false)} className="text-indigo-400 hover:text-indigo-600"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-4 shadow-inner bg-gray-50/50">
                  <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 mb-2">
                     <span className="font-bold block mb-1">Hallazgo:</span>
                     {activeHallazgo?.descripcion}
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-700 mb-1">Actividades del Plan de Mejora *</label>
                     <textarea
                       rows="3"
                       value={formPlan.plan_accion}
                       onChange={(e) => setFormPlan({...formPlan, plan_accion: e.target.value})}
                       placeholder="¿Qué acciones documentadas se realizarán para subsanar el hallazgo?"
                       className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Responsable *</label>
                        <input
                          type="text"
                          value={formPlan.responsable}
                          onChange={(e) => setFormPlan({...formPlan, responsable: e.target.value})}
                          placeholder="Nombre o Cargo"
                          className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Compromiso *</label>
                        <input
                          type="date"
                          value={formPlan.fecha_compromiso}
                          onChange={(e) => setFormPlan({...formPlan, fecha_compromiso: e.target.value})}
                          className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                     </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Estado de la Acción</label>
                    <select
                      value={formPlan.estado}
                      onChange={(e) => setFormPlan({...formPlan, estado: e.target.value})}
                      className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                    >
                      <option value="Abierto">Abierto</option>
                      <option value="En Plan de Acción">En Plan de Acción</option>
                      <option value="Cerrado">Cerrado / Verificado</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                    <button onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancelar</button>
                    <button onClick={savePlanAccion} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm">
                       Guardar Plan (PAC)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Informe y Plan de Acción */}
          {showCierreModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
                  <h3 className="text-lg font-bold text-indigo-800 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2" /> Informe Final y Plan de Acción
                  </h3>
                  <button onClick={() => setShowCierreModal(false)} className="text-indigo-400 hover:text-indigo-600"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Resultado del Dictamen *</label>
                    <select
                      value={formCierre.resultado}
                      onChange={(e) => setFormCierre({...formCierre, resultado: e.target.value})}
                      className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                    >
                      <option value="cumple">Cumple Definitivamente</option>
                      <option value="observaciones">Cumple con Observaciones</option>
                      <option value="no_cumple">No Cumple</option>
                      <option value="nc_mayores">No Conformidades Mayores Críticas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Acciones Correctivas / Plan de Mejora (PAC) *</label>
                    <textarea
                      rows="4"
                      value={formCierre.recomendaciones}
                      onChange={(e) => setFormCierre({...formCierre, recomendaciones: e.target.value})}
                      placeholder="Enumere explícitamente qué acciones tomará la empresa para corregir los hallazgos reportados en esta auditoría..."
                      className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Conclusiones del Auditor</label>
                    <textarea
                      rows="3"
                      value={formCierre.conclusiones}
                      onChange={(e) => setFormCierre({...formCierre, conclusiones: e.target.value})}
                      placeholder="Describa el resumen de la eficacia del SG-SST..."
                      className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-xs font-medium flex items-start mt-4 border border-orange-100">
                     <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                     <span>Una vez guardado este dictamen y plan de mejora, la auditoría se marcará en estado "Realizada" ante la ley y no se podrán agregar más hallazgos.</span>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                    <button onClick={() => setShowCierreModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancelar</button>
                    <button onClick={cerrarAuditoria} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm">
                       Formalizar Cierre y PAC
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }

  // Render Lista Principal
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
                <ShieldCheck className="w-8 h-8 text-indigo-600 mr-3" />
                Auditorías SG-SST
              </h2>
              <p className="text-sm text-gray-500 max-w-xl">
                Programa de auditorías internas y externas según ISO 45001 y Res. 0312/2019.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <button
                onClick={() => {
                  setFormAuditoria({ tipo: 'interna', objeto: '', auditor_lider: '', fecha_programada: '' });
                  setShowAuditoriaModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center transition-colors text-sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Nueva Auditoría
              </button>
            </div>
          </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Total</p>
              <p className="text-2xl font-bold text-gray-800">{auditorias.length}</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Programadas</p>
              <p className="text-2xl font-bold text-blue-600">{auditorias.filter(a => a.estado === 'Programada').length}</p>
            </div>
            <CalendarClock className="w-8 h-8 text-blue-300" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">En Proceso</p>
              <p className="text-2xl font-bold text-yellow-600">{auditorias.filter(a => a.estado === 'En Proceso').length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Realizadas</p>
              <p className="text-2xl font-bold text-green-600">{auditorias.filter(a => a.estado === 'Realizada').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-300" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, alcance o auditor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-4 px-6">Código</th>
                <th className="py-4 px-6">Alcance</th>
                <th className="py-4 px-6">Auditor</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-gray-500">No hay auditorías registradas</td></tr>
              ) : (
                filtered.map(aud => (
                  <tr key={aud.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-indigo-600">AUD-{aud.id}</td>
                    <td className="py-4 px-6 font-medium text-gray-800">{aud.objeto}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium">{aud.auditor_lider}</div>
                      <div className="text-xs text-gray-400 capitalize">{aud.tipo}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-gray-700">
                        <CalendarClock className="w-4 h-4 mr-1 text-gray-400" />
                        {aud.fecha_programada}
                      </div>
                      {aud.fecha_realizacion && (
                        <div className="text-xs text-green-600 mt-1">Realizada: {aud.fecha_realizacion}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">{getEstadoBadge(aud.estado)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setActiveAuditoria(aud)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver / Gestionar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
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
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
              <h3 className="text-lg font-bold text-indigo-800 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2" /> Nueva Auditoría
              </h3>
              <button onClick={() => setShowAuditoriaModal(false)} className="text-indigo-400 hover:text-indigo-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alcance / Objeto *</label>
                <input
                  type="text"
                  value={formAuditoria.objeto}
                  onChange={(e) => setFormAuditoria({...formAuditoria, objeto: e.target.value})}
                  placeholder="Ej: Auditoría al sistema de gestión de seguridad y salud en el trabajo"
                  className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Auditor Líder *</label>
                <input
                  type="text"
                  value={formAuditoria.auditor_lider}
                  onChange={(e) => setFormAuditoria({...formAuditoria, auditor_lider: e.target.value})}
                  placeholder="Nombre completo del auditor"
                  className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Perfil del Auditor *</label>
                <select
                  value={formAuditoria.tipo}
                  onChange={(e) => setFormAuditoria({...formAuditoria, tipo: e.target.value})}
                  className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="interna">Interno</option>
                  <option value="externa">Externo</option>
                  <option value="proveedores">De ARL / COPASST</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Programada *</label>
                <input
                  type="date"
                  value={formAuditoria.fecha_programada}
                  onChange={(e) => setFormAuditoria({...formAuditoria, fecha_programada: e.target.value})}
                  className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowAuditoriaModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveAuditoria}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
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
