import React, { useState, useEffect } from 'react';
import {
  Building2,
  LayoutDashboard,
  ClipboardCheck,
  FileCheck2,
  FolderOpen,
  BookOpen,
  Bell,
  Settings,
  Calendar as CalendarIcon,
  GraduationCap,
  HeartPulse,
  FileBarChart,
  Search,
  Moon,
  ChevronDown,
  PlusCircle,
  Users,
  Package,
  Calculator,
  TrendingUp,
  BarChart2,
  DollarSign,
  Activity,
  ClipboardList
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Componentes del Sistema
import Login from './Login';
import Onboarding from './Onboarding';
import PHVA from './PHVA';
import BancoFormatos from './BancoFormatos';
import MatrizLegal from './MatrizLegal';
import AlertasNormativas from './AlertasNormativas';
import Parametros from './Parametros';
import PlanAnual from './PlanAnual';
import Capacitaciones from './Capacitaciones';
import Accidentalidad from './Accidentalidad';
import NotificationCenter from './NotificationCenter';
import Reportes from './Reportes';
import DetailedDiagnosis from './DetailedDiagnosis';
import Trabajadores from './Trabajadores';
import Indicadores from './Indicadores';
import Auditorias from './Auditorias';
import { api } from './services/api';

export default function App() {
  const [view, setView] = useState('loading');
  const [authState, setAuthState] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({ cumplidos: 0, total: 60, porcentaje: 0 });
  const [unreadAlertas, setUnreadAlertas] = useState(0);

  const displayName = companyProfile?.rep_legal_nombre || authState?.user?.name || companyProfile?.nombre || 'Usuario';

  // Cargar sesión al iniciar
  useEffect(() => {
    const init = async () => {
      const savedAuth    = localStorage.getItem('sgsst_auth');
      const savedProfile = localStorage.getItem('sgsst_company_profile');

      if (!savedAuth) { setView('login'); return; }

      const auth = JSON.parse(savedAuth);
      setAuthState(auth);

      if (savedProfile) {
        setCompanyProfile(JSON.parse(savedProfile));
        setView('dashboard');
        return;
      }

      // Hay sesión pero no perfil local — intentar cargarlo del backend
      if (auth.tenant_id) {
        try {
          const res = await api(`/mi-empresa?tenant_id=${auth.tenant_id}`);
          if (res.ok) {
            const empresa = await res.json();
            if (empresa) {
              localStorage.setItem('sgsst_company_profile', JSON.stringify(empresa));
              setCompanyProfile(empresa);
              setView('dashboard');
              return;
            }
          }
        } catch (error) {
          alert("Error al cargar el perfil de la empresa. Por favor contacte a soporte.");
          console.error(error);
        }
      }

      // Sin tenant_id o sin conexión → pedir login de nuevo
      setView('login');
    };
    init();
  }, []);

  const handleLogin = async (auth, empresa) => {
    setAuthState(auth);

    if (empresa) {
      localStorage.setItem('sgsst_company_profile', JSON.stringify(empresa));
      setCompanyProfile(empresa);
      setView('dashboard');
      return;
    }

    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('sgsst_auth');
    localStorage.removeItem('sgsst_company_profile');
    setAuthState(null);
    setCompanyProfile(null);
    setView('login');
  };

  const fetchDashboardStats = async () => {
    if (!companyProfile?.id) return;
    try {
      const response = await api(`/empresas/${companyProfile.id}/estadisticas`);
      if (response.ok) {
        const data = await response.json();
        setDashboardStats({
          cumplidos: data.cumplidos || 0,
          total: data.total_requeridos || 60,
          porcentaje: data.porcentaje_cumplimiento || 0
        });
      }
    } catch (e) {
      console.warn('Error fetching dashboard stats from backend:', e);
    }
  };

  // Recalcular estadísticas del Dashboard cuando cambie el perfil o la vista (cada vez que vuelva al dashboard)
  useEffect(() => {
    if (view === 'dashboard' && companyProfile) {
      fetchDashboardStats();
    }
  }, [view, companyProfile]);

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onGoToRegister={() => setView('onboarding')}
      />
    );
  }

  if (view === 'onboarding') {
    return (
      <Onboarding
        isRegistering={!authState}
        onComplete={(empresa, auth) => {
          if (auth) {
            setAuthState(auth);
            localStorage.setItem('sgsst_auth', JSON.stringify(auth));
          }
          localStorage.setItem('sgsst_company_profile', JSON.stringify(empresa));
          setCompanyProfile(empresa);
          setView('dashboard');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      
      {/* SIDEBAR ORIGINAL LIMPIO */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col no-print">
        <div className="p-4 border-b border-gray-200 flex items-center mb-2">
          <Building2 className="w-8 h-8 text-orange-500 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">
            <span className="text-orange-500">SG</span>-SST <span className="text-xs text-blue-600 border border-blue-600 px-1 rounded ml-1">PRO</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <SidebarButton view="dashboard" current={view} setView={setView} icon={LayoutDashboard} label="Dashboard" />
          <SidebarButton view="diagnostico" current={view} setView={setView} icon={ClipboardCheck} label="Diagnóstico Inicial" />
          <SidebarButton view="phva" current={view} setView={setView} icon={FileCheck2} label="Ciclo PHVA" />
          <SidebarButton view="formatos" current={view} setView={setView} icon={FolderOpen} label="Banco de Formatos" />
          <SidebarButton view="matriz" current={view} setView={setView} icon={BookOpen} label="Matriz Legal" />
          <SidebarButton view="trabajadores" current={view} setView={setView} icon={Users} label="Trabajadores" />
          <SidebarButton view="alertas" current={view} setView={setView} icon={Bell} label="Alertas Normativas" />
          <SidebarButton view="parametros" current={view} setView={setView} icon={Settings} label="Empresa" />
          <SidebarButton view="plananual" current={view} setView={setView} icon={CalendarIcon} label="Plan Anual" />
          <SidebarButton view="capacitaciones" current={view} setView={setView} icon={GraduationCap} label="Capacitaciones" />
          <SidebarButton view="accidentalidad" current={view} setView={setView} icon={HeartPulse} label="Accidentalidad" />
          <SidebarButton view="indicadores" current={view} setView={setView} icon={Activity} label="Indicadores SST" />
          <SidebarButton view="auditorias" current={view} setView={setView} icon={ClipboardList} label="Auditorías" />
          <SidebarButton view="reports" current={view} setView={setView} icon={FileBarChart} label="Reportes & PDF" />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                 {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                 <p className="text-xs text-gray-500 truncate">Riesgo {companyProfile?.nivel_riesgo || 'I'}</p>
              </div>
            </div>
            <button
               onClick={handleLogout}
               className="text-xs text-red-500 hover:bg-red-50 p-1 rounded font-medium"
               title="Cerrar sesión"
            >
               Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 relative overflow-hidden">
        
        {/* HEADER LIMPIO */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 no-print">
           <div className="flex items-center text-gray-400">
              <Search className="w-5 h-5 cursor-pointer hover:text-gray-600" />
           </div>
           <div className="flex items-center space-x-4">
              <Moon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <div className="relative">
                  <div 
                     className="cursor-pointer hover:text-gray-600 text-gray-400 relative"
                     onClick={() => setShowNotifications(!showNotifications)}
                  >
                     <Bell className="w-5 h-5" />
                     {unreadAlertas > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                  </div>
                  <NotificationCenter 
                     isOpen={showNotifications} 
                     onClose={() => setShowNotifications(false)} 
                     companyId={companyProfile?.id}
                  />
              </div>
              <div className="flex items-center ml-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">{displayName}</span>
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                     {displayName.charAt(0).toUpperCase()}
                  </div>
              </div>
           </div>
        </header>

        {/* CONTENIDO DE LAS VISTAS */}
        <div className="flex-1 overflow-auto relative p-6">
           {view === 'dashboard' && (
             <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Top Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center">
                   <div className="mb-6 lg:mb-0">
                      <h2 className="text-3xl font-bold text-gray-800 mb-1">Bienvenido, {displayName}</h2>
                      <p className="text-sm font-medium text-gray-500 mb-6">Resumen del Sistema de Gestión de Seguridad y Salud en el Trabajo</p>
                      
                      {/* Fake Date Range Picker for Aesthetics */}
                      <div className="flex items-center space-x-6 bg-gray-50/50 border border-gray-100 rounded-xl p-3 inline-flex">
                         <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Rango de Datos</p>
                            <div className="flex items-center space-x-4">
                               <div>
                                  <p className="text-[9px] text-gray-400 uppercase">Desde</p>
                                  <div className="flex items-center text-sm font-bold text-gray-700">
                                     01/01/2026 <CalendarIcon className="w-3.5 h-3.5 ml-2 text-gray-400" />
                                  </div>
                               </div>
                               <div className="w-px h-8 bg-gray-200"></div>
                               <div>
                                  <p className="text-[9px] text-gray-400 uppercase">Hasta</p>
                                  <div className="flex items-center text-sm font-bold text-gray-700">
                                     06/04/2026 <CalendarIcon className="w-3.5 h-3.5 ml-2 text-gray-400" />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Quick Action Buttons */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 w-full lg:w-auto">
                      <QuickAction icon={PlusCircle} label="NUEVO REPORTE" color="blue" onClick={() => setView('accidentalidad')} />
                      <QuickAction icon={Users} label="TRABAJADORES" color="green" onClick={() => setView('parametros')} />
                      <QuickAction icon={Users} label="TRABAJADORES" color="green" onClick={() => setView('trabajadores')} />
                      <QuickAction icon={FolderOpen} label="DOCUMENTOS" color="yellow" onClick={() => setView('phva')} />
                      <QuickAction icon={Calculator} label="EVALUACIÓN" color="purple" onClick={() => setView('diagnostico')} />
                   </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={DollarSign} title="Estándares Cumplidos" value={dashboardStats.cumplidos} color="blue" />
                    <StatCard icon={Users} title="Total Empleados (Perfil)" value={companyProfile?.trabajadores || companyProfile?.numero_trabajadores || '0'} color="green" />
                    <StatCard icon={Activity} title="Módulo Indicadores" value="Activo" color="yellow" />
                    <StatCard icon={BarChart2} title="PORCENTAJE AVANCE" value={`${dashboardStats.porcentaje}%`} color="purple" special />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                   {/* Left Chart (Empty/Line Chart Representation) */}
                   <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <div className="flex items-center mb-8">
                         <div className="bg-blue-50 p-2 rounded-lg mr-3">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                         </div>
                         <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">AVANCE POR DÍA</h3>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                         {[1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0].map((val, i) => (
                            <div key={i} className="flex items-center w-full">
                               <span className="text-[10px] font-bold text-gray-400 w-8">{val === 0 || val === 1 ? val : val.toFixed(1)}</span>
                               <div className="flex-1 h-px bg-gray-100 ml-2"></div>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Right Chart (Solid Purple Bar Chart) */}
                   <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                      <div className="mb-8">
                         <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">CUMPLIMIENTO GLOBAL</p>
                         <h3 className="text-3xl font-black text-gray-800">{dashboardStats.cumplidos} ESTÁNDARES</h3>
                      </div>
                      <div className="flex-1 min-h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{name: 'Actual', value: dashboardStats.cumplidos}]}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} domain={[0, dashboardStats.total || 60]} />
                               <Tooltip cursor={{fill: 'transparent'}} />
                               <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>
             </div>
           )}
           {view === 'diagnostico' && <DetailedDiagnosis profile={companyProfile} onClose={() => setView('dashboard')} />}
           {view === 'trabajadores' && <Trabajadores companyProfile={companyProfile} />}
           {view === 'phva' && <PHVA profile={companyProfile} standards={companyProfile?.standards} />}
           {view === 'formatos' && <BancoFormatos />}
           {view === 'matriz' && <MatrizLegal profile={companyProfile} />}
           {view === 'alertas' && <AlertasNormativas profile={companyProfile} />}
           {view === 'parametros' && <Parametros profile={companyProfile} onSave={(updated) => setCompanyProfile(updated)} />}
           {view === 'plananual' && <PlanAnual profile={companyProfile} />}
           {view === 'capacitaciones' && <Capacitaciones profile={companyProfile} />}
           {view === 'accidentalidad' && <Accidentalidad companyProfile={companyProfile} />}
           {view === 'indicadores' && <Indicadores companyProfile={companyProfile} />}
           {view === 'auditorias' && <Auditorias companyProfile={companyProfile} />}
           {view === 'reports' && <Reportes profile={companyProfile} />}
        </div>
      </main>
    </div>
  );
}

// Subcomponentes del Sidebar
function SidebarButton({ view, current, setView, icon: Icon, label }) {
  const active = view === current;
  return (
    <button 
      onClick={() => setView(view)} 
      className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors font-medium text-sm
        ${active 
          ? 'bg-orange-50 text-orange-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
       <Icon className={`w-5 h-5 mr-3 ${active ? 'text-orange-600' : 'text-gray-400'}`} />
       {label}
    </button>
  );
}

// Helper Components for Dashboard
function QuickAction({ icon: Icon, label, color, onClick }) {
   const colors = {
      blue: "text-blue-500 bg-blue-50",
      green: "text-green-500 bg-green-50",
      yellow: "text-yellow-500 bg-yellow-50",
      purple: "text-purple-500 bg-purple-50"
   };
   return (
      <button onClick={onClick} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow bg-white">
         <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
            <Icon className="w-6 h-6" />
         </div>
         <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider text-center">{label}</span>
      </button>
   );
}

function StatCard({ icon: Icon, title, value, color, special }) {
   const colorClasses = {
      blue: "text-blue-500 bg-blue-50",
      green: "text-green-500 bg-green-50",
      yellow: "text-yellow-500 bg-yellow-50",
      purple: "text-purple-500 bg-purple-50"
   };
   
   return (
      <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-5 ${special ? 'border-b-4 border-b-purple-500' : ''}`}>
         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
            <Icon className="w-7 h-7" />
         </div>
         <div className="overflow-hidden">
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${special ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
            <h3 className="text-3xl font-black text-gray-800 truncate">{value}</h3>
         </div>
      </div>
   );
}
