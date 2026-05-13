import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Search, 
  PlusCircle, 
  Hospital, 
  Edit3, 
  Trash2, 
  Filter, 
  X, 
  Users,
  Download,
  AlertCircle,
  Clock,
  HeartPulse
} from 'lucide-react';
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

const CAUSAS = [
  'Enfermedad Común',
  'Enfermedad Laboral',
  'Accidente de Trabajo',
  'Accidente Común',
  'Licencia Maternidad/Paternidad',
  'Licencia Luto',
  'Permiso Remunerado',
  'Permiso No Remunerado',
  'Inasistencia Injustificada'
];

export default function Ausentismos({ companyProfile }) {
  const [ausentismos, setAusentismos] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCausa, setFilterCausa] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDiagnosticoHelper, setShowDiagnosticoHelper] = useState(false);

  const [form, setForm] = useState({
    trabajador_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    dias_incapacidad: '',
    causa: 'Enfermedad Común',
    diagnostico: '',
    observaciones: ''
  });

  const fetchData = async () => {
    if (!companyProfile?.id) return;
    setLoading(true);
    try {
      const [ausRes, trabRes] = await Promise.all([
        api(`/empresas/${companyProfile.id}/ausentismos`),
        api(`/empresas/${companyProfile.id}/trabajadores`)
      ]);

      if (ausRes.ok) {
        const data = await ausRes.json();
        setAusentismos(data);
      }
      if (trabRes.ok) {
        const data = await trabRes.json();
        setTrabajadores(data);
      }
    } catch (e) {
      console.error("Error cargando datos de ausentismos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyProfile]);

  const handleEdit = (aus) => {
    setEditingId(aus.id);
    
    // Asegurar formato YYYY-MM-DD para inputs de tipo date
    const sanitizeDate = (dateStr) => {
      if (!dateStr) return '';
      return dateStr.split('T')[0]; // Toma solo la parte de la fecha si viene con ISO string
    };

    setForm({
      trabajador_id: aus.trabajador_id,
      fecha_inicio: sanitizeDate(aus.fecha_inicio),
      fecha_fin: sanitizeDate(aus.fecha_fin),
      dias_incapacidad: aus.dias_incapacidad,
      causa: aus.causa,
      diagnostico: aus.diagnostico || '',
      observaciones: aus.observaciones || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este registro de ausencia?')) return;
    try {
      const response = await api(`/ausentismos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchData();
        // Opcional: Notificación silenciosa
      } else {
        alert("Error al eliminar el registro");
      }
    } catch (e) {
      console.error("Error eliminando ausentismo", e);
    }
  };

  const saveAusentismo = async () => {
    const errors = [];
    if (!form.trabajador_id) errors.push('Seleccione un trabajador');
    if (!form.fecha_inicio) errors.push('Fecha de Inicio');
    if (!form.fecha_fin) errors.push('Fecha de Fin');
    if (!form.dias_incapacidad) errors.push('Días de Incapacidad');
    if (!form.causa) errors.push('Causa');

    const causasMedicas = ['Enfermedad Común', 'Enfermedad Laboral', 'Accidente de Trabajo', 'Accidente Común'];
    if (causasMedicas.includes(form.causa) && !form.diagnostico?.trim()) {
      errors.push('Diagnóstico Médico (CIE-10 / Detalle)');
    }

    if (errors.length > 0) {
      alert("Por favor complete los siguientes campos:\n\n• " + errors.join('\n• '));
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/ausentismos/${editingId}` : '/ausentismos';
      
      const response = await api(url, {
        method,
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingId(null);
        setForm({
          trabajador_id: '', fecha_inicio: '', fecha_fin: '',
          dias_incapacidad: '', causa: 'Enfermedad Común', diagnostico: '', observaciones: ''
        });
        fetchData();
      } else {
        const errorData = await response.json();
        alert("Error al guardar: " + (errorData.message || errorData.error || 'Verifique los datos'));
      }
    } catch (e) {
      console.error("Error guardando ausentismo", e);
      alert("Error de conexión");
    }
  };

  const filteredAusentismos = ausentismos.filter(a => {
    const matchesSearch = a.trabajador?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.trabajador?.documento?.includes(searchTerm);
    const matchesCausa = filterCausa === '' || a.causa === filterCausa;
    return matchesSearch && matchesCausa;
  });

  const filteredCie10 = CIE10_COMMON_CODES.filter(code =>
    form.diagnostico && code.toLowerCase().includes(form.diagnostico.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
              <CalendarClock className="w-8 h-8 text-rose-500 mr-3" />
              Gestión de Ausentismos
            </h2>
            <p className="text-sm text-gray-500 max-w-xl">
              Registre y controle las incapacidades médicas, licencias y permisos del personal. Crucial para el cálculo de indicadores de salud.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-3">
            <button 
              onClick={() => { setEditingId(null); setForm({ trabajador_id: '', fecha_inicio: '', fecha_fin: '', dias_incapacidad: '', causa: 'Enfermedad Común', diagnostico: '', observaciones: '' }); setShowModal(true); }} 
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm flex items-center transition-all hover:scale-105"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Nueva Incapacidad
            </button>
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mr-4">
            <Hospital className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Incapacidades</p>
            <h4 className="text-2xl font-black text-gray-800">{ausentismos.length}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mr-4">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Días Totales Perdidos</p>
            <h4 className="text-2xl font-black text-gray-800">
              {ausentismos.reduce((acc, curr) => acc + parseInt(curr.dias_incapacidad || 0), 0)}
            </h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Trabajadores Afectados</p>
            <h4 className="text-2xl font-black text-gray-800">
              {new Set(ausentismos.map(a => a.trabajador_id)).size}
            </h4>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por trabajador o documento..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 w-full rounded-xl border-gray-200 text-sm py-2.5 focus:ring-rose-500 focus:border-rose-500" 
            />
          </div>
          <div className="w-full md:w-64">
            <select 
              value={filterCausa} 
              onChange={(e) => setFilterCausa(e.target.value)}
              className="w-full rounded-xl border-gray-200 text-sm py-2.5 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="">Todas las causas</option>
              {CAUSAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-4 px-6">Trabajador</th>
                <th className="py-4 px-6">Periodo</th>
                <th className="py-4 px-6 text-center">Días</th>
                <th className="py-4 px-6">Causa y Diagnóstico</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="py-10 text-center text-gray-400">Cargando registros...</td></tr>
              ) : filteredAusentismos.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-800">{a.trabajador?.nombre_completo}</div>
                    <div className="text-xs text-gray-400">{a.trabajador?.documento}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-xs">Desde: {a.fecha_inicio}</span>
                      <span className="text-gray-800 font-semibold">Hasta: {a.fecha_fin}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-block px-3 py-1 bg-rose-50 text-rose-600 font-black rounded-lg text-xs">
                      {a.dias_incapacidad} DÍAS
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-700">{a.causa}</div>
                    <div className="text-[11px] text-gray-500 mt-1 italic line-clamp-1" title={a.diagnostico}>
                      {a.diagnostico || 'Sin diagnóstico especificado'}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(a)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredAusentismos.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <CalendarClock className="w-12 h-12 mb-2" />
                      <p className="font-bold">No se encontraron ausentismos</p>
                      <p className="text-xs">Intente cambiar los filtros o registre una nueva incapacidad</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-rose-50">
              <div>
                <h3 className="text-xl font-black text-rose-800 flex items-center">
                  <Hospital className="w-6 h-6 mr-2 text-rose-600" />
                  {editingId ? 'Editar Registro Médico' : 'Reportar Ausencia / Incapacidad'}
                </h3>
                <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest mt-1">Módulo de Gestión de Salud</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white p-2 rounded-full shadow-sm text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Selección de Trabajador */}
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Trabajador Afectado *</label>
                <div className="relative">
                   <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                   <select 
                    value={form.trabajador_id} 
                    onChange={e => setForm({ ...form, trabajador_id: e.target.value })} 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-bold text-gray-700 appearance-none"
                    disabled={!!editingId}
                   >
                    <option value="">Seleccione al empleado...</option>
                    {trabajadores.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre_completo} ({t.documento})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha Inicio *</label>
                  <input 
                    type="date" 
                    value={form.fecha_inicio} 
                    onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-bold text-gray-700" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha Fin *</label>
                  <input 
                    type="date" 
                    value={form.fecha_fin} 
                    onChange={e => setForm({ ...form, fecha_fin: e.target.value })} 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-bold text-gray-700" 
                  />
                </div>
              </div>

              {/* Días y Causa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Días Totales *</label>
                  <input 
                    type="number" 
                    min="1" 
                    placeholder="Ej: 3"
                    value={form.dias_incapacidad} 
                    onChange={e => setForm({ ...form, dias_incapacidad: e.target.value })} 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-bold text-gray-700" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Causa Legal *</label>
                  <select 
                    value={form.causa} 
                    onChange={e => setForm({ ...form, causa: e.target.value })} 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-bold text-gray-700"
                  >
                    {CAUSAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Diagnóstico CIE-10 */}
              {['Enfermedad Común', 'Enfermedad Laboral', 'Accidente de Trabajo', 'Accidente Común'].includes(form.causa) && (
                <div className="relative">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Diagnóstico (CIE-10 o Detalle) *</span>
                    <span className="text-[9px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded flex items-center">⭐ Asistente IA</span>
                  </label>
                  <input
                    type="text"
                    value={form.diagnostico}
                    onChange={e => {
                      setForm({ ...form, diagnostico: e.target.value });
                      setShowDiagnosticoHelper(true);
                    }}
                    onFocus={() => setShowDiagnosticoHelper(true)}
                    onBlur={() => setTimeout(() => setShowDiagnosticoHelper(false), 200)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-bold text-gray-700"
                    placeholder="Ej: 'cefalea' o 'M545'..."
                  />
                  {showDiagnosticoHelper && form.diagnostico.length > 2 && filteredCie10.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-rose-100 rounded-2xl shadow-xl overflow-hidden text-sm">
                      {filteredCie10.map(cie => (
                        <div
                          key={cie}
                          className="px-4 py-3 hover:bg-rose-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                          onClick={() => {
                            setForm({ ...form, diagnostico: cie });
                            setShowDiagnosticoHelper(false);
                          }}
                        >
                          <span className="font-black text-rose-700 mr-2">{cie.split(' ')[0]}</span>
                          <span className="text-gray-600 font-medium">{cie.substring(cie.indexOf(' ') + 1)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Observaciones Internas</label>
                <textarea 
                  rows="3" 
                  value={form.observaciones} 
                  onChange={e => setForm({ ...form, observaciones: e.target.value })} 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-medium text-gray-700 resize-none" 
                  placeholder="Detalles adicionales sobre el reposo o seguimiento..."
                ></textarea>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={saveAusentismo} 
                className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-rose-200 transition-all hover:scale-105"
              >
                {editingId ? 'Actualizar Registro' : 'Confirmar Reporte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
