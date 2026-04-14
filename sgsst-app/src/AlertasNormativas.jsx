import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  ExternalLink, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Calendar,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

// Alertas iniciales removidas, ahora vienen del Backend.

export default function AlertasNormativas({ profile }) {
  const [alertas, setAlertas] = useState([]);
  const [filterImpact, setFilterImpact] = useState('Todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    fetch(`http://localhost:8000/api/empresas/${profile.id}/alertas`)
      .then(res => {
        if (!res.ok) throw new Error('Error en el servidor o empresa no encontrada');
        return res.json();
      })
      .then(data => {
        setAlertas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setAlertas([]);
        setLoading(false);
      });
  }, [profile]);

  const pendientes = alertas.filter(a => !a.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch('http://localhost:8000/api/empresas/alertas/leer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: profile.id,
          alerta_id: id
        })
      });
      if(response.ok) {
        setAlertas(alertas.map(a => a.id === id ? { ...a, read: true } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Crítico': return 'bg-red-100 text-red-700 border-red-200';
      case 'Alto': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medio': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Bajo': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredAlertas = alertas.filter(a => filterImpact === 'Todos' ? true : a.impact === filterImpact);

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center">
            <Bell className="w-8 h-8 mr-3 text-orange-500" /> Alertas Normativas
          </h2>
          <p className="text-gray-500 mt-1">Vigilancia legislativa inteligente del Ministerio de Trabajo en tiempo real.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 font-medium text-gray-700 flex items-center">
             <ShieldAlert className="w-5 h-5 text-red-500 mr-2" />
             Pendientes de Leer: <span className="ml-2 font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{pendientes}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
         <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Buscar norma, resolución, decreto..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" />
         </div>
         <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            {['Todos', 'Crítico', 'Alto', 'Medio', 'Bajo'].map(filtro => (
              <button 
                key={filtro}
                onClick={() => setFilterImpact(filtro)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterImpact === filtro ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                {filtro}
              </button>
            ))}
         </div>
      </div>

      <div className="space-y-6">
        {loading && (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}
        {!loading && filteredAlertas.map((alerta) => (
          <div key={alerta.id} className={`bg-white rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${alerta.read ? 'border-gray-100 opacity-75' : 'border-orange-200 shadow-md'}`}>
            {!alerta.read && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 text-orange-600 rounded-bl-3xl flex items-start justify-end p-3 pointer-events-none">
                <span className="text-xs font-black tracking-widest block transform rotate-45 translate-x-2 -translate-y-2 uppercase">Nuevo</span>
              </div>
            )}
            
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getImpactColor(alerta.impact)} uppercase tracking-wider`}>
                    Impacto: {alerta.impact}
                  </span>
                  <span className="flex items-center text-gray-500 text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-1.5" /> {alerta.date}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                    {alerta.norma}
                  </span>
                </div>
                
                <h3 className={`text-2xl font-bold mb-3 ${alerta.read ? 'text-gray-700' : 'text-gray-900'}`}>
                  {alerta.title}
                </h3>
                
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  {alerta.description}
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start">
                   <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                   <div>
                     <h4 className="text-sm font-bold text-blue-800 uppercase tracking-widest mb-1">Impacto en tu SG-SST (Requerido)</h4>
                     <p className="text-blue-900 text-sm font-medium">{alerta.actionRequired}</p>
                   </div>
                </div>
              </div>
              
              <div className="w-full md:w-48 flex flex-col justify-center space-y-3 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                {!alerta.read ? (
                  <button 
                    onClick={() => handleMarkAsRead(alerta.id)}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex justify-center items-center group/btn"
                  >
                    Marcar Leído <CheckCircle2 className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
                  </button>
                ) : (
                  <div className="w-full py-3 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200 flex justify-center items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Analizado
                  </div>
                )}
                
                <button
                  onClick={() => window.open(`https://www.google.com/search?q=norma+colombiana+${encodeURIComponent(alerta.norma)}+${encodeURIComponent(alerta.title)}`, '_blank')}
                  className="w-full py-3 bg-white hover:bg-gray-50 text-gray-600 font-bold rounded-xl border border-gray-200 transition-all shadow-sm flex justify-center items-center"
                >
                  Ver Ley Original <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && filteredAlertas.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <ShieldAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500">No hay alertas con ese nivel de impacto</h3>
          </div>
        )}
      </div>
    </div>
  );
}
