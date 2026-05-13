import React, { useState, useEffect } from 'react';
import { Users, UserPlus, HeartPulse, Hospital, CalendarClock, Eye, Search, PlusCircle, AlertCircle, Phone, Save, X, Edit3, Trash2 } from 'lucide-react';
import { api } from './services/api';

const CIE10_COMMON_CODES = [
  "A099 Gastroenteritis y colitis",
  "F329 Trastorno depresivo, no especificado",
  "F411 Trastorno de ansiedad generalizada",
  "F432 Trastorno de adaptación (estrés)",
  "H109 Conjuntivitis, no especificada",
  "J00X Rinofaringitis aguda (resfriado común)",
  "J019 Sinusitis aguda, no especificada",
  "J029 Faringitis aguda, no especificada",
  "J039 Amigdalitis aguda, no especificada",
  "J069 Infección aguda de las vías respiratorias",
  "J111 Gripe, con otras manifestaciones respiratorias",
  "J209 Bronquitis aguda, no especificada",
  "M255 Dolor en articulación",
  "M542 Cervicalgia (dolor cuello)",
  "M544 Lumbago con ciática",
  "M545 Lumbago no especificado (dolor lumbar)",
  "M549 Dorsalgia",
  "M654 Tenosinovitis radial (de Quervain)",
  "M751 Síndrome del manguito rotatorio",
  "M770 Epicondilitis media",
  "M771 Epicondilitis lateral (codo de tenista)",
  "M791 Mialgia (dolor muscular)",
  "M796 Dolor en extremidades",
  "N946 Dismenorrea (cólicos fuertes)",
  "R51X Cefalea (dolor de cabeza)",
  "R53X Malestar y fatiga",
  "S000 Traumatismo superficial de la cabeza",
  "S134 Esguince de columna cervical",
  "S525 Fractura de radio",
  "S602 Contusión de muñeca/mano",
  "S610 Herida de dedo de la mano",
  "S626 Fractura de dedos de la mano",
  "S800 Contusión de la rodilla",
  "S934 Esguinces y torceduras del tobillo"
];

