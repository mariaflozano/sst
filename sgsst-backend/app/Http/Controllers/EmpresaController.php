<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmpresaController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'trabajadores' => 'required|integer',
            'nivel_riesgo' => 'required|string',
            'codigo_ciiu' => 'required|string',
            'cantidad_estandares' => 'nullable|integer',
            'clasificacion' => 'nullable|string',
        ]);

        $empresa = Empresa::create($validated);

        return response()->json($empresa, 201);
    }

    public function show($id)
    {
        $empresa = Empresa::findOrFail($id);
        return response()->json($empresa);
    }

    public function update(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'trabajadores' => 'sometimes|required|integer',
            'nivel_riesgo' => 'sometimes|required|string',
            'codigo_ciiu' => 'sometimes|required|string',
            'cantidad_estandares' => 'nullable|integer',
            'clasificacion' => 'nullable|string',
            'direccion' => 'nullable|string|max:255',
            'ciudad' => 'nullable|string|max:100',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            // ARL
            'arl_nombre' => 'nullable|string|max:255',
            'arl_nit' => 'nullable|string|max:50',
            'arl_telefono' => 'nullable|string|max:50',
            'arl_direccion' => 'nullable|string|max:255',
            // Representante Legal
            'rep_legal_nombre' => 'nullable|string|max:255',
            'rep_legal_cedula' => 'nullable|string|max:50',
            'rep_legal_cargo' => 'nullable|string|max:100',
            'rep_legal_firma_url' => 'nullable|string',
            // Branding
            'logo_url' => 'nullable|string',
            'sitio_web' => 'nullable|string|max:255',
        ]);

        $empresa->update($validated);

        return response()->json($empresa);
    }

    public function uploadLogo(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        $request->validate([
            'logo' => 'required|file|mimes:png,jpg,jpeg,webp|max:2048',
        ]);

        $archivo = $request->file('logo');

        // Eliminar logo anterior si existe
        if ($empresa->logo_url) {
            Storage::disk('public')->delete($empresa->logo_url);
        }

        $path = $archivo->store("logos/{$id}", 'public');

        $empresa->update(['logo_url' => $path]);

        return response()->json($empresa);
    }

    public function uploadFirma(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        $request->validate([
            'firma' => 'required|file|mimes:png,jpg,jpeg,webp,pdf|max:2048',
        ]);

        $archivo = $request->file('firma');

        // Eliminar firma anterior si existe
        if ($empresa->rep_legal_firma_url) {
            Storage::disk('public')->delete($empresa->rep_legal_firma_url);
        }

        $path = $archivo->store("firmas/{$id}", 'public');

        $empresa->update(['rep_legal_firma_url' => $path]);

        return response()->json($empresa);
    }
}
