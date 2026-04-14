import React, { useState } from 'react';
import { Building, Users, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Shield, X } from 'lucide-react';
import { api } from './services/api';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    workers: '',
    risk: '1',
    ciiu: ''
  });
  
  const [diagnostic, setDiagnostic] = useState(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const ProfessionalDisclaimer = () => {
    const [show, setShow] = useState(() => {
      const hiddenUntil = localStorage.getItem('sgsst_disclaimer_hidden');
      return !hiddenUntil || Date.now() > parseInt(hiddenUntil);
    });

    if (!show) return null;

    const dismiss = () => {
      const sevenDays = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('sgsst_disclaimer_hidden', sevenDays.toString());
      setShow(false);
    };

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mb-8 flex items-center justify-between group text-left">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
          <p className="text-xs text-gray-300 pr-4">
            <span className="text-yellow-400 font-bold">Aviso legal: </span>
            Este sistema es un apoyo tecnológico para organizar su proceso. <strong className="text-white">No sustituye la gestión ni responsabilidades de un técnico, tecnólogo o profesional en SST con licencia vigente.</strong> El cumplimiento legal requiere la supervisión constante de personal calificado.
          </p>
        </div>
        <button 
          onClick={dismiss}
          className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
          title="Ocultar por 7 días"
        >
          <X size={16} />
        </button>
      </div>
    );
  };


  const calculateStandards = () => {
    const missingFields = [];
    if (!formData.name.trim()) missingFields.push('Nombre de la Empresa');
    if (!formData.workers) missingFields.push('Número de Trabajadores');
    if (!formData.ciiu.trim()) missingFields.push('Código CIIU');

    if (missingFields.length > 0) {
      if (missingFields.length === 1) {
        setError(`Falta completar un campo obligatorio: ${missingFields[0]}`);
      } else {
        const last = missingFields.pop();
        setError(`Faltan completar los siguientes campos: ${missingFields.join(', ')} y ${last}`);
      }
      return;
    }
    setError('');

    const workers = parseInt(formData.workers) || 0;
    let finalRisk = parseInt(formData.risk) || 1;
    
    // Validación de Inteligencia de Negocio: CIIU vs Riesgo ARL
    // Códigos de alto riesgo en Colombia (ej. Construcción, Minería, etc.)
    const highRiskCIIU = ['4111', '4112', '0510', '0520', '4390', '2021'];
    const isHighRiskActivity = highRiskCIIU.some(code => formData.ciiu.includes(code));
    
    if (isHighRiskActivity && finalRisk < 5) {
      finalRisk = 5;
      setWarning(`Alerta Normativa: Tu código CIIU (${formData.ciiu}) es una actividad de Alto Riesgo. El sistema corrigió automáticamente tu Nivel de Riesgo a Clase V para garantizar el cumplimiento de la ley.`);
    } else {
      setWarning('');
    }
    
    let standards = 60;
    let type = "Riesgo Alto / Gran Empresa";
    
    if (workers <= 10 && finalRisk <= 3) {
      standards = 7;
      type = "Microempresa (Riesgo Bajo/Medio)";
    } else if (workers > 10 && workers <= 50 && finalRisk <= 3) {
      standards = 21;
      type = "Pequeña/Mediana Empresa (Riesgo Bajo/Medio)";
    }

    setDiagnostic({ standards, type });
    setStep(2);
  };

  const handleFinish = async () => {
    const offlineProfile = {
      id: "local-" + Date.now(),
      nombre: formData.name,
      trabajadores: parseInt(formData.workers),
      nivel_riesgo: formData.risk,
      codigo_ciiu: formData.ciiu,
      cantidad_estandares: diagnostic.standards,
      clasificacion: diagnostic.type,
      rep_legal_nombre: formData.name || 'Usuario Offline'
    };

    try {
      const response = await api('/empresas', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.name,
          trabajadores: parseInt(formData.workers),
          nivel_riesgo: formData.risk,
          codigo_ciiu: formData.ciiu,
          cantidad_estandares: diagnostic.standards,
          clasificacion: diagnostic.type
        })
      });

      if (!response.ok) throw new Error('Error al guardar el perfil');
      
      const empresaGuardada = await response.json();
      onComplete(empresaGuardada);
    } catch (err) {
      console.warn("Backend 8000 apagado. Creando perfil offline localmente.");
      // EN VEZ DE BLOQUEAR CON ERROR, AVANZAMOS USANDO LOCALSTORAGE
      onComplete(offlineProfile);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
          <div className="bg-orange-500 p-8 text-white text-center">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-bold mb-2">Configuración Inicial SG-SST</h1>
            <p className="text-orange-100">Diagnóstico Express según Res. 0312 de 2019</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa</label>
                <div className="relative">
                  <Building className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input type="text" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" placeholder="Ej. Constructora ABC" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Trabajadores</label>
                  <div className="relative">
                    <Users className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input type="number" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej. 15" value={formData.workers} onChange={e => setFormData({...formData, workers: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Riesgo (ARL)</label>
                  <div className="relative flex items-center">
                    <AlertTriangle className="w-5 h-5 text-gray-400 absolute left-3 z-10" />
                    <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none appearance-none bg-white relative" value={formData.risk} onChange={e => setFormData({...formData, risk: e.target.value})}>
                      <option value="1">Clase I (Riesgo Mínimo)</option>
                      <option value="2">Clase II (Riesgo Bajo)</option>
                      <option value="3">Clase III (Riesgo Medio)</option>
                      <option value="4">Clase IV (Riesgo Alto)</option>
                      <option value="5">Clase V (Riesgo Máximo)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código CIIU (Actividad Económica) <span className="text-red-500">*</span></label>
                <p className="text-xs text-gray-500 mb-2 italic">Puedes encontrar este código en la casilla 46 del RUT de tu empresa o en el certificado de Cámara de Comercio.</p>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej. 4111 - Construcción" value={formData.ciiu} onChange={e => setFormData({...formData, ciiu: e.target.value})} />
              </div>

              {/* Se eliminó el bloque de error de aquí para moverlo abajo */}

              <button onClick={calculateStandards} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
                Generar Diagnóstico Express <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && diagnostic && (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 mt-4 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Diagnóstico Completado!</h2>
          <p className="text-gray-600 mb-8">Según la Resolución 0312, tu empresa ha sido clasificada como:</p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200 shadow-inner">
            <p className="text-lg font-semibold text-gray-800 mb-2">{diagnostic.type}</p>
            <div className="text-6xl font-black text-orange-500 mb-2">{diagnostic.standards}</div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Estándares Mínimos Aplicables</p>
          </div>

          {warning && (
            <div className="text-left bg-orange-50 text-orange-800 p-5 rounded-xl mb-8 border border-orange-200 flex shadow-sm animate-pulse">
               <AlertTriangle className="w-8 h-8 mr-3 flex-shrink-0 text-orange-600" />
              <p className="text-sm">
                <strong>{warning}</strong>
              </p>
            </div>
          )}

          <div className="text-left bg-blue-50 text-blue-800 p-5 rounded-xl mb-4 border border-blue-100 flex shadow-sm">
             <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Nota de Escalabilidad:</strong> El sistema ahora ocultará los requisitos de SG-SST que no aplican a tu perfil empresarial, ahorrándote tiempo y reprocesos documentales.
            </p>
          </div>

          {/* ── DESCARGO DE RESPONSABILIDAD ───────────────────────────────── */}
          <ProfessionalDisclaimer />

          <button onClick={handleFinish} className="w-full bg-gray-800 hover:bg-gray-900 shadow-md hover:shadow-lg text-white font-bold py-4 px-4 rounded-xl transition-all">
            Ir al Dashboard Principal
          </button>
        </div>
      )}
      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 p-4 rounded-2xl shadow-lg border border-red-100 max-w-md z-50 flex items-start gap-4">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">Error de Conexión</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
