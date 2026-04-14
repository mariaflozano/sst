import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, HeartPulse, UserMinus, Calendar, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { api } from './services/api';

export default function Indicadores({ companyProfile }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!companyProfile?.id) return;
    
    const fetchIndicadores = async () => {
      setLoading(true);
      try {
        const response = await api(`/empresas/${companyProfile.id}/indicadores-sst?anio=${year}`);
        if (response.ok) {
          setData(await response.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIndicadores();
  }, [companyProfile, year]);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-400 font-bold tracking-widest uppercase text-sm">Calculando fórmulas epidemiológicas...</div>;
  }

  const graficas = data?.grafica_mensual || [];
  const maxVal = Math.max(...graficas.map(g => g.incapacidades + g.accidentes), 10);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
         <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
              <Activity className="w-8 h-8 text-rose-600 mr-3" />
              Ficha de Indicadores SST
            </h2>
            <p className="text-sm text-gray-500 max-w-xl">
              Cálculo automatizado de la Resolución 0312 de 2019. Estas cifras cruzan en tiempo real los accidentes de la empresa con el ausentismo de sus trabajadores activos.
            </p>
         </div>
         <div className="mt-6 md:mt-0">
            <select 
              value={year} 
              onChange={e => setYear(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-rose-500 font-bold px-4 py-2"
            >
               <option value="2025">Año 2025</option>
               <option value="2026">Año 2026</option>
               <option value="2027">Año 2027</option>
            </select>
         </div>
      </div>

      {/* Tarjetas Principales (Top 4 Indicadores Minimos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Frecuencia */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldAlert className="w-24 h-24 text-rose-500" /></div>
            <div className="flex items-center text-rose-600 font-bold text-xs uppercase tracking-wider mb-4"><ShieldAlert className="w-4 h-4 mr-2" /> Frecuencia AT</div>
            <div className="flex items-end gap-2">
               <h3 className="text-4xl font-black text-gray-800 leading-none">{data?.frecuencia}</h3>
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">Por cada 100 trabajadores que laboraron, se presentaron {data?.frecuencia} accidentes.</p>
         </div>

         {/* Severidad */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><HeartPulse className="w-24 h-24 text-orange-500" /></div>
            <div className="flex items-center text-orange-600 font-bold text-xs uppercase tracking-wider mb-4"><HeartPulse className="w-4 h-4 mr-2" /> Severidad AT</div>
            <div className="flex items-end gap-2">
               <h3 className="text-4xl font-black text-gray-800 leading-none">{data?.severidad}</h3>
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">Por cada 100 trabajadores, se perdieron {data?.severidad} días por accidentes.</p>
         </div>

         {/* Mortales */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity className="w-24 h-24 text-purple-500" /></div>
            <div className="flex items-center text-purple-600 font-bold text-xs uppercase tracking-wider mb-4"><Activity className="w-4 h-4 mr-2" /> P. Mortales</div>
            <div className="flex items-end gap-2">
               <h3 className="text-4xl font-black text-gray-800 leading-none">{data?.mortales}%</h3>
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">Del 100% de los accidentes en el periodo, el {data?.mortales}% fueron letales.</p>
         </div>

         {/* Ausentismo */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><UserMinus className="w-24 h-24 text-blue-500" /></div>
            <div className="flex items-center text-blue-600 font-bold text-xs uppercase tracking-wider mb-4"><UserMinus className="w-4 h-4 mr-2" /> Ausentismo Médico</div>
            <div className="flex items-end gap-2">
               <h3 className="text-4xl font-black text-gray-800 leading-none">{data?.ausentismo}%</h3>
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">Se ha perdido el {data?.ausentismo}% de los días programados en el año.</p>
         </div>
      </div>

      {/* Totales y Gráfica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-gray-900 rounded-2xl shadow-sm p-8 text-white flex flex-col justify-center">
            <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-6">Totales del Periodo</h4>
            <div className="space-y-6">
               <div className="border-b border-gray-800 pb-6">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-3xl font-black">{data?.total_accidentes}</p>
                        <p className="text-xs text-gray-400 uppercase mt-1 tracking-widest">Accidentes Ocurridos</p>
                     </div>
                     <ShieldAlert className="w-10 h-10 text-rose-500 opacity-50" />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-3xl font-black">{data?.total_dias_perdidos}</p>
                        <p className="text-xs text-gray-400 uppercase mt-1 tracking-widest">Días de Incapacidad</p>
                     </div>
                     <Calendar className="w-10 h-10 text-blue-500 opacity-50" />
                  </div>
               </div>
            </div>
            <div className="mt-8 bg-gray-800 p-4 rounded-xl flex items-start text-xs text-gray-300">
               <Info className="w-4 h-4 mr-2 text-blue-400 shrink-0 mt-0.5" />
               <p>Estos indicadores se calculan basándose en la resolución 0312 extrayendo datos reales del módulo de Trabajadores.</p>
            </div>
         </div>

         {/* Grafica Simple de Barras Hibrida Días vs Accidentes */}
         <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
            <h4 className="text-gray-800 text-sm font-bold uppercase tracking-wider mb-6 flex items-center">
               Tendencia Mensual de Afectación SG-SST
            </h4>
            
            <div className="flex-1 flex items-end space-x-2 w-full pt-10 min-h-[250px]">
               {graficas.map((mes, idx) => (
                 <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    
                    {/* Tooltip Hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap z-10 pointer-events-none">
                       {mes.name}<br/>
                       <span className="text-blue-400 font-bold">{mes.incapacidades} Días</span><br/>
                       <span className="text-rose-400 font-bold">{mes.accidentes} ATs</span>
                    </div>

                    {/* Barra Días Perdidos (Azul) */}
                    <div 
                      style={{ height: `${(mes.incapacidades / maxVal) * 100}%` }} 
                      className="w-full max-w-[20px] bg-blue-100 group-hover:bg-blue-300 transition-colors rounded-t-sm relative"
                    >
                       {/* Barra Accidentes Oculta encima o contigua, para simplificar hacemos barra anidada si hay accidentes */}
                       {mes.accidentes > 0 && (
                         <div 
                           style={{ height: `${(mes.accidentes / (mes.incapacidades||1)) * 100}%`, minHeight: '4px', maxHeight: '100%' }}
                           className="absolute bottom-0 w-full bg-rose-500 rounded-t-sm"
                         ></div>
                       )}
                    </div>
                    {/* Fallback si ambos son CERO */}
                    {mes.incapacidades === 0 && mes.accidentes === 0 && (
                       <div className="w-full max-w-[20px] h-[2px] bg-gray-100 rounded-lg"></div>
                    )}

                    <span className="text-[10px] uppercase font-bold text-gray-400 mt-3">{mes.name}</span>
                 </div>
               ))}
            </div>
            
            {/* Leyenda */}
            <div className="mt-8 flex justify-center space-x-6 border-t border-gray-100 pt-6">
               <div className="flex items-center text-xs font-bold text-gray-500"><span className="w-3 h-3 bg-blue-100 mr-2 rounded-sm"></span> Días Incapacidad</div>
               <div className="flex items-center text-xs font-bold text-gray-500"><span className="w-3 h-3 bg-rose-500 mr-2 rounded-sm"></span> N° Accidentes</div>
            </div>
         </div>
      </div>
    </div>
  );
}
