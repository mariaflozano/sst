import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  PieChart, 
  ClipboardCheck, 
  Calendar as CalendarIcon, 
  Activity, 
  ShieldCheck, 
  Building2, 
  ChevronRight, 
  Search,
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileBarChart,
  Target,
  Users,
  GraduationCap,
  Trash2
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function Reportes({ profile }) {
  const [activeReport, setActiveReport] = useState(null);
  const [data, setData] = useState({
    diagnosis: [],
    phva: {},
    capacitaciones: [],
    accidentalidad: []
  });
  const [loading, setLoading] = useState(false);

  // --- CARGA DE DATOS PARA REPORTES ---
  useEffect(() => {
    if (profile?.id) {
      loadAllReportData();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const loadAllReportData = async () => {
    setLoading(true);
    try {
      // 1. Diagnóstico Inicial (Línea Base)
      const savedDiag = localStorage.getItem('sgsst_detailed_diagnosis');
      const diagData = savedDiag ? JSON.parse(savedDiag) : [];

      // 2. PHVA (Ejecución 0312)
      const savedPHVA = localStorage.getItem('sgsst_phva_documents');
      const phvaData = savedPHVA ? JSON.parse(savedPHVA) : {};

      // 3. Capacitaciones (Plan Anual)
      let capData = [];
      try {
        const res = await fetch(`${API_BASE}/empresas/${profile.id}/capacitaciones`);
        if (res.ok) {
          capData = await res.json();
        } else {
          // Si el servidor responde con error (p.ej. 500), intentar local
          const localCap = localStorage.getItem('sgsst_programa_capacitacion');
          if (localCap) capData = JSON.parse(localCap);
        }
      } catch (e) {
        const localCap = localStorage.getItem('sgsst_programa_capacitacion');
        if (localCap) capData = JSON.parse(localCap);
      }

      // 4. Accidentalidad (Indicadores)
      const localAcc = localStorage.getItem('sgsst_at_reports');
      const accData = localAcc ? JSON.parse(localAcc) : [];

      setData({
        diagnosis: diagData,
        phva: phvaData,
        capacitaciones: capData,
        accidentalidad: accData
      });
    } catch (err) {
      console.error("Error cargando datos para reportes", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  if (loading) return <div className="h-full flex items-center justify-center font-black text-gray-300 uppercase tracking-tighter">Preparando Archivos y Estadísticas...</div>;

  // --- VISTA: SELECTOR DE REPORTES ---
  if (!activeReport) {
    return (
      <div className="flex-1 overflow-auto p-6 bg-gray-50 h-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-6 mb-12">
            <div className="bg-gray-900 p-4 rounded-[2rem] shadow-2xl"><FileText className="w-10 h-10 text-white" /></div>
            <div>
               <h1 className="text-4xl font-black text-gray-800 tracking-tighter">Centro de Reportes</h1>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Exportación de Documentación y Evidencia Normativa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ReportCard title="Línea Base SG-SST" desc="Informe de Evaluación Inicial (Estándar 2.3.1). Resumen por ciclos y plan de mejora." icon={Target} color="blue" onClick={() => setActiveReport('linea-base')} />
            <ReportCard title="Plan de Capacitación" desc="Cronograma anual de temas, fuentes de riesgo y estados de ejecución (Estándar 1.2.1)." icon={GraduationCap} color="purple" onClick={() => setActiveReport('plan-capacitacion')} />
            <ReportCard title="Matriz de Cumplimiento" desc="Estado actual de los estándares mínimos según Res. 0312. Avance en PHVA." icon={ShieldCheck} color="green" onClick={() => setActiveReport('cumplimiento')} />
            <ReportCard title="Indicadores ATEL" desc="Resumen estadístico de accidentalidad, severidad y frecuencia para reportes gerenciales." icon={Activity} color="red" onClick={() => setActiveReport('accidentalidad')} />
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA: PREVISUALIZACION DE REPORTE ---
  return (
    <div className="flex-1 overflow-auto bg-gray-100 h-full p-0 sm:p-10 no-print">
       <div className="max-w-5xl mx-auto flex flex-col space-y-6">
          <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white sticky top-0 z-10 no-print">
             <button onClick={() => setActiveReport(null)} className="flex items-center text-gray-800 font-black text-xs uppercase tracking-wider hover:bg-gray-100 p-2 pr-6 rounded-2xl transition-all">
                <ArrowLeft className="mr-3 w-5 h-5"/> Volver
             </button>
             <button onClick={handlePrint} className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center shadow-2xl hover:scale-105 active:scale-95 transition-all">
                <Printer className="mr-3 w-5 h-5" /> Imprimir / PDF
             </button>
          </div>

          <div className="bg-white shadow-2xl print-shadow-none p-12 sm:p-20 rounded-none sm:rounded-[3rem] min-h-[1200px]" id="print-area">
             <ReportHeader profile={profile} title={activeReport === 'linea-base' ? 'Informe de Evaluación Inicial (Línea Base)' : activeReport === 'plan-capacitacion' ? 'Plan Anual de Capacitación' : activeReport === 'cumplimiento' ? 'Matriz de Cumplimiento Res. 0312' : 'Reporte de Accidentalidad ATEL'} />
             
             {activeReport === 'linea-base' && <TemplateLineaBase data={data.diagnosis} />}
             {activeReport === 'plan-capacitacion' && <TemplatePlanCapacitacion data={data.capacitaciones} />}
             {activeReport === 'cumplimiento' && <TemplateCumplimiento phva={data.phva} />}
             {activeReport === 'accidentalidad' && <TemplateAccidentalidad data={data.accidentalidad} />}

             <ReportFooter profile={profile} />
          </div>
       </div>
    </div>
  );
}

function ReportCard({ title, desc, icon: Icon, color, onClick }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100"
  };
  return (
    <button onClick={onClick} className="bg-white p-10 rounded-[3rem] border border-gray-100 text-left hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col h-full">
      <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center mb-10 ${colors[color]} border transition-all group-hover:scale-110`}><Icon className="w-10 h-10" /></div>
      <h3 className="text-2xl font-black text-gray-800 tracking-tighter mb-4 leading-none">{title}</h3>
      <p className="text-sm text-gray-400 font-medium leading-relaxed flex-1">{desc}</p>
      <div className="mt-10 flex items-center text-xs font-black uppercase tracking-widest text-gray-300 group-hover:text-blue-600 transition-colors">
        Previsualizar Reporte <ChevronRight className="ml-2 w-4 h-4 translate-x-0 group-hover:translate-x-2 transition-transform" />
      </div>
    </button>
  );
}

function ReportHeader({ profile, title }) {
  return (
    <div className="border-b-4 border-gray-900 pb-12 mb-12 flex justify-between items-start">
       <div className="flex items-center space-x-6">
          <div className="bg-gray-50 w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden border border-gray-100">
             {profile?.logo_url ? (
                <img src={`http://localhost:8000/storage/${profile.logo_url}`} alt="Logo" className="w-full h-full object-contain p-2" />
             ) : (
                <Building2 className="w-12 h-12 text-gray-300" />
             )}
          </div>
          <div>
             <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">{profile?.nombre || 'RAZÓN SOCIAL'}</h2>
             <p className="text-[10px] font-bold text-gray-300 uppercase mt-1">NIT: {profile?.nit || '---'}</p>
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter mt-4 leading-tight">{title}</h1>
          </div>
       </div>
       <div className="text-right">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Generado Por</p>
          <div className="flex items-center justify-end mt-2">
             <span className="text-sm font-black text-gray-800 uppercase">Antigravity Smart SST</span>
             <ShieldCheck className="ml-2 w-5 h-5 text-blue-600" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-2">{new Date().toLocaleDateString()}</p>
       </div>
    </div>
  );
}

function ReportFooter({ profile }) {
  return (
    <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-end">
       <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsable SST</p>
          <div className="mt-4 h-16 w-64 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
             {profile?.rep_legal_firma_url ? (
                <img src={`http://localhost:8000/storage/${profile.rep_legal_firma_url}`} alt="Firma" className="max-h-full max-w-full grayscale active:grayscale-0 hover:grayscale-0 transition-all opacity-70" />
             ) : (
                <div className="border-b border-gray-300 w-full mx-4"></div>
             )}
          </div>
          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Firma y Licencia SST: {profile?.rep_legal_nombre || 'Pendiente'}</div>
       </div>
       <div className="text-right max-w-xs">
          <p className="text-[9px] text-gray-300 font-bold leading-relaxed uppercase">Documento oficial bajo Res. 0312/2019 de Colombia.</p>
       </div>
    </div>
  );
}

function TemplateLineaBase({ data }) {
  const total = data.length || 60;
  const compliant = data.filter(d => d.result === 'yes').length;
  const perc = Math.round((compliant / total) * 100) || 0;
  return (
    <div className="space-y-12">
       <div className="grid grid-cols-2 gap-10">
          <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Porcentaje Cumplimiento</span>
              <h2 className="text-5xl font-black text-gray-900 leading-none">{perc}%</h2>
          </div>
          <div className="flex flex-col justify-center">
             <p className="text-sm text-gray-500 leading-relaxed font-serif">Informe de diagnóstico inicial para establecer la brecha normativa y el plan de mejoramiento necesario.</p>
          </div>
       </div>
       <div className="overflow-hidden border border-gray-100 rounded-3xl">
          <table className="w-full text-left text-xs border-collapse">
             <thead>
                <tr className="bg-gray-900 text-white font-black uppercase tracking-widest">
                   <th className="p-4 px-6">Estándar</th>
                   <th className="p-4 px-6">Resultado</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {data.length > 0 ? data.slice(0, 20).map((d, i) => (
                   <tr key={i}><td className="p-4 px-6 font-medium text-gray-700">{d.name}</td><td className={`p-4 px-6 font-black uppercase ${d.result === 'yes' ? 'text-green-600' : 'text-red-500'}`}>{d.result === 'yes' ? '✓ CUMPLE' : '✗ NO CUMPLE'}</td></tr>
                )) : <tr><td colSpan="2" className="p-10 text-center text-gray-300 font-black uppercase">No hay hallazgos</td></tr>}
             </tbody>
          </table>
       </div>
    </div>
  );
}

function TemplatePlanCapacitacion({ data }) {
  return (
    <div className="space-y-12">
       <div className="overflow-hidden border border-gray-100 rounded-3xl">
          <table className="w-full text-left text-[11px] border-collapse">
             <thead>
                <tr className="bg-gray-900 text-white font-black uppercase tracking-widest"><th className="p-4 px-6">Tema</th><th className="p-4 px-6">Fuente</th><th className="p-4 px-6">Estado</th></tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {data.length > 0 ? data.map((item, idx) => (
                  <tr key={idx}><td className="p-4 px-6 font-black text-gray-800">{item.tema}</td><td className="p-4 px-6 font-bold text-gray-400">{item.fuente}</td><td className="p-4 px-6"><span className={item.estado === 'Ejecutado' ? 'text-green-600 font-black' : 'text-orange-500 font-black'}>{item.estado === 'Ejecutado' ? 'Cumplido ✅' : 'Programado ⏳'}</span></td></tr>
                )) : <tr><td colSpan="3" className="p-10 text-center text-gray-300 font-black uppercase">Vacio</td></tr>}
             </tbody>
          </table>
       </div>
    </div>
  );
}

function TemplateCumplimiento({ phva }) {
  const allDocs = phva || {};
  return (
    <div className="space-y-12">
       {Object.keys(allDocs).map(ciclo => (
         <div key={ciclo} className="space-y-4">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{ciclo}</h5>
            <div className="overflow-hidden border border-gray-100 rounded-3xl">
               <table className="w-full text-left text-[11px] border-collapse">
                  <tbody className="divide-y divide-gray-100">
                     {allDocs[ciclo].map((doc, idx) => (
                        <tr key={idx}><td className="p-4 px-6 font-medium text-gray-700">{doc.name}</td><td className="p-4 px-6 text-center"><span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${doc.status === 'executed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{doc.status === 'executed' ? 'EJECUTADO' : 'PENDIENTE'}</span></td></tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
       ))}
    </div>
  );
}

function TemplateAccidentalidad({ data }) {
  return (
    <div className="space-y-12">
       <div className="overflow-hidden border border-gray-100 rounded-3xl">
          <table className="w-full text-left text-[11px] border-collapse">
             <thead>
                <tr className="bg-gray-900 text-white font-black uppercase tracking-widest"><th className="p-4 px-6">Fecha</th><th className="p-4 px-6">Trabajador</th><th className="p-4 px-6">Tipo</th></tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {data.length > 0 ? data.map((item, idx) => (
                   <tr key={idx}><td className="p-4 px-6 font-bold text-gray-600">{item.fecha_accidente}</td><td className="p-4 px-6 font-black text-gray-800 uppercase">{item.trabajador_nombre}</td><td className="p-4 px-6 text-gray-500 font-bold">{item.tipo}</td></tr>
                )) : <tr><td colSpan="3" className="p-10 text-center text-gray-300 font-black uppercase">No hay registros</td></tr>}
             </tbody>
          </table>
       </div>
    </div>
  );
}
