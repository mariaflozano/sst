<?php

use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\EstandarProgresoController;
use App\Http\Controllers\AlertaController;
use App\Http\Controllers\AccidenteController;
use App\Http\Controllers\InvestigacionController;
use App\Http\Controllers\PlanAnualController;
use App\Http\Controllers\TrabajadorController;
use App\Http\Controllers\AusentismoController;
use App\Http\Controllers\IndicadorController;
use App\Http\Controllers\AuditoriaController;
use App\Http\Controllers\EvaluacionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/mi-empresa', [EmpresaController::class, 'miEmpresa'])->middleware('auth:sanctum');

Route::post('/empresas', [EmpresaController::class, 'store'])->middleware('auth:sanctum');
Route::get('/empresas/{id}', [EmpresaController::class, 'show']);
Route::put('/empresas/{id}', [EmpresaController::class, 'update']);
Route::post('/empresas/{id}/logo', [EmpresaController::class, 'uploadLogo']);
Route::post('/empresas/{id}/firma', [EmpresaController::class, 'uploadFirma']);
// Buscar empresa por tenant_id (útil para validaciones)
Route::get('/empresas/buscar-por-tenant/{tenant_id}', [EmpresaController::class, 'buscarPorTenant']);

// Trabajadores
Route::get('/empresas/{id}/trabajadores', [TrabajadorController::class, 'index']);
Route::post('/empresas/trabajadores', [TrabajadorController::class, 'store']);
Route::put('/empresas/trabajadores/{id}', [TrabajadorController::class, 'update']);
Route::delete('/empresas/trabajadores/{id}', [TrabajadorController::class, 'destroy']);

// Ausentismo (Incapacidades)
Route::get('/empresas/{id}/ausentismos', [AusentismoController::class, 'index']);
Route::post('/ausentismos', [AusentismoController::class, 'store']);
Route::put('/ausentismos/{id}', [AusentismoController::class, 'update']);
Route::delete('/ausentismos/{id}', [AusentismoController::class, 'destroy']);

Route::get('/empresas/{id}/progreso', [EstandarProgresoController::class, 'index']);
Route::get('/empresas/{id}/estadisticas', [EstandarProgresoController::class, 'getDashboardStats']);
Route::get('/empresas/{id}/indicadores-sst', [IndicadorController::class, 'obtenerIndicadores']);
Route::post('/progreso-estandar', [EstandarProgresoController::class, 'updateOrCreate']);
Route::post('/progreso-estandar/upload', [EstandarProgresoController::class, 'uploadEvidence']);
Route::post('/progreso-estandar/delete', [EstandarProgresoController::class, 'deleteEvidence']);
Route::get('/evidencia/ver', [EstandarProgresoController::class, 'viewEvidence']);

Route::get('/empresas/{id}/alertas', [AlertaController::class, 'index']);
Route::post('/empresas/alertas/leer', [AlertaController::class, 'marcarLeida']);
Route::get('/empresas/{id}/matriz-legal', [AlertaController::class, 'matrizLegal']);
Route::get('/empresas/{id}/biblioteca-legal', [AlertaController::class, 'biblioteca']);
Route::post('/empresas/matriz-legal/add', [AlertaController::class, 'addToMatrix']);
Route::post('/empresas/matriz-legal/custom', [AlertaController::class, 'addCustomNorm']);
Route::put('/empresas/matriz-legal/custom/{id}', [AlertaController::class, 'updateCustomNorm']);
Route::delete('/empresas/matriz-legal/custom/{id}', [AlertaController::class, 'destroyCustomNorm']);
Route::get('/empresas/{id}/matriz-legal/consolidado', [AlertaController::class, 'consolidado']);
Route::get('/empresas/{id}/matriz-legal/documentos', [AlertaController::class, 'listDocuments']);
Route::post('/empresas/{id}/matriz-legal/upload-documento', [AlertaController::class, 'uploadDocument']);
Route::post('/empresas/{id}/matriz-legal/discover', [AlertaController::class, 'discoverNorms']);
Route::delete('/empresas/matriz-legal/documentos/{id}', [AlertaController::class, 'destroyDocument']);
Route::post('/empresas/matriz-legal/clear-evidence/{itemId}', [AlertaController::class, 'clearEvidence']);
Route::post('/empresas/matriz-legal/upload-evidence/{itemId}', [AlertaController::class, 'uploadEvidence']);
Route::get('/empresas/matriz-legal/evidence/{itemId}', [AlertaController::class, 'getEvidenceUrl']);

