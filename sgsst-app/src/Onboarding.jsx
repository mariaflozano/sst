import React, { useState } from 'react';
import { Building, Users, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Shield, X, Mail, Lock } from 'lucide-react';
import { api, rapApi } from './services/api';

export default function Onboarding({ onComplete, isRegistering = true }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    workers: '',
    risk: '1',
    ciiu: ''
  });

  const [diagnostic, setDiagnostic] = useState(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);

  const ProfessionalDisclaimer = () => {
    const [show, setShow] = useState(() => {
      const hiddenUntil = localStorage.getItem('sgsst_disclaimer_hidden');
      return !hiddenUntil || Date.now() > parseInt(hiddenUntil);
    });

    if (!show) return null;

    const dismiss = () => {
      localStorage.setItem('sgsst_disclaimer_hidden', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
      setShow(false);
    };

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mb-8 flex items-center justify-between group text-left">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
          <p className="text-xs text-gray-300 pr-4">
            <span className="text-yellow-400 font-bold">Aviso legal: </span>
            Este sistema es un apoyo tecnológico para organizar su proceso.{' '}
            <strong className="text-white">No sustituye la gestión ni responsabilidades de un técnico, tecnólogo o profesional en SST con licencia vigente.</strong>
          </p>
        </div>
        <button onClick={dismiss} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800">
          <X size={16} />
        </button>
      </div>
    );
  };

  const calculateStandards = () => {
    const missing = [];
    if (!formData.name.trim()) missing.push('Nombre de la Empresa');
    if (isRegistering && !formData.email.trim()) missing.push('Correo electrónico');
    if (isRegistering && !formData.password) missing.push('Contraseña');
    if (isRegistering && formData.password !== formData.passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!formData.workers) missing.push('Número de Trabajadores');
    if (!formData.ciiu.trim()) missing.push('Código CIIU');

    if (missing.length > 0) {
      const last = missing.length > 1 ? missing.pop() : null;
      setError(last
        ? `Faltan: ${missing.join(', ')} y ${last}`
        : `Falta completar: ${missing[0]}`
      );
      return;
    }
    setError('');

    const workers = parseInt(formData.workers) || 0;
    let finalRisk = parseInt(formData.risk) || 1;

    const highRiskCIIU = ['4111', '4112', '0510', '0520', '4390', '2021'];
    if (highRiskCIIU.some(c => formData.ciiu.includes(c)) && finalRisk < 5) {
      finalRisk = 5;
      setWarning(`Alerta Normativa: Tu código CIIU (${formData.ciiu}) es actividad de Alto Riesgo. El sistema corrigió automáticamente el Nivel de Riesgo a Clase V.`);
    } else {
      setWarning('');
    }

    let standards = 60;
    let type = 'Riesgo Alto / Gran Empresa';
    if (workers <= 10 && finalRisk <= 3) { standards = 7; type = 'Microempresa (Riesgo Bajo/Medio)'; }
    else if (workers > 10 && workers <= 50 && finalRisk <= 3) { standards = 21; type = 'Pequeña/Mediana Empresa (Riesgo Bajo/Medio)'; }

    setDiagnostic({ standards, type });
    setStep(2);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');

    try {
      let auth = null;

      if (isRegistering) {
        // 1. Registrar usuario + tenant en tienda-multitenancy
        const regRes = await rapApi('/api/sgsst/register', {
          method: 'POST',
          body: JSON.stringify({
            business_name: formData.name,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.passwordConfirm,
            code_ciiu: formData.ciiu,
          }),
        });

        if (!regRes.ok) {
          const data = await regRes.json();
          const firstError = Object.values(data.errors ?? {})[0]?.[0] ?? data.message ?? 'Error al crear la cuenta';
          setError(firstError);
          return;
        }

        auth = await regRes.json();
        localStorage.setItem('sgsst_auth', JSON.stringify(auth));
      } else {
        // Ya está autenticado, leer auth guardada
        auth = JSON.parse(localStorage.getItem('sgsst_auth') ?? '{}');
      }

      // 2. Guardar datos SST en sgsst-backend
      const empRes = await api('/empresas', {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: auth.tenant_id,
          nombre: formData.name,
          trabajadores: parseInt(formData.workers),
          nivel_riesgo: formData.risk,
          codigo_ciiu: formData.ciiu,
          cantidad_estandares: diagnostic.standards,
          clasificacion: diagnostic.type,
        }),
      });

      if (!empRes.ok) throw new Error('Error al guardar la empresa');

      const empresa = await empRes.json();
      onComplete(empresa, auth);
    } catch (err) {
      setError(err.message || 'Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
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

          <div className="p-8 space-y-6">
            {/* Nombre empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa</label>
              <div className="relative">
                <Building className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input type="text" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej. Constructora ABC" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
            </div>

            {/* Email y contraseña — solo al registrarse */}
            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input type="email" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="correo@empresa.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input type="password" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input type="password" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Repite la contraseña" value={formData.passwordConfirm} onChange={e => setFormData({ ...formData, passwordConfirm: e.target.value })} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Trabajadores y riesgo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Trabajadores</label>
                <div className="relative">
                  <Users className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input type="number" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej. 15" value={formData.workers} onChange={e => setFormData({ ...formData, workers: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Riesgo (ARL)</label>
                <div className="relative flex items-center">
                  <AlertTriangle className="w-5 h-5 text-gray-400 absolute left-3 z-10" />
                  <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none appearance-none bg-white" value={formData.risk} onChange={e => setFormData({ ...formData, risk: e.target.value })}>
                    <option value="1">Clase I (Riesgo Mínimo)</option>
                    <option value="2">Clase II (Riesgo Bajo)</option>
                    <option value="3">Clase III (Riesgo Medio)</option>
                    <option value="4">Clase IV (Riesgo Alto)</option>
                    <option value="5">Clase V (Riesgo Máximo)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CIIU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código CIIU (Actividad Económica) <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2 italic">Casilla 46 del RUT o certificado de Cámara de Comercio.</p>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej. 4111 - Construcción" value={formData.ciiu} onChange={e => setFormData({ ...formData, ciiu: e.target.value })} />
            </div>

            <button onClick={calculateStandards} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              Generar Diagnóstico Express <ArrowRight className="ml-2 w-5 h-5" />
            </button>
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
            <div className="text-left bg-orange-50 text-orange-800 p-5 rounded-xl mb-8 border border-orange-200 flex shadow-sm">
              <AlertTriangle className="w-8 h-8 mr-3 flex-shrink-0 text-orange-600" />
              <p className="text-sm"><strong>{warning}</strong></p>
            </div>
          )}

          {error && (
            <div className="text-left bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <ProfessionalDisclaimer />

          <button
            onClick={handleFinish}
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-60 shadow-md text-white font-bold py-4 px-4 rounded-xl transition-all"
          >
            {loading ? 'Creando tu cuenta...' : 'Ir al Dashboard Principal'}
          </button>
        </div>
      )}

      {error && step === 1 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 p-4 rounded-2xl shadow-lg border border-red-100 max-w-md z-50 flex items-start gap-4">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">Campos requeridos</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
