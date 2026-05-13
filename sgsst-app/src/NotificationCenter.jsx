import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Calendar, BookOpen, Clock, X, Info, ShieldCheck } from 'lucide-react';

export default function NotificationCenter({ companyId, isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Todas'); // Todas, Normatividad, Plan Anual, Capacitaciones

  const loadNotifications = async () => {
    setLoading(true);
    let all = [];

    // 1. Alertas Normativas
    try {
      const resNorm = await fetch(`http://localhost:8000/api/empresas/${companyId}/alertas`);
      if (resNorm.ok) {
        const data = await resNorm.json();
        const norm = data.filter(a => !a.read).map(a => ({
          id: `norm_${a.id}`,
          type: 'Normatividad',
          title: a.title,
          description: a.description,
          date: a.date,
          icon: BookOpen,
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        }));
        all = [...all, ...norm];
      }
    } catch(e) {}

    // 2. Plan Anual (Pendientes / Vencidas)
    try {
      const resPlan = await fetch(`http://localhost:8000/api/empresas/${companyId}/plan-anual`);
      if (resPlan.ok) {
        const data = await resPlan.json();
        const plan = (data.data || data).filter(a => a.estado === 'Vencida' || a.estado === 'Pendiente').map(a => ({
          id: `plan_${a.id}`,
          type: 'Plan Anual',
          title: a.estado === 'Vencida' ? `⚠️ VENCIDA: ${a.actividad}` : a.actividad,
          description: `Vence el: ${a.fecha_fin} - Responsable: ${a.responsable}`,
          date: a.fecha_fin,
          icon: a.estado === 'Vencida' ? AlertTriangle : Clock,
          color: a.estado === 'Vencida' ? 'text-red-600' : 'text-orange-600',
          bg: a.estado === 'Vencida' ? 'bg-red-50' : 'bg-orange-50'
        }));
        all = [...all, ...plan];
      }
    } catch(e) {}

    // 3. Capacitaciones (Próximas o Vencidas)
    try {
      const resCap = await fetch(`http://localhost:8000/api/empresas/${companyId}/capacitaciones`);
      if (resCap.ok) {
        const data = await resCap.json();
        const cap = data.filter(c => c.estado === 'Programada' || c.estado === 'Vencida').map(c => ({
          id: `cap_${c.id}`,
          type: 'Capacitaciones',
          title: c.estado === 'Vencida' ? `⚠️ VENCIDA: ${c.tema}` : `Próxima: ${c.tema}`,
          description: `Fecha: ${c.fecha_programada} - Facilitador: ${c.facilitador}`,
          date: c.fecha_programada,
          icon: Calendar,
          color: c.estado === 'Vencida' ? 'text-red-600' : 'text-purple-600',
          bg: c.estado === 'Vencida' ? 'bg-red-50' : 'bg-purple-50'
        }));
        all = [...all, ...cap];
      }
    } catch(e) {}

    // 4. Investigaciones (Acciones Correctivas/Preventivas de Accidentes)
    try {
      const resInv = await fetch(`http://localhost:8000/api/empresas/${companyId}/investigaciones/alertas`);
      if (resInv.ok) {
        const data = await resInv.json();
        const inv = data.map(a => ({
          id: `inv_${a.investigacion_id}`,
          type: 'Investigación',
          title: `${a.tipo}: ${a.trabajador}`,
          description: a.mensaje,
          date: a.fecha_limite,
          icon: ShieldCheck,
          color: a.tipo === 'VENCIDO' ? 'text-red-700' : 'text-amber-700',
          bg: a.tipo === 'VENCIDO' ? 'bg-red-100' : 'bg-amber-50'
        }));
        all = [...all, ...inv];
      }
    } catch(e) {}

    // Sort by date (closest first)
    all.sort((a, b) => new Date(a.date) - new Date(b.date));
    setNotifications(all);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && companyId) {
      loadNotifications();
    }
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  const filtered = filter === 'Todas' ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div className="absolute right-0 top-12 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-amber-500 mr-2" />
          <h3 className="font-bold text-gray-800">Centro de Notificaciones</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Filtros rápidos */}
      <div className="px-3 py-2 bg-white border-b border-gray-100 flex space-x-1 overflow-x-auto no-scrollbar">
        {['Todas', 'Normatividad', 'Plan Anual', 'Capacitaciones', 'Investigación'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition ${filter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Cargando notificaciones...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center">
            <Info className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-sm">No hay notificaciones para mostrar en este filtro.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(notif => {
              const Icon = notif.icon;
              return (
                <div key={notif.id} className="p-4 hover:bg-gray-50 transition cursor-pointer flex items-start">
                  <div className={`p-2 rounded-lg ${notif.bg} ${notif.color} mr-3 flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{notif.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">{notif.description}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400">{notif.type} • {notif.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