Route::get('/empresas/{id}/accidentes', [AccidenteController::class, 'index']);
Route::post('/empresas/accidentes', [AccidenteController::class, 'store']);
Route::put('/accidentes/{id}', [AccidenteController::class, 'update']);
Route::delete('/accidentes/{id}', [AccidenteController::class, 'destroy']);
Route::patch('/empresas/accidentes/{id}/estado', [AccidenteController::class, 'updateStatus']);
Route::get('/empresas/{id}/sucursales', [AccidenteController::class, 'sucursales']);
Route::post('/empresas/accidentes/sync', [AccidenteController::class, 'sync']);

// Investigaciones
Route::get('/empresas/{id}/investigaciones', [InvestigacionController::class, 'index']);
Route::get('/investigaciones/{id}', [InvestigacionController::class, 'show']);
Route::post('/investigaciones', [InvestigacionController::class, 'store']);
Route::put('/investigaciones/{id}', [InvestigacionController::class, 'update']);
Route::post('/investigaciones/{id}/acciones', [InvestigacionController::class, 'agregarAccion']);
Route::patch('/investigaciones/{id}/acciones/{accionId}', [InvestigacionController::class, 'updateAccion']);
Route::delete('/investigaciones/{id}/acciones/{accionId}', [InvestigacionController::class, 'eliminarAccion']);
Route::post('/investigaciones/{id}/cerrar', [InvestigacionController::class, 'cerrar']);
Route::get('/empresas/{id}/investigaciones/alertas', [InvestigacionController::class, 'alertas']);

// Plan Anual
Route::get('/empresas/{id}/plan-anual', [PlanAnualController::class, 'index']);
Route::post('/plan-anual', [PlanAnualController::class, 'store']);
Route::put('/plan-anual/{id}', [PlanAnualController::class, 'update']);
Route::delete('/plan-anual/{id}', [PlanAnualController::class, 'destroy']);
Route::post('/plan-anual/generar', [PlanAnualController::class, 'generateFromDiagnosis']);
Route::post('/plan-anual/upload', [PlanAnualController::class, 'uploadEvidence']);
Route::get('/empresas/{id}/plan-anual/resumen', [PlanAnualController::class, 'resumen']);

// Capacitaciones
use App\Http\Controllers\CapacitacionController;

Route::get('/empresas/{id}/capacitaciones', [CapacitacionController::class, 'index']);
Route::post('/capacitaciones', [CapacitacionController::class, 'store']);
Route::post('/capacitaciones/sync', [CapacitacionController::class, 'sync']);
Route::put('/capacitaciones/{id}', [CapacitacionController::class, 'update']);
Route::post('/capacitaciones/{id}/upload-evidencia', [CapacitacionController::class, 'uploadEvidencia']);
Route::delete('/capacitaciones/{id}', [CapacitacionController::class, 'destroy']);

// Auditorías
Route::get('/empresas/{id}/auditorias', [AuditoriaController::class, 'index']);
Route::post('/empresas/auditorias', [AuditoriaController::class, 'store']);
Route::put('/empresas/auditorias/{id}', [AuditoriaController::class, 'update']);
Route::delete('/empresas/auditorias/{id}', [AuditoriaController::class, 'destroy']);
Route::post('/empresas/auditorias/{id}/cerrar', [AuditoriaController::class, 'cerrar']);
Route::post('/empresas/auditorias/{id}/hallazgos', [AuditoriaController::class, 'storeHallazgo']);
Route::put('/empresas/hallazgos/{id}', [AuditoriaController::class, 'updateHallazgo']);
Route::delete('/empresas/hallazgos/{id}', [AuditoriaController::class, 'destroyHallazgo']);
Route::post('/empresas/hallazgos/{hallazgo_id}/tareas', [AuditoriaController::class, 'storeTarea']);
Route::put('/empresas/tareas/{id}', [AuditoriaController::class, 'updateTarea']);
Route::delete('/empresas/tareas/{id}', [AuditoriaController::class, 'destroyTarea']);

// Evaluación Inicial (Diagnóstico Anual)
Route::get('/empresas/{id}/evaluaciones',           [EvaluacionController::class, 'index']);
Route::post('/evaluaciones/calificar',              [EvaluacionController::class, 'calificar']);
Route::post('/evaluaciones/bulk',                   [EvaluacionController::class, 'bulkCalificar']);
Route::post('/evaluaciones/anio',                   [EvaluacionController::class, 'gestionarAnio']);
