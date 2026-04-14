import React, { useState } from 'react';
import { 
  FolderOpen, 
  Search, 
  Download, 
  Filter, 
  FileText, 
  FileSpreadsheet, 
  FileBadge,
  CheckCircle2
} from 'lucide-react';

const formatosCatalogo = [
  {
    id: 1,
    title: 'Política de Seguridad y Salud en el Trabajo',
    category: 'Planeación',
    type: 'DOCX',
    description: 'Documento base con los compromisos gerenciales frente al SG-SST establecidos por el Decreto 1072.',
    size: '154 KB'
  },
  {
    id: 2,
    title: 'Matriz de Requisitos Legales',
    category: 'Planeación',
    type: 'XLSX',
    description: 'Plantilla en Excel para enlistar y evaluar el cumplimiento de todas las normas vigentes aplicables a tu sector.',
    size: '2.1 MB'
  },
  {
    id: 3,
    title: 'Matriz IPERC (Identificación de Peligros)',
    category: 'Hacer',
    type: 'XLSX',
    description: 'Sabana estructurada bajo la GTC-45 para evaluar riesgos y establecer controles jerárquicos.',
    size: '3.4 MB'
  },
  {
    id: 4,
    title: 'Acta de Conformación del COPASST',
    category: 'Comités',
    type: 'DOCX',
    description: 'Formato editable para registrar los votos, resultados y comité formalizado del paritario.',
    size: '400 KB'
  },
  {
    id: 5,
    title: 'Formato de Entrega de EPP',
    category: 'Hacer',
    type: 'DOCX',
    description: 'Registro de firmas de los trabajadores que aceptan los elementos de protección personal y declaran su uso apropiado.',
    size: '120 KB'
  },
  {
    id: 6,
    title: 'Plantilla de Inspección de Extintores',
    category: 'Hacer',
    type: 'DOCX',
    description: 'Checklist mensual para auditar manómetros, fechas de vencimiento y ubicación de equipos de primeros auxilios.',
    size: '85 KB'
  },
  {
    id: 7,
    title: 'Reglamento de Higiene y Seguridad',
    category: 'Planeación',
    type: 'DOCX',
    description: 'Estructura normativa obligatoria que la empresa debe publicar en sus instalaciones.',
    size: '200 KB'
  },
  {
    id: 8,
    title: 'Procedimiento Investigación de Accidentes',
    category: 'Actuar',
    type: 'PDF',
    description: 'Guía paso a paso sobre cómo llenar el FURAT y realizar el árbol de causas tras un incidente.',
    size: '4.5 MB'
  },
  {
    id: 9,
    title: 'Acta de Revisión por la Alta Dirección',
    category: 'Verificar',
    type: 'DOCX',
    description: 'Formato para la reunión gerencial donde se evalúan los indicadores anuales del SG-SST.',
    size: '110 KB'
  },
  {
    id: 10,
    title: 'Plan de Emergencias y Contingencias',
    category: 'Hacer',
    type: 'DOCX',
    description: 'Estructura general para definir rutas de evacuación, análisis de vulnerabilidad y brigadas.',
    size: '1.2 MB'
  },
  {
    id: 11,
    title: 'Reporte Interno de Incidentes y Accidentes',
    category: 'Actuar',
    type: 'DOCX',
    description: 'Borrador editable para que el trabajador o supervisor reporte un evento inmediatamente antes del FURAT oficial.',
    size: '145 KB'
  },
  {
    id: 12,
    title: 'Matriz de Seguimiento de Incapacidades',
    category: 'Verificar',
    type: 'XLSX',
    description: 'Control de días perdidos, diagnósticos comunes y alertas de reintegro laboral.',
    size: '1.8 MB'
  },
  {
    id: 13,
    title: 'Análisis Seguro de Trabajo (AST)',
    category: 'Hacer',
    type: 'XLSX',
    description: 'Formulario estándar para evaluar peligros justo antes de ejecutar una tarea no rutinaria.',
    size: '800 KB'
  },
  {
    id: 14,
    title: 'Permiso de Trabajo en Alturas',
    category: 'Hacer',
    type: 'DOCX',
    description: 'Formato obligatorio firmado por el coordinador de alturas antes de cualquier labor por encima de 2.0 metros.',
    size: '300 KB'
  },
  {
    id: 15,
    title: 'Permiso de Trabajo en Espacios Confinados',
    category: 'Hacer',
    type: 'DOCX',
    description: 'Checklist para monitoreo de gases y validación de vigía previo al ingreso a la zona.',
    size: '310 KB'
  },
  {
    id: 16,
    title: 'Encuesta de Perfil Sociodemográfico',
    category: 'Planeación',
    type: 'DOCX',
    description: 'Cuestionario para recolectar datos de salud, antecedentes y condiciones de vida de los trabajadores.',
    size: '180 KB'
  },
  {
    id: 17,
    title: 'Programa de Capacitación Anual',
    category: 'Planeación',
    type: 'XLSX',
    description: 'Cronograma mes a mes detallando temas, población objeto, intensidad horaria y presupuesto.',
    size: '1.1 MB'
  },
  {
    id: 18,
    title: 'Lista de Asistencia a Capacitaciones',
    category: 'Hacer',
    type: 'DOCX',
    description: 'Hoja de firmas estándar con autorización de manejo de datos y evaluación de eficacia de la charla.',
    size: '100 KB'
  },
  {
    id: 19,
    title: 'Formato de Inspección de Botiquines',
    category: 'Hacer',
    type: 'DOCX',
    description: 'Lista de chequeo para verificar insumos, caducidad e integridad de la dotación de primeros auxilios.',
    size: '95 KB'
  },
  {
    id: 20,
    title: 'Formato de Inspección de Elementos de Protección',
    category: 'Hacer',
    type: 'DOCX',
    description: 'Ronda de revisión del desgaste, limpieza y vida útil de los EPP asignados a cada empleado en la planta.',
    size: '125 KB'
  },
  {
    id: 21,
    title: 'Política de Prevención de Alcohol y Drogas',
    category: 'Planeación',
    type: 'DOCX',
    description: 'Declaración oficial exigida por el ministerio con las sanciones o medidas tomadas por la organización frente a estos riesgos.',
    size: '210 KB'
  },
  {
    id: 22,
    title: 'Matriz de Exámenes Médicos Ocupacionales (Profesiograma)',
    category: 'Planeación',
    type: 'XLSX',
    description: 'Matriz que cruza el cargo con el tipo de perfil físico requerido (ej. Visiometría, Audiometría, Osteomuscular).',
    size: '2.5 MB'
  },
  {
    id: 23,
    title: 'Formato Reporte de Actos y Condiciones Inseguras',
    category: 'Verificar',
    type: 'DOCX',
    description: 'Boletas o tarjetas para que los operarios notifiquen anónimamente o abiertamente sobre peligros en el entorno.',
    size: '150 KB'
  },
  {
    id: 24,
    title: 'Cronograma Plan Anual de Trabajo',
    category: 'Planeación',
    type: 'XLSX',
    description: 'Diagrama de Gantt formulado para el cumplimiento paso a paso del Decreto 1072 en los diferentes meses del año.',
    size: '4.8 MB'
  },
  {
    id: 25,
    title: 'Simulacro de Evacuación Anual (Acta e Informe)',
    category: 'Actuar',
    type: 'DOCX',
    description: 'Plantilla integral para calificar los tiempos del simulacro, áreas a mejorar y desempeño de las brigadas de emergencia.',
    size: '1.2 MB'
  }
];

