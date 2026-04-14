import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, Filter, ShieldCheck, ExternalLink,
  CalendarDays, Plus, Upload, FileText, CheckCircle2,
  AlertCircle, ChevronLeft, ChevronRight, X, Clock, Trash2, Layers,
  Globe, Shield, Zap, Paperclip, Eye, Download, FileSearch
} from 'lucide-react';

export default function MatrizLegal({ profile }) {
  const [activeTab, setActiveTab] = useState('mi-matriz');
  const [miMatriz, setMiMatriz] = useState([]);
  const [biblioteca, setBiblioteca] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [consolidado, setConsolidado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('TODOS');
  
  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showIntegrateModal, setShowIntegrateModal] = useState(false);
  const [integratingAlerta, setIntegratingAlerta] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, type: null });
  
  // Forms
  const [uploadFile, setUploadFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [customNorm, setCustomNorm] = useState({ norma: '', titulo: '', observaciones: '', area: 'SST' });
  const [integrationData, setIntegrationData] = useState({ cumplimiento: 'pendiente', observaciones: '' });
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryMessage, setDiscoveryMessage] = useState('');
  const [discoveryResult, setDiscoveryResult] = useState(null); // {message, details}

  // Evidence handling
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceItem, setEvidenceItem] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Norm detail modal
  const [showNormModal, setShowNormModal] = useState(false);
  const [selectedNorm, setSelectedNorm] = useState(null);

  const empresaId = profile?.id;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!empresaId) return;
    fetchData();
  }, [empresaId, activeTab, areaFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = {
        'mi-matriz': `http://localhost:8000/api/empresas/${empresaId}/matriz-legal`,
        'biblioteca': `http://localhost:8000/api/empresas/${empresaId}/biblioteca-legal`,
        'anexos': `http://localhost:8000/api/empresas/${empresaId}/matriz-legal/documentos`,
        'integral': `http://localhost:8000/api/empresas/${empresaId}/matriz-legal/consolidado`
      };

      const res = await fetch(`${endpoints[activeTab]}?area=${areaFilter}`);
      const data = await res.json();
      
      const safeData = Array.isArray(data) ? data : [];

      if (activeTab === 'mi-matriz') setMiMatriz(safeData);
      if (activeTab === 'biblioteca') setBiblioteca(safeData);
      if (activeTab === 'anexos') setDocumentos(safeData);
      if (activeTab === 'integral') setConsolidado(safeData);

      // Si no es el tab de documentos, también traemos los documentos en segundo plano para el conteo
      if (activeTab !== 'anexos') {
        const resDocs = await fetch(endpoints['anexos']);
        const dataDocs = await resDocs.json();
        setDocumentos(Array.isArray(dataDocs) ? dataDocs : []);
      }

      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMatrixClick = (alerta) => {
    setIntegratingAlerta(alerta);
    setIntegrationData({ cumplimiento: 'pendiente', observaciones: '' });
    setShowIntegrateModal(true);
  };

  const submitIntegration = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/empresas/matriz-legal/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          empresa_id: empresaId, 
          alerta_id: integratingAlerta.id,
          ...integrationData
        })
      });
      if (res.ok) {
        alert("Norma integrada a tu matriz con éxito.");
        setShowIntegrateModal(false);
        setIntegratingAlerta(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    const { id, type } = confirmDelete;
    try {
      const url = type === 'documento' 
        ? `http://localhost:8000/api/empresas/matriz-legal/documentos/${id}`
        : `http://localhost:8000/api/empresas/matriz-legal/clear-evidence/${id}`;
      
      const res = await fetch(url, { method: type === 'documento' ? 'DELETE' : 'POST' });
      if (res.ok) {
        setConfirmDelete({ show: false, id: null, type: null });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('empresa_id', empresaId);
    formData.append('nombre', docName);
    formData.append('archivo', uploadFile);

    try {
      const res = await fetch(`http://localhost:8000/api/empresas/${empresaId}/matriz-legal/upload-documento`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert("Matriz anexada y procesada. Se han migrado las normas aplicables al Inventario Maestro.");
        setShowUploadModal(false);
        setUploadFile(null);
        setDocName('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getActiveItems = () => {
    switch(activeTab) {
      case 'mi-matriz': return miMatriz;
      case 'biblioteca': return biblioteca;
      case 'integral': return consolidado;
      default: return [];
    }
  };

  const filteredItems = getActiveItems().filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.norma?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDiscover = async () => {
    setIsDiscovering(true);
    setDiscoveryResult(null);
    setDiscoveryMessage("Iniciando escaneo de bases de datos legales...");

    const messages = [
      "Sincronizando con portal SUIN-JURISCOL...",
      "Consultando Repositorios del Ministerio de Salud...",
      "Verificando decretos en Ministerio del Trabajo y MinAmbiente...",
      "Consultando circulares de la SIC y DIAN...",
      "Filtrando normas derogadas y cruzando con CIIU...",
      "Integrando hallazgos al sistema...",
    ];

    // Actualizar mensajes progresivamente
    messages.forEach((msg, i) => {
      setTimeout(() => setDiscoveryMessage(msg), (i + 1) * 800);
    });

    try {
      const res = await fetch(`http://localhost:8000/api/empresas/${empresaId}/matriz-legal/discover`, {
        method: 'POST'
      });
      const data = await res.json();

      // Después de que el backend termine, cambiar al tab biblioteca
      // y recargar todos los datos frescos
      setTimeout(() => {
        setActiveTab("biblioteca");
        setAreaFilter("TODOS");
        setCurrentPage(1);
        // Recargar datos frescos del servidor
        fetchData();
        setIsDiscovering(false);
        setDiscoveryResult({
          message: data.message,
          details: data.details,
          count: data.discovered_count
        });
      }, 5500);
    } catch (err) {
      console.error(err);
      setIsDiscovering(false);
    }
  };

  const handleAddCustom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/empresas/matriz-legal/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customNorm, empresa_id: empresaId })
      });
      if (res.ok) {
        alert("Norma personalizada agregada.");
        setShowCustomModal(false);
        setCustomNorm({ norma: '', titulo: '', observaciones: '', area: 'SST' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadEvidenceClick = (item) => {
    setEvidenceItem(item);
    setEvidenceFile(null);
    setShowEvidenceModal(true);
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceFile || !evidenceItem) return;

    setUploadingEvidence(true);
    const formData = new FormData();
    formData.append('evidencia', evidenceFile);

    try {
      const res = await fetch(`http://localhost:8000/api/empresas/matriz-legal/upload-evidence/${evidenceItem.id}`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert("Evidencia cargada correctamente.");
        setShowEvidenceModal(false);
        setEvidenceItem(null);
        setEvidenceFile(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleViewEvidence = async (item) => {
    try {
      const res = await fetch(`http://localhost:8000/api/empresas/matriz-legal/evidence/${item.id}`);
      const data = await res.json();
      if (data.evidencia_url) {
        window.open(data.evidencia_url, '_blank');
      } else {
        alert("No hay evidencia cargada para este item.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewNorm = (item) => {
    setSelectedNorm(item);
    setShowNormModal(true);
  };

  const getAreaIcon = (area) => {
    switch(area) {
      case 'Ambiental': return <Globe className="w-3 h-3 mr-1" />;
      case 'SST': return <Shield className="w-3 h-3 mr-1" />;
      case 'Calidad': return <Zap className="w-3 h-3 mr-1" />;
      default: return <FileText className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50 h-full">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
            <BookOpen className="w-10 h-10 mr-4 text-emerald-600" />
            Matriz Legal <span className="ml-3 text-sm font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest">Inteligencia Normativa</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Gestión de requisitos legales y cumplimiento multidisciplinario para {profile?.nombre_empresa}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-6 py-3 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2" /> Anexar Matriz
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo Requisito
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-200/50 p-1.5 rounded-[28px] mb-8 w-fit border border-gray-100 shadow-inner">
        {[
          { id: 'mi-matriz', label: 'Inventario Maestro', icon: ShieldCheck, count: miMatriz.length },
          { id: 'biblioteca', label: 'Capa Sugerida (IA)', icon: Layers, count: biblioteca.length },
          { id: 'anexos', label: 'Anexos Legados', icon: FileText, count: documentos.length },
          { id: 'integral', label: 'Vista Integral', icon: BookOpen, count: consolidado.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center px-6 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-white text-emerald-600 shadow-xl shadow-emerald-100/50 scale-[1.02]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}
            `}
          >
            <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-emerald-500' : 'text-gray-400'}`} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Banner de resultado del Descubrimiento IA */}
      {discoveryResult && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between shadow-sm">
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-black text-emerald-800">{discoveryResult.message}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">{discoveryResult.details}</p>
            </div>
          </div>
          <button onClick={() => setDiscoveryResult(null)} className="text-emerald-400 hover:text-emerald-700 transition ml-4 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Control Bar */}
      <div className="bg-white rounded-t-3xl border border-gray-200 border-b-0 shadow-sm overflow-hidden p-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-2.5" />
          <input 
            type="text" 
            placeholder="Filtrar por norma o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" 
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-50 rounded-2xl px-3 py-1.5 border border-gray-100">
            <Filter className="w-4 h-4 text-gray-400 mr-2" />
            <select 
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="TODOS">Todas las Áreas</option>
              <option value="SST">SST (Seguridad)</option>
              <option value="Ambiental">Medio Ambiente</option>
              <option value="Calidad">Calidad / ISO</option>
              <option value="Laboral">Laboral / Contratos</option>
              <option value="Tributaria">Tributaria / Impuestos</option>
              <option value="Privacidad">Protección de Datos</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          {activeTab === 'biblioteca' && (
            <button 
              onClick={handleDiscover}
              disabled={isDiscovering}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Descubrir con IA
            </button>
          )}
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {filteredItems.length} Registros
          </div>
        </div>
      </div>

      {/* Main Table Content con Paginación */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-b-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-5">Norma / Sector</th>
                <th className="px-6 py-5">Detalle del Requisito</th>
                <th className="px-6 py-5 text-center">Cumplimiento</th>
                <th className="px-6 py-5 text-center">Evidencia</th>
                <th className="px-6 py-5 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                      <p className="text-gray-400 font-medium tracking-tight">Consultando Repositorios Oficiales...</p>
                   </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-20 text-center text-gray-400 font-medium">
                      No se encontraron hallazgos para este criterio.
                   </td>
                </tr>
              ) : currentItems.map(item => (
                <tr key={`${item.id}-${item.capa || 'main'}`} className="hover:bg-emerald-50/20 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-gray-900">
                    <button
                      onClick={() => handleViewNorm(item)}
                      className="flex flex-col items-start hover:text-emerald-600 transition-colors cursor-pointer text-left"
                    >
                      <span className="underline decoration-dotted">{item.norma}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] w-fit mt-1 uppercase ${
                        item.area === 'Ambiental' ? 'bg-cyan-50 text-cyan-600' :
                        item.area === 'Laboral' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{item.area}</span>
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => handleViewNorm(item)}
                      className="text-left w-full hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      <span className="text-sm text-gray-700 font-bold block mb-1">{item.title}</span>
                      <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {(activeTab === 'mi-matriz' || activeTab === 'integral') && (
                      <select
                        value={item.cumplimiento || 'pendiente'}
                        onChange={async (e) => {
                          try {
                            await fetch('http://localhost:8000/api/empresas/matriz-legal/add', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                empresa_id: empresaId,
                                alerta_id: item.alerta_id,
                                cumplimiento: e.target.value,
                                observaciones: item.observaciones || ''
                              })
                            });
                            fetchData();
                          } catch(err) { console.error(err); }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 cursor-pointer transition-all ${
                          item.cumplimiento === 'cumple' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          item.cumplimiento === 'no_cumple' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="cumple">Cumple</option>
                        <option value="no_cumple">No Cumple</option>
                      </select>
                    )}
                    {(activeTab === 'biblioteca') && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase">
                        --
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {(activeTab === 'mi-matriz' || activeTab === 'integral') && (
                      <div className="flex justify-center items-center space-x-1">
                        {item.evidencia_url ? (
                          <>
                            <button
                              onClick={() => handleViewEvidence(item)}
                              className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
                              title="Ver evidencia"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ show: true, id: item.id, type: 'evidencia' })}
                              className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all"
                              title="Eliminar evidencia"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleUploadEvidenceClick(item)}
                            className="p-2 text-gray-500 bg-gray-50 rounded-xl hover:bg-emerald-100 hover:text-emerald-600 transition-all"
                            title="Subir evidencia"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                    {activeTab === 'biblioteca' && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase">
                        --
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      {item.url_oficial && (
                        <a
                          href={item.url_oficial}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Ver Fuente Oficial"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                      {activeTab === 'biblioteca' && (
                        <button
                          onClick={() => handleAddToMatrixClick(item)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                        >
                          Integrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        {!loading && totalPages > 1 && (
          <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Mostrando <span className="text-emerald-600">{indexOfFirstItem + 1}</span> - <span className="text-emerald-600">{Math.min(indexOfLastItem, filteredItems.length)}</span> de {filteredItems.length}
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 transition-all font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-2xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white border border-gray-200 text-gray-500 hover:bg-emerald-50'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-30 transition-all font-bold"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal (Point 4) */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-[40px] w-full max-w-sm p-8 text-center shadow-2xl animate-in zoom-in-95">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                 <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tighter">¿Eliminar registro?</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
                {confirmDelete.type === 'documento' 
                  ? "Esta acción borrará físicamente el archivo del servidor y su registro de auditoría. Es irreversible." 
                  : "Se procederá a limpiar la evidencia cargada, dejando el requisito listo para una nueva carga Correcta."}
              </p>
              <div className="flex space-x-3">
                 <button onClick={() => setConfirmDelete({ show: false, id: null, type: null })} className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-3xl hover:bg-gray-200 transition">Cancelar</button>
                 <button onClick={handleDelete} className="flex-1 py-4 bg-rose-600 text-white font-black rounded-3xl hover:bg-rose-700 transition shadow-lg shadow-rose-200">Confirmar</button>
              </div>
           </div>
        </div>
      )}

      {/* Modal: Agregar (Point 2) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100">
             <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="text-2xl font-black text-gray-800 tracking-tighter">Gestión de Nueva Norma</h3>
               <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-6 h-6" /></button>
             </div>
             <div className="p-8 grid grid-cols-2 gap-6 text-center">
                <button 
                  onClick={() => { setShowAddModal(false); setActiveTab('biblioteca'); }}
                  className="p-10 border-2 border-emerald-50 bg-white rounded-[40px] hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-50 transition-all group"
                >
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-8 h-8" />
                   </div>
                   <h4 className="font-black text-xl text-gray-800 tracking-tighter">Desde Biblioteca</h4>
                   <p className="text-xs text-gray-400 mt-3 font-semibold uppercase tracking-wider">Capa Prospectiva</p>
                </button>
                <button 
                  onClick={() => { setShowAddModal(false); setShowCustomModal(true); }}
                  className="p-10 border-2 border-amber-50 bg-white rounded-[40px] hover:border-amber-500 hover:shadow-xl hover:shadow-amber-50 transition-all group"
                >
                   <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Plus className="w-8 h-8" />
                   </div>
                   <h4 className="font-black text-xl text-gray-800 tracking-tighter">Carga Manual</h4>
                   <p className="text-xs text-gray-400 mt-3 font-semibold uppercase tracking-wider">Inventario Empresa</p>
                </button>
             </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden">
             <form onSubmit={handleUpload}>
               <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-gray-800 tracking-tighter flex items-center">
                   <Upload className="w-6 h-6 mr-3 text-blue-600" /> Anexar Matriz Legada
                 </h3>
                 <button type="button" onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-6 h-6" /></button>
               </div>
               <div className="p-8 space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Identificación del Documento</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Matriz SST Empresa 2023.pdf" 
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      required
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <div className="border-4 border-dashed border-gray-50 rounded-[32px] p-12 text-center bg-gray-50/30 hover:bg-white hover:border-blue-100 transition-all cursor-pointer relative group">
                    <input 
                      type="file" 
                      required
                      accept=".pdf,.xlsx,.docx"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                    <p className="text-sm font-black text-gray-700 tracking-tight">{uploadFile ? uploadFile.name : "Soltar archivo aquí"}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Formatos PDF / EXCEL</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                      Al subir este anexo, el sistema migrará automáticamente todas las normas coincidentes de la Biblioteca al Inventario Maestro.
                    </p>
                  </div>
               </div>
               <div className="p-8 pt-0 flex space-x-3">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 py-4 text-gray-600 font-black rounded-3xl hover:bg-gray-100 transition">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">Procesar Anexo</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {showCustomModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden">
             <form onSubmit={handleAddCustom}>
               <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-gray-800 tracking-tighter flex items-center">
                   <Plus className="w-6 h-6 mr-3 text-amber-600" /> Nueva Norma Manual
                 </h3>
                 <button type="button" onClick={() => setShowCustomModal(false)} className="p-2 hover:bg-200 rounded-full transition"><X className="w-6 h-6" /></button>
               </div>
               <div className="p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Norma / Código</label>
                      <input 
                        type="text" 
                        placeholder="Ej: Resolución 0312" 
                        required
                        value={customNorm.norma}
                        onChange={(e) => setCustomNorm({...customNorm, norma: e.target.value})}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Área Aplicable</label>
                      <select 
                        value={customNorm.area}
                        onChange={(e) => setCustomNorm({...customNorm, area: e.target.value})}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                      >
                        <option value="SST">SST</option>
                        <option value="Ambiental">Ambiental</option>
                        <option value="Calidad">Calidad</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Título de la Regulación</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Estándares Mínimos del SG-SST" 
                      required
                      value={customNorm.titulo}
                      onChange={(e) => setCustomNorm({...customNorm, titulo: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Resumen de Aplicabilidad</label>
                    <textarea 
                      rows="4"
                      placeholder="Descripción detallada de por qué esta norma le aplica a la empresa hoy..." 
                      value={customNorm.observaciones}
                      onChange={(e) => setCustomNorm({...customNorm, observaciones: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 resize-none font-bold"
                    ></textarea>
                  </div>
               </div>
               <div className="p-8 pt-0 flex space-x-3">
                  <button type="button" onClick={() => setShowCustomModal(false)} className="flex-1 py-4 text-gray-600 font-black rounded-3xl hover:bg-gray-100 transition">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-amber-500 text-white font-black rounded-3xl hover:bg-amber-600 transition shadow-lg shadow-amber-200">Guardar en Maestro</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal: Criterio Humano de Integración (Human Criterion) */}
      {showIntegrateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
           <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
              <form onSubmit={submitIntegration}>
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 tracking-tighter flex items-center">
                      <ShieldCheck className="w-6 h-6 mr-3 text-emerald-600" /> Criterio de Integración
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Validación Técnica Humana</p>
                  </div>
                  <button type="button" onClick={() => setShowIntegrateModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="p-8 space-y-6">
                   <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[11px] font-black text-emerald-700 uppercase mb-1 tracking-wider">Norma Seleccionada</p>
                      <p className="text-sm font-bold text-gray-800">{integratingAlerta?.norma}: {integratingAlerta?.title}</p>
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Estado Inicial de Cumplimiento</label>
                      <div className="grid grid-cols-3 gap-3">
                         {['cumple', 'no_cumple', 'pendiente'].map(status => (
                            <button
                               key={status}
                               type="button"
                               onClick={() => setIntegrationData({ ...integrationData, cumplimiento: status })}
                               className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                  integrationData.cumplimiento === status 
                                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                                  : 'border-gray-100 text-gray-400 hover:border-emerald-200 hover:text-emerald-600'
                               }`}
                            >
                               {status.replace('_', ' ')}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Justificación de Aplicabilidad / Observaciones</label>
                      <textarea 
                        rows="4"
                        required
                        placeholder="Escriba por qué considera que esta norma aplica a la empresa y qué se ha revisado..." 
                        value={integrationData.observaciones}
                        onChange={(e) => setIntegrationData({...integrationData, observaciones: e.target.value})}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-bold text-sm"
                      ></textarea>
                   </div>
                </div>

                <div className="p-8 pt-0 flex space-x-3">
                   <button type="button" onClick={() => setShowIntegrateModal(false)} className="flex-1 py-4 text-gray-600 font-black rounded-3xl hover:bg-gray-100 transition">Cancelar</button>
                   <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">Confirmar Integración</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Upload Evidence */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <form onSubmit={handleSubmitEvidence}>
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tighter flex items-center">
                    <Paperclip className="w-6 h-6 mr-3 text-emerald-600" /> Subir Evidencia
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Item: {evidenceItem?.norma}
                  </p>
                </div>
                <button type="button" onClick={() => setShowEvidenceModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-5">
                <div className="border-4 border-dashed border-gray-100 rounded-[32px] p-10 text-center bg-gray-50/30 hover:bg-white hover:border-emerald-200 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Paperclip className="w-12 h-12 text-gray-200 mx-auto mb-3 group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
                  <p className="text-sm font-black text-gray-700 tracking-tight">
                    {evidenceFile ? evidenceFile.name : "Soltar archivo aquí"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                    PDF, Word, Excel, Imágenes
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-2 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                    La evidencia debe demostrar el cumplimiento del requisito legal. Archivos PDF, imágenes o documentos de hasta 10MB.
                  </p>
                </div>
              </div>

              <div className="p-8 pt-0 flex space-x-3">
                <button type="button" onClick={() => setShowEvidenceModal(false)} className="flex-1 py-4 text-gray-600 font-black rounded-3xl hover:bg-gray-100 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={uploadingEvidence} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-50">
                  {uploadingEvidence ? 'Guardando...' : 'Guardar Evidencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Norm Detail View */}
      {showNormModal && selectedNorm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-8 flex justify-between items-start z-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                    selectedNorm.area === 'SST' ? 'bg-emerald-100 text-emerald-700' :
                    selectedNorm.area === 'Ambiental' ? 'bg-cyan-100 text-cyan-700' :
                    selectedNorm.area === 'Laboral' ? 'bg-amber-100 text-amber-700' :
                    selectedNorm.area === 'Tributaria' ? 'bg-rose-100 text-rose-700' :
                    selectedNorm.area === 'Privacidad' ? 'bg-blue-100 text-blue-700' :
                    selectedNorm.area === 'Calidad' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedNorm.area || 'General'}
                  </span>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                    selectedNorm.impact === 'Crítico' ? 'bg-rose-600 text-white' :
                    selectedNorm.impact === 'Alto' ? 'bg-orange-500 text-white' :
                    selectedNorm.impact === 'Medio' ? 'bg-amber-400 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {selectedNorm.impact || 'N/A'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {selectedNorm.norma}
                </h2>
                <p className="text-gray-500 font-medium mt-1">{selectedNorm.title}</p>
              </div>
              <button
                onClick={() => setShowNormModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition ml-4 shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Descripción Completa */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                  <FileSearch className="w-4 h-4 mr-2" />
                  Descripción de la Norma
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {selectedNorm.description || selectedNorm.descripcion || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Requisitos / Acción Requerida */}
              {(selectedNorm.actionRequired || selectedNorm.accion_requerida) && (
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Requisito de Cumplimiento
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {selectedNorm.actionRequired || selectedNorm.accion_requerida}
                  </p>
                </div>
              )}

              {/* Observaciones (si existe) */}
              {selectedNorm.observaciones && (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
                    Observaciones del Análisis
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {selectedNorm.observaciones}
                  </p>
                </div>
              )}

              {/* Estado de Cumplimiento (solo en matriz) */}
              {selectedNorm.cumplimiento && (
                <div className={`rounded-2xl p-6 border-2 ${
                  selectedNorm.cumplimiento === 'cumple' ? 'bg-emerald-50 border-emerald-200' :
                  selectedNorm.cumplimiento === 'no_cumple' ? 'bg-rose-50 border-rose-200' :
                  'bg-amber-50 border-amber-200'
                }`}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-3">
                    Estado de Cumplimiento
                  </h3>
                  <p className={`text-lg font-black ${
                    selectedNorm.cumplimiento === 'cumple' ? 'text-emerald-700' :
                    selectedNorm.cumplimiento === 'no_cumple' ? 'text-rose-700' :
                    'text-amber-700'
                  }`}>
                    {selectedNorm.cumplimiento === 'cumple' ? '✓ Cumple' :
                     selectedNorm.cumplimiento === 'no_cumple' ? '✗ No Cumple' :
                     '○ Pendiente de Verificación'}
                  </p>
                </div>
              )}

              {/* Fecha de Publicación */}
              {selectedNorm.date && (
                <div className="flex items-center text-gray-500 text-sm">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  <span>Fecha de publicación: <strong>{selectedNorm.date}</strong></span>
                </div>
              )}

              {/* Enlace Oficial */}
              {selectedNorm.url_oficial && (
                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={selectedNorm.url_oficial}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-emerald-200 transition-all"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    Consultar Norma Oficial
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Se abrirá el portal oficial de función pública
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Discovery Overlay */}
      {isDiscovering && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl flex items-center justify-center z-[200] p-4 text-center">
            <div className="max-w-md w-full">
                <div className="relative w-32 h-32 mx-auto mb-10">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-4 bg-emerald-500/30 rounded-full animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                        <Plus className="w-16 h-16 text-white animate-spin-slow" />
                    </div>
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Investigación IA en curso</h3>
                <p className="text-emerald-100 font-bold bg-emerald-900/40 px-4 py-2 rounded-2xl border border-emerald-500/30 inline-block animate-pulse">
                    {discoveryMessage}
                </p>
                <div className="mt-12 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

const AreaBadge = ({ area }) => {
  const skins = {
    'SST': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Ambiental': 'bg-cyan-50 text-cyan-700 border-cyan-100',
    'Laboral': 'bg-amber-50 text-amber-700 border-amber-100',
    'Tributaria': 'bg-rose-50 text-rose-700 border-rose-100',
    'Privacidad': 'bg-blue-50 text-blue-700 border-blue-100',
    'Calidad': 'bg-purple-50 text-purple-700 border-purple-100'
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border shadow-sm ${skins[area] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
      {area || 'General'}
    </span>
  );
};

const ImpactBadge = ({ impact }) => {
  const styles = {
    'Crítico': 'bg-rose-600 text-white',
    'Alto': 'bg-orange-500 text-white',
    'Medio': 'bg-amber-400 text-white',
    'Bajo': 'bg-emerald-500 text-white'
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase shadow-sm ${styles[impact] || 'bg-gray-400 text-white'}`}>
      {impact || 'N/A'}
    </span>
  );
};