export default function Trabajadores({ companyProfile }) {
  const [activeTab, setActiveTab] = useState('directorio');
  const [trabajadores, setTrabajadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showTrabajadorModal, setShowTrabajadorModal] = useState(false);
  const [showAusenciaModal, setShowAusenciaModal] = useState(false);
  const [showDiagnosticoHelper, setShowDiagnosticoHelper] = useState(false);
  const [editingTrabajadorId, setEditingTrabajadorId] = useState(null);

  // Form States
  const [trabajadorForm, setTrabajadorForm] = useState({
    nombre_completo: '', documento: '', cargo: '', fecha_ingreso: '', estado: 'activo',
    tipo_sangre: '', contacto_emergencia_nombre: '', contacto_emergencia_telefono: ''
  });
  const [ausenciaForm, setAusenciaForm] = useState({
    trabajador_id: '', fecha_inicio: '', fecha_fin: '', dias_incapacidad: '', causa: 'Enfermedad Común', diagnostico: '', observaciones: ''
  });

  const fetchData = async () => {
    if (!companyProfile?.id) return;
    try {
      const response = await api(`/empresas/${companyProfile.id}/trabajadores`);
      if (response.ok) {
        const data = await response.json();
        setTrabajadores(data);
      }
    } catch (e) {
      console.error("Error cargando trabajadores", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyProfile]);

  const editTrabajador = (trabajador) => {
    setTrabajadorForm({
      nombre_completo: trabajador.nombre_completo || '',
      documento: trabajador.documento || '',
      cargo: trabajador.cargo || '',
      fecha_ingreso: trabajador.fecha_ingreso || '',
      estado: trabajador.estado || 'activo',
      tipo_sangre: trabajador.tipo_sangre || '',
      contacto_emergencia_nombre: trabajador.contacto_emergencia_nombre || '',
      contacto_emergencia_telefono: trabajador.contacto_emergencia_telefono || '',
      auditor: trabajador.auditor || ''
    });
    setEditingTrabajadorId(trabajador.id);
    setShowTrabajadorModal(true);
  };

  const deleteTrabajador = async (id) => {
    if (!confirm('¿Estás seguro de inactivar a este trabajador?')) return;
    try {
      const response = await api(`/empresas/trabajadores/${id}`, {
        method: 'delete'
      });
      if (response.ok) {
        fetchData();
        alert("✓ Trabajador inactivado correctamente");
      } else {
        alert("Error al inactivar el trabajador");
      }
    } catch (e) {
      console.error("Error inactivando trabajador", e);
      alert("Error de conexión");
    }
  };

  // Handle Save Worker
  const saveTrabajador = async () => {
    // Validación de campos obligatorios
    const errors = [];
    if (!trabajadorForm.nombre_completo?.trim()) errors.push('Nombre Completo');
    if (!trabajadorForm.tipo_sangre) errors.push('Tipo de Sangre');
    if (!trabajadorForm.contacto_emergencia_nombre?.trim()) errors.push('Nombre Contacto de Emergencia');
    if (!trabajadorForm.contacto_emergencia_telefono?.trim()) errors.push('Teléfono de Emergencia');

    if (errors.length > 0) {
      alert("Por favor complete los siguientes campos obligatorios:\n\n• " + errors.join('\n• '));
      return;
    }

    try {
      const method = editingTrabajadorId ? 'PUT' : 'POST';
      const url = editingTrabajadorId
        ? `/empresas/trabajadores/${editingTrabajadorId}`
        : '/empresas/trabajadores';

      const response = await api(url, {
        method,
        body: JSON.stringify({ ...trabajadorForm, empresa_id: companyProfile.id })
      });

      if (response.ok) {
        setShowTrabajadorModal(false);
        setEditingTrabajadorId(null);
        setTrabajadorForm({
          nombre_completo: '', documento: '', cargo: '', fecha_ingreso: '',
          estado: 'activo', tipo_sangre: '',
          contacto_emergencia_nombre: '', contacto_emergencia_telefono: ''
        });
        fetchData();
        alert(`✓ Trabajador ${editingTrabajadorId ? 'actualizado' : 'registrado'} exitosamente`);
      } else {
        const errorData = await response.json();
        alert("Error al guardar: " + (errorData.message || errorData.error || 'Verifique los datos'));
      }
    } catch (e) {
      console.error("Error guardando trabajador", e);
      alert("Error de conexión. Verifique que el servidor esté activo.");
    }
  };

  // Handle Save Absence
  const saveAusencia = async () => {
    const errors = [];
    if (!ausenciaForm.trabajador_id) errors.push('Seleccione un trabajador');
    if (!ausenciaForm.fecha_inicio) errors.push('Fecha de Inicio');
    if (!ausenciaForm.fecha_fin) errors.push('Fecha de Fin');
    if (!ausenciaForm.dias_incapacidad) errors.push('Días de Incapacidad');
    if (!ausenciaForm.causa) errors.push('Causa');

    const causasMedicas = ['Enfermedad Común', 'Enfermedad Laboral', 'Accidente de Trabajo', 'Accidente Común'];
    if (causasMedicas.includes(ausenciaForm.causa) && !ausenciaForm.diagnostico?.trim()) {
      errors.push('Diagnóstico Médico (CIE-10 / Detalle)');
    }

    if (errors.length > 0) {
      alert("Por favor complete los siguientes campos:\n\n• " + errors.join('\n• '));
      return;
    }

    try {
      const response = await api(`/ausentismos`, {
        method: 'POST',
        body: JSON.stringify(ausenciaForm)
      });
      if (response.ok) {
        setShowAusenciaModal(false);
        setAusenciaForm({
          trabajador_id: '', fecha_inicio: '', fecha_fin: '',
          dias_incapacidad: '', causa: 'Enfermedad Común', diagnostico: '', observaciones: ''
        });
        fetchData();
        alert("✓ Incapacidad registrada exitosamente");
      } else {
        const errorData = await response.json();
        alert("Error al guardar la incapacidad: " + (errorData.message || errorData.error || 'Verifique los datos'));
      }
    } catch (e) {
      console.error("Error guardando ausencia", e);
      alert("Error de conexión. Verifique que el servidor esté activo.");
    }
  };

  // Filtros
  const filteredTrabajadores = trabajadores.filter(t => t.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) || t.documento?.includes(searchTerm));

  // Aplanar todas las ausencias para el Tab 2
  const todasAusencias = trabajadores.flatMap(t =>
    (t.ausentismos || []).map(a => ({ ...a, trabajador_nombre: t.nombre_completo }))
  ).sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));

  const filteredCie10 = CIE10_COMMON_CODES.filter(code =>
    ausenciaForm.diagnostico && code.toLowerCase().includes(ausenciaForm.diagnostico.toLowerCase())
  ).slice(0, 5); // top 5 suggestions

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
              <Users className="w-8 h-8 text-orange-500 mr-3" />
              Control de Trabajadores
            </h2>
            <p className="text-sm text-gray-500 max-w-xl">
              Directorio laboral y registros de ausentismo médico. Identifique al personal para integrarlo a incapacidades, accidentes y capacitaciones.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-3">
            <button onClick={() => setShowTrabajadorModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center transition-colors text-sm">
              <UserPlus className="w-4 h-4 mr-2" /> Añadir Empleado
            </button>
            <button onClick={() => setShowAusenciaModal(true)} className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center transition-colors text-sm">
              <Hospital className="w-4 h-4 mr-2" /> Reportar Incapacidad
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toggle Tabs */}
        <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('directorio')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center transition-all ${activeTab === 'directorio' ? 'bg-white shadow-sm border text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Users className="w-4 h-4 mr-2" /> Directorio Oficial ({trabajadores.length})
          </button>
          <button
            onClick={() => setActiveTab('ausentismos')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center transition-all ${activeTab === 'ausentismos' ? 'bg-white shadow-sm border text-rose-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <CalendarClock className="w-4 h-4 mr-2" /> Panel de Ausencias ({todasAusencias.length})
          </button>
        </div>

        {/* Tab 1: Directorio */}
        {activeTab === 'directorio' && (
          <div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Buscar por nombre o documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full rounded-lg border-gray-200 text-sm focus:ring-orange-500 focus:border-orange-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6">Identificación</th>
                    <th className="py-4 px-6">Nombre y Cargo</th>
                    <th className="py-4 px-6 text-center">Ficha Emergencia</th>
                    <th className="py-4 px-6 text-center">Incapacidades</th>
                    <th className="py-4 px-6 text-center">Estado</th>
                    <th className="py-4 px-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTrabajadores.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-800">{t.documento || 'S/N'}</div>
                        <div className="text-xs text-gray-400">Ingreso: {t.fecha_ingreso || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-800">{t.nombre_completo}</div>
                        <div className="text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">{t.cargo || 'Sin Asignar'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center text-xs text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-full mb-1">
                            <HeartPulse className="w-3 h-3 mr-1" /> {t.tipo_sangre || 'N/A'}
                          </div>
                          {(t.contacto_emergencia_nombre || t.contacto_emergencia_telefono) && (
                            <div className="text-[10px] text-gray-500 text-center flex items-center justify-center">
                              <Phone className="w-3 h-3 mr-1" /> {t.contacto_emergencia_nombre} ({t.contacto_emergencia_telefono})
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-xs" title="Total periodos ausente">
                          {t.ausentismos?.length || 0}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {t.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => editTrabajador(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Trabajador">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteTrabajador(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Trabajador">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTrabajadores.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-500">
                        No hay trabajadores registrados en este momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Ausencias */}
        {activeTab === 'ausentismos' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6">Trabajador</th>
                    <th className="py-4 px-6">Fechas</th>
                    <th className="py-4 px-6 text-center">Días Totales</th>
                    <th className="py-4 px-6">Causa Legal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {todasAusencias.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-800">{a.trabajador_nombre}</td>
                      <td className="py-4 px-6">
                        <div className="text-gray-700">{a.fecha_inicio} a</div>
                        <div className="font-semibold text-gray-800">{a.fecha_fin}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">{a.dias_incapacidad} Días</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-700">{a.causa}</div>
                        <div className="text-xs text-gray-500 mt-1">{a.observaciones || 'Sin detalles'}</div>
                      </td>
                    </tr>
                  ))}
                  {todasAusencias.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-gray-500">
                        Excelente, histórico limpio. No hay incapacidades registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuevo Trabajador */}
      {showTrabajadorModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                {editingTrabajadorId ? <Edit3 className="w-5 h-5 mr-2 text-orange-500" /> : <UserPlus className="w-5 h-5 mr-2 text-orange-500" />}
                {editingTrabajadorId ? 'Editar Trabajador' : 'Registrar Trabajador'}
              </h3>
              <button onClick={() => {
                setShowTrabajadorModal(false);
                setEditingTrabajadorId(null);
                setTrabajadorForm({
                  nombre_completo: '', documento: '', cargo: '', fecha_ingreso: '',
                  estado: 'activo', tipo_sangre: '',
                  contacto_emergencia_nombre: '', contacto_emergencia_telefono: ''
                });
              }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo *</label>
                <input type="text" placeholder="Nombre completo" value={trabajadorForm.nombre_completo} onChange={e => setTrabajadorForm({ ...trabajadorForm, nombre_completo: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Cédula</label>
                <input type="text" placeholder="Número de cédula" value={trabajadorForm.documento} onChange={e => setTrabajadorForm({ ...trabajadorForm, documento: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Cargo / Puesto</label>
                <input type="text" placeholder="Cargo / Puesto" value={trabajadorForm.cargo} onChange={e => setTrabajadorForm({ ...trabajadorForm, cargo: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Es auditor *</label>
                <select value={trabajadorForm.auditor} onChange={e => setTrabajadorForm({ ...trabajadorForm, auditor: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold">
                  <option value="">Desconocido</option>
                  <option value="1">Sí</option>
                  <option value="0">No</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Ingreso</label>
                <input type="date" value={trabajadorForm.fecha_ingreso} onChange={e => setTrabajadorForm({ ...trabajadorForm, fecha_ingreso: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
              </div>

              <div className="col-span-2 mt-4 mb-2 pb-2 border-b border-gray-100 flex items-center text-sm font-bold text-rose-600">
                <HeartPulse className="w-4 h-4 mr-2" /> Ficha de Emergencia Clínica (Obligatorio)
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Sangre (RH) *</label>
                <select value={trabajadorForm.tipo_sangre} onChange={e => setTrabajadorForm({ ...trabajadorForm, tipo_sangre: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold">
                  <option value="">Desconocido</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Contacto Emergencia *</label>
                <input type="text" placeholder="Nombre del contacto" value={trabajadorForm.contacto_emergencia_nombre} onChange={e => setTrabajadorForm({ ...trabajadorForm, contacto_emergencia_nombre: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono Emergencia *</label>
                <input type="text" placeholder="Número de teléfono" value={trabajadorForm.contacto_emergencia_telefono} onChange={e => setTrabajadorForm({ ...trabajadorForm, contacto_emergencia_telefono: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowTrabajadorModal(false);
                  setEditingTrabajadorId(null);
                  setTrabajadorForm({
                    nombre_completo: '', documento: '', cargo: '', fecha_ingreso: '',
                    estado: 'activo', tipo_sangre: '',
                    contacto_emergencia_nombre: '', contacto_emergencia_telefono: ''
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => saveTrabajador()}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg shadow transition-colors cursor-pointer"
              >
                {editingTrabajadorId ? 'Guardar Cambios' : 'Guardar Trabajador'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Incapacidad */}
      {showAusenciaModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-rose-50 w-full mb-4">
              <h3 className="text-lg font-bold text-rose-800 flex items-center"><Hospital className="w-5 h-5 mr-2 text-rose-600" /> Reportar Ausencia Médica</h3>
              <button onClick={() => setShowAusenciaModal(false)} className="text-rose-400 hover:text-rose-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Trabajador *</label>
                <select value={ausenciaForm.trabajador_id} onChange={e => setAusenciaForm({ ...ausenciaForm, trabajador_id: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold">
                  <option value="">Seleccione a la persona...</option>
                  {trabajadores.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre_completo} ({t.documento})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Inicio</label>
                  <input type="date" value={ausenciaForm.fecha_inicio} onChange={e => setAusenciaForm({ ...ausenciaForm, fecha_inicio: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Retorno (Fin)</label>
                  <input type="date" value={ausenciaForm.fecha_fin} onChange={e => setAusenciaForm({ ...ausenciaForm, fecha_fin: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Días Incapacidad *</label>
                  <input type="number" min="1" value={ausenciaForm.dias_incapacidad} onChange={e => setAusenciaForm({ ...ausenciaForm, dias_incapacidad: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Causa Exigida *</label>
                  <select value={ausenciaForm.causa} onChange={e => setAusenciaForm({ ...ausenciaForm, causa: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold">
                    <option>Enfermedad Común</option>
                    <option>Enfermedad Laboral</option>
                    <option>Accidente de Trabajo</option>
                    <option>Accidente Común</option>
                    <option>Licencia Maternidad/Paternidad</option>
                    <option>Permiso Remunerado</option>
                  </select>
                </div>
              </div>
              {['Enfermedad Común', 'Enfermedad Laboral', 'Accidente de Trabajo', 'Accidente Común'].includes(ausenciaForm.causa) && (
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>Diagnóstico (CIE-10 o Detalle Clínico) *</span>
                    <span className="text-[10px] text-blue-500 font-normal bg-blue-50 px-2 py-0.5 rounded flex items-center">⭐ Asistente IA Activo</span>
                  </label>
                  <input
                    type="text"
                    value={ausenciaForm.diagnostico}
                    onChange={e => {
                      setAusenciaForm({ ...ausenciaForm, diagnostico: e.target.value });
                      setShowDiagnosticoHelper(true);
                    }}
                    onFocus={() => setShowDiagnosticoHelper(true)}
                    onBlur={() => setTimeout(() => setShowDiagnosticoHelper(false), 200)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    placeholder="Ej: Escribe 'cefalea', 'lumbago' o código CIE-10..."
                  />
                  {showDiagnosticoHelper && ausenciaForm.diagnostico.length > 2 && filteredCie10.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-rose-200 rounded-lg shadow-xl overflow-hidden text-sm">
                      {filteredCie10.map(cie => (
                        <div
                          key={cie}
                          className="px-3 py-2 hover:bg-rose-50 cursor-pointer border-b border-gray-50 last:border-0 truncate"
                          onClick={() => {
                            setAusenciaForm({ ...ausenciaForm, diagnostico: cie });
                            setShowDiagnosticoHelper(false);
                          }}
                        >
                          <span className="font-bold text-rose-700 mr-2">{cie.split(' ')[0]}</span>
                          <span className="text-gray-700">{cie.substring(cie.indexOf(' ') + 1)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Observaciones</label>
                <textarea rows="2" value={ausenciaForm.observaciones} onChange={e => setAusenciaForm({ ...ausenciaForm, observaciones: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" placeholder="Notas adicionales..."></textarea>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setShowAusenciaModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancelar</button>
              <button onClick={saveAusencia} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg shadow cursor-pointer">Cargar Ausencia</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