export default function BancoFormatos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [downloading, setDownloading] = useState(null);

  const categories = ['Todos', 'Planeación', 'Hacer', 'Verificar', 'Actuar', 'Comités'];

  const filteredFormatos = formatosCatalogo.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'Todos' || f.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleDownload = (id, filename) => {
    setDownloading(id);
    // Simulamos un retraso de red para dar experiencia realista
    setTimeout(() => {
      setDownloading(null);
      alert(`¡"Plantilla_${filename.replace(/ /g, '_')}" se descargó exitosamente! Podrás subirla al Ciclo PHVA cuando la diligencies.`);
    }, 1500);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'DOCX': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'XLSX': return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      case 'PDF': return <FileBadge className="w-8 h-8 text-red-500" />;
      default: return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center">
            <FolderOpen className="w-8 h-8 mr-3 text-orange-500" /> Banco de Formatos
          </h2>
          <p className="text-gray-500 mt-1">Librería oficial de plantillas editables para acelerar tu gestión del SG-SST.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
         <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Buscar política, matriz, acta..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" 
            />
         </div>
         <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'}`}
              >
                {cat}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFormatos.map(formato => (
          <div key={formato.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                {getIcon(formato.type)}
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md tracking-wider uppercase">{formato.type}</span>
            </div>
            
            <span className="text-xs font-bold text-orange-500 tracking-wider uppercase mb-1">{formato.category}</span>
            <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight group-hover:text-orange-600 transition-colors">{formato.title}</h3>
            
            <p className="text-sm text-gray-500 flex-1 mb-6 leading-relaxed">
              {formato.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-medium text-gray-400">{formato.size}</span>
              <button 
                onClick={() => handleDownload(formato.id, formato.title)}
                disabled={downloading === formato.id}
                className={`flex items-center justify-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all shadow-md group-hover:shadow-lg ${downloading === formato.id ? 'opacity-75 cursor-wait' : ''}`}
              >
                {downloading === formato.id ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    Descargando
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFormatos.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-500">No se encontraron formatos con esos filtros</h3>
          <p className="text-gray-400 mt-2">Prueba buscando otra palabra clave o cambiando la categoría.</p>
        </div>
      )}
    </div>
  );
}
