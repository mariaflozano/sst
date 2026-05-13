import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Plus,
  Search,
  Trash2,
  Edit3,
  Upload,
  Eye,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Target,
  ChevronRight,
  ClipboardList,
  Activity,
  Settings,
  PieChart,
  BarChart3,
  Users
} from 'lucide-react';
import { api } from './services/api';

const etapas = [
  { id: 'Planear', title: 'Planear', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50', borderColor: 'border-blue-500' },
  { id: 'Hacer', title: 'Hacer', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50', borderColor: 'border-orange-500' },
  { id: 'Verificar', title: 'Verificar', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50', borderColor: 'border-purple-500' },
  { id: 'Actuar', title: 'Actuar', icon: Settings, color: 'text-green-500', bg: 'bg-green-50', borderColor: 'border-green-500' }
];

const estadoColors = {
  'Pendiente': { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: Clock },
  'En Proceso': { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Activity },
  'Completada': { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
  'Vencida': { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
};

const initialFormData = {
  actividad: '',
  estandar_referencia: '',
  phva_etapa: 'Planear',
  categoria: '',
  fecha_inicio: '',
  fecha_fin: '',
  trimestre: 1,
  responsable: '',
  cargo_responsable: '',
  area: '',
  presupuesto: '',
  recurso_necesario: '',
  indicador: '',
  meta: '',
  unidad_meta: '%',
  valor_inicial: '',
  estado: 'Pendiente',
  observaciones: '',
  prioridad: 'Media',
};

export default function PlanAnual({ profile }) {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [activeQuarter, setActiveQuarter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showResumen, setShowResumen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [resumen, setResumen] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Cargar actividades
  useEffect(() => {
    if (!profile?.id) return;
    fetchActividades();
    fetchResumen();
  }, [profile?.id]);

  const fetchActividades = async () => {
    setLoading(true);
    try {
      const res = await api(`/empresas/${profile.id}/plan-anual`);
      if (res.ok) {
        const data = await res.json();
        // El backend devuelve un objeto paginado
        setActividades(data.data || []);
      }
    } catch (err) {
      console.error("Error al cargar actividades:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumen = async () => {
    try {
      const res = await api(`/empresas/${profile.id}/plan-anual/resumen`);
      if (res.ok) {
        const data = await res.json();
        setResumen(data);
      }
    } catch (err) {
      console.error("Error al cargar resumen:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'fecha_inicio' && value) {
      const mes = new Date(value).getUTCMonth() + 1;
      const trimestre = Math.ceil(mes / 3);
      setFormData(prev => ({ ...prev, trimestre }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/plan-anual/${editingId}`
        : '/plan-anual';

      const payload = {
        ...formData,
        empresa_id: profile.id,
        presupuesto: formData.presupuesto ? parseFloat(formData.presupuesto) : null,
        valor_inicial: formData.valor_inicial ? parseFloat(formData.valor_inicial) : null,
      };

      const res = await api(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormData);
        fetchActividades();
        fetchResumen();
      } else {
        const error = await res.json();
        alert("Error al guardar: " + (error.message || "Verifique los datos"));
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (actividad) => {
    setFormData({
      actividad: actividad.actividad || '',
      estandar_referencia: actividad.estandar_referencia || '',
      phva_etapa: actividad.phva_etapa || 'Planear',
      categoria: actividad.categoria || '',
      fecha_inicio: actividad.fecha_inicio || '',
      fecha_fin: actividad.fecha_fin || '',
      trimestre: actividad.trimestre || 1,
      responsable: actividad.responsable || '',
      cargo_responsable: actividad.cargo_responsable || '',
      area: actividad.area || '',
      presupuesto: actividad.presupuesto || '',
      recurso_necesario: actividad.recurso_necesario || '',
      indicador: actividad.indicador || '',
      meta: actividad.meta || '',
      unidad_meta: actividad.unidad_meta || '%',
      valor_inicial: actividad.valor_inicial || '',
      estado: actividad.estado || 'Pendiente',
      observaciones: actividad.observaciones || '',
      prioridad: actividad.prioridad || 'Media',
    });
    setEditingId(actividad.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;
    try {
      const res = await api(`/plan-anual/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchActividades();
        fetchResumen();
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      const res = await api(`/plan-anual/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        fetchActividades();
        fetchResumen();
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const handleGenerateFromDiagnosis = async () => {
    if (!profile?.id) return;
    if (!confirm('Se generarán actividades para todos los estándares NO CUMPLE del diagnóstico. ¿Continuar?')) return;

    setGenerating(true);
    try {
      const res = await api('/plan-anual/generar', {
        method: 'POST',
        body: JSON.stringify({ empresa_id: profile.id }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        fetchActividades();
        fetchResumen();
      }
    } catch (err) {
      console.error("Error al generar:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (e, actividadId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Solo se permiten archivos PDF.');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('id', actividadId);
    formDataUpload.append('archivo', file);

    try {
      // Nota: El api utility maneja los headers. Para FormData, el navegador pone el boundary automáticamente.
      // Dependiendo de cómo esté implementado 'api', podría fallar si fuerza Content-Type application/json.
      const res = await fetch(`http://localhost:8000/api/plan-anual/upload`, {
        method: 'POST',
        body: formDataUpload,
        // No pasamos headers para que el navegador maneje el multipart/form-data
      });
      if (res.ok) {
        fetchActividades();
        fetchResumen();
      }
    } catch (err) {
      console.error("Error al subir evidencia:", err);
    }
  };

  // Filtros
  const filteredActividades = actividades.filter(a => {
    const matchTab = activeTab === 'all' || a.phva_etapa === activeTab;
    const matchQuarter = activeQuarter === 'all' || a.trimestre.toString() === activeQuarter;
    const matchSearch = !searchTerm ||
      a.actividad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.responsable && a.responsable.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.categoria && a.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTab && matchQuarter && matchSearch;
  });

  const getEstadoBadge = (estado) => {
    const colors = estadoColors[estado] || estadoColors['Pendiente'];
    const Icon = colors.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${colors.text} ${colors.bg} ${colors.border}`}>
        <Icon className="w-3 h-3 mr-1" />
        {estado}
      </span>
    );
  };

  const getPrioridadBadge = (prioridad) => {
    const colors = {
      'Alta': 'text-red-600 bg-red-50 border-red-200',
      'Media': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Baja': 'text-green-600 bg-green-50 border-green-200',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[prioridad] || colors['Media']}`}>
        {prioridad}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Plan Anual de Trabajo</h2>
          <p className="text-gray-500 mt-1">SG-SST - Gestión de actividades y seguimiento anual</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={handleGenerateFromDiagnosis}
            disabled={generating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold rounded-xl flex items-center transition-colors shadow-sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {generating ? 'Generando...' : 'Generar desde Diagnóstico'}
          </button>
          <button
            onClick={() => { setFormData(initialFormData); setEditingId(null); setShowForm(true); }}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Actividad
          </button>
          <button
            onClick={() => setShowResumen(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-xl flex items-center transition-colors shadow-sm"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Resumen
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {resumen && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Total</p>
                <p className="text-2xl font-bold text-gray-800">{resumen.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{resumen.completadas}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-300" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">En Proceso</p>
                <p className="text-2xl font-bold text-blue-600">{resumen.en_proceso}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-300" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Avance</p>
                <p className="text-2xl font-bold text-purple-600">{resumen.porcentaje_avance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-300" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Presupuesto</p>
                <p className="text-2xl font-bold text-gray-800">${resumen.presupuesto_total?.toLocaleString('es-CO') || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-300" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filtro PHVA */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase mb-2">Etapa PHVA</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Todas
              </button>
              {etapas.map(etapa => (
                <button
                  key={etapa.id}
                  onClick={() => setActiveTab(etapa.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === etapa.id ? `${etapa.bg} ${etapa.color} border border-current` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {etapa.title}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro Trimestre */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase mb-2">Trimestre</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveQuarter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeQuarter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Todos
              </button>
              {[1, 2, 3, 4].map(q => (
                <button
                  key={q}
                  onClick={() => setActiveQuarter(q.toString())}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeQuarter === q.toString() ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Q{q}
                </button>
              ))}
            </div>
          </div>

          {/* Búsqueda */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase mb-2">Buscar</p>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Actividad, responsable..."
                className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Actividades */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando actividades...</div>
        ) : filteredActividades.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay actividades para mostrar</p>
            <p className="text-sm mt-1">Usa "Generar desde Diagnóstico" o crea una nueva actividad</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-100">#</th>
                  <th className="px-4 py-3 border-b border-gray-100">Actividad</th>
                  <th className="px-4 py-3 border-b border-gray-100">Etapa</th>
                  <th className="px-4 py-3 border-b border-gray-100">Trimestre</th>
                  <th className="px-4 py-3 border-b border-gray-100">Responsable</th>
                  <th className="px-4 py-3 border-b border-gray-100">Estado</th>
                  <th className="px-4 py-3 border-b border-gray-100">Fecha Límite</th>
                  <th className="px-4 py-3 border-b border-gray-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredActividades.map((actividad) => (
                  <tr key={actividad.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{actividad.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{actividad.actividad}</p>
                        {actividad.estandar_referencia && (
                          <span className="text-xs text-gray-400 font-mono">Ref: {actividad.estandar_referencia}</span>
                        )}
                        {actividad.categoria && (
                          <p className="text-[10px] text-blue-500 font-bold uppercase">{actividad.categoria}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const etapa = etapas.find(e => e.id === actividad.phva_etapa);
                        return etapa ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${etapa.bg} ${etapa.color}`}>
                            {etapa.title}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-bold">
                        Q{actividad.trimestre}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-700">{actividad.responsable}</p>
                        {actividad.cargo_responsable && (
                          <p className="text-xs text-gray-400">{actividad.cargo_responsable}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={actividad.estado}
                        onChange={(e) => handleEstadoChange(actividad.id, e.target.value)}
                        className={`text-xs font-bold border rounded-full px-2 py-1 outline-none cursor-pointer ${estadoColors[actividad.estado]?.text} ${estadoColors[actividad.estado]?.bg} ${estadoColors[actividad.estado]?.border}`}
                      >
                        {Object.keys(estadoColors).map(estado => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm">{actividad.fecha_fin}</p>
                        {actividad.presupuesto > 0 && (
                          <p className="text-xs text-gray-400">${parseFloat(actividad.presupuesto).toLocaleString('es-CO')}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {actividad.url_evidencia && (
                          <a
                            href={`http://localhost:8000/storage/${actividad.url_evidencia}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Ver Evidencia"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <label className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Subir Evidencia">
                          <Upload className="w-4 h-4" />
                          <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, actividad.id)} />
                        </label>
                        <button
                          onClick={() => handleEdit(actividad)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(actividad.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? 'Editar Actividad' : 'Nueva Actividad'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-700 p-1 bg-white rounded-lg shadow-sm border border-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Actividad */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actividad *</label>
                  <input
                    type="text"
                    name="actividad"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.actividad}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Referencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referencia Estándar</label>
                  <input
                    type="text"
                    name="estandar_referencia"
                    placeholder="Ej: 2.4.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.estandar_referencia}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Etapa PHVA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etapa PHVA *</label>
                  <select
                    name="phva_etapa"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.phva_etapa}
                    onChange={handleInputChange}
                  >
                    {etapas.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    name="categoria"
                    placeholder="Ej: Planificación, Salud..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.categoria}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Trimestre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre *</label>
                  <select
                    name="trimestre"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.trimestre}
                    onChange={handleInputChange}
                  >
                    <option value={1}>Q1 (Ene - Mar)</option>
                    <option value={2}>Q2 (Abr - Jun)</option>
                    <option value={3}>Q3 (Jul - Sep)</option>
                    <option value={4}>Q4 (Oct - Dic)</option>
                  </select>
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select
                    name="prioridad"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.prioridad}
                    onChange={handleInputChange}
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                {/* Fecha Inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Fecha Fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Responsable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
                  <input
                    type="text"
                    name="responsable"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.responsable}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    name="cargo_responsable"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.cargo_responsable}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Área */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                  <input
                    type="text"
                    name="area"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.area}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Presupuesto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto ($COP)</label>
                  <input
                    type="number"
                    name="presupuesto"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.presupuesto}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Valor Inicial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Inicial Indicador</label>
                  <input
                    type="number"
                    name="valor_inicial"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.valor_inicial}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Recurso */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recursos Necesarios</label>
                  <input
                    type="text"
                    name="recurso_necesario"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.recurso_necesario}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Indicador */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indicador</label>
                  <input
                    type="text"
                    name="indicador"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.indicador}
                    onChange={handleInputChange}
                    placeholder="Ej: % de avance del plan"
                  />
                </div>

                {/* Meta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta</label>
                  <input
                    type="text"
                    name="meta"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.meta}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Unidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <select
                    name="unidad_meta"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.unidad_meta}
                    onChange={handleInputChange}
                  >
                    <option value="%">%</option>
                    <option value="#"># (cantidad)</option>
                    <option value="días">días</option>
                    <option value="pesos">$COP</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    name="estado"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completada">Completada</option>
                    <option value="Vencida">Vencida</option>
                  </select>
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    name="observaciones"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
                >
                  {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Actividad')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resumen */}
      {showResumen && resumen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                Resumen del Plan Anual
              </h3>
              <button onClick={() => setShowResumen(false)} className="text-gray-400 hover:text-gray-700 p-1 bg-white rounded-lg shadow-sm border border-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Indicador Principal */}
              <div className="flex flex-col items-center justify-center mb-8 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-3">Avance General del Plan</p>
                <p className="text-7xl font-black tracking-tighter text-gray-800">
                  {resumen.porcentaje_avance}<span className="text-4xl text-gray-300 font-bold">%</span>
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {resumen.completadas} de {resumen.total} actividades completadas
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 flex flex-col items-center">
                  <Clock className="w-8 h-8 text-orange-600 mb-2" />
                  <span className="text-3xl font-bold text-gray-800">{resumen.pendientes}</span>
                  <span className="text-xs text-orange-700 font-medium">Pendientes</span>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex flex-col items-center">
                  <Activity className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-3xl font-bold text-gray-800">{resumen.en_proceso}</span>
                  <span className="text-xs text-blue-700 font-medium">En Proceso</span>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-3xl font-bold text-gray-800">{resumen.completadas}</span>
                  <span className="text-xs text-green-700 font-medium">Completadas</span>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex flex-col items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-3xl font-bold text-gray-800">{resumen.vencidas}</span>
                  <span className="text-xs text-red-700 font-medium">Vencidas</span>
                </div>
              </div>

              {/* Por Trimestre */}
              <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Avance por Trimestre
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(q => {
                  const data = resumen.por_trimestre[q];
                  const pct = data.total > 0 ? Math.round((data.completadas / data.total) * 100) : 0;
                  return (
                    <div key={q} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-orange-600">Q{q}</span>
                        <span className="text-xl font-black text-gray-800">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.completadas}/{data.total} completadas
                      </div>
                      {data.presupuesto > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          ${data.presupuesto.toLocaleString('es-CO')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Por Etapa PHVA */}
              <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Distribución por Etapa PHVA
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {etapas.map(etapa => {
                  const count = resumen.por_etapa[etapa.id] || 0;
                  return (
                    <div key={etapa.id} className={`p-4 rounded-xl border-2 ${etapa.bg} ${etapa.borderColor}`}>
                      <div className={`font-bold ${etapa.color} flex items-center`}>
                        {etapa.title}
                      </div>
                      <div className="text-2xl font-black text-gray-800 mt-1">{count}</div>
                      <div className="text-xs text-gray-500">actividades</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowResumen(false)}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}