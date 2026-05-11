import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, AlertTriangle } from 'lucide-react';
import { rapApi, api } from './services/api';

export default function Login({ onLogin, onGoToRegister }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await rapApi('/api/sgsst/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.errors?.email?.[0] ?? data.message ?? 'Credenciales incorrectas';
        setError(msg);
        return;
      }

      const auth = await res.json();
      localStorage.setItem('sgsst_auth', JSON.stringify(auth));

      // Intentar cargar empresa existente
      let empresa = null;
      if (auth.tenant_id) {
        try {
          const empRes = await api(`/mi-empresa?tenant_id=${auth.tenant_id}`);
          if (empRes.ok) empresa = await empRes.json();
        } catch {
          // Sin empresa aún, onboarding se encarga
        }
      }

      onLogin(auth, empresa);
    } catch {
      setError('No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="bg-orange-500 p-8 text-white text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-2xl font-bold mb-1">SG-SST Pro</h1>
          <p className="text-orange-100 text-sm">Sistema de Gestión en Seguridad y Salud en el Trabajo</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="correo@empresa.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Primera vez?{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-orange-500 hover:text-orange-600 font-semibold"
            >
              Crear cuenta
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
