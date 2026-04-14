<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlertasSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('alertas')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $alertas = [
            // --- ÁREA: SST ---
            [
                'titulo' => 'Sistemas de Gestión de Seguridad y Salud en el Trabajo',
                'norma' => 'Decreto 1072 de 2015',
                'area' => 'SST',
                'fecha_publicacion' => '2015-05-26',
                'impacto' => 'Crítico',
                'descripcion' => 'Decreto Único Reglamentario del Sector Trabajo (Capítulo 6 - SG-SST).',
                'accion_requerida' => 'Diseño e implementación del SG-SST.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=76271',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Estándares Mínimos del SG-SST',
                'norma' => 'Resolución 0312 de 2019',
                'area' => 'SST',
                'fecha_publicacion' => '2019-02-13',
                'impacto' => 'Crítico',
                'descripcion' => 'Define los estándares mínimos según tamaño y riesgo de la empresa.',
                'accion_requerida' => 'Autoevaluación anual y reporte a la ARL.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=90478',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Investigación de Accidentes de Trabajo',
                'norma' => 'Resolución 1401 de 2007',
                'area' => 'SST',
                'fecha_publicacion' => '2007-05-14',
                'impacto' => 'Alto',
                'descripcion' => 'Obligación de investigar incidentes y accidentes de trabajo.',
                'accion_requerida' => 'Conformar equipo investigador y realizar informes.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=22868',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Trabajo en Alturas',
                'norma' => 'Resolución 4272 de 2021',
                'area' => 'SST',
                'fecha_publicacion' => '2021-12-09',
                'impacto' => 'Crítico',
                'descripcion' => 'Requisitos de seguridad para trabajos en alturas.',
                'accion_requerida' => 'Capacitación y equipos de protección certificados.',
                'codigos_ciiu_aplicables' => json_encode(['F4111', 'F4112', 'F4210', 'F4220', 'TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=106126',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Sistema General de Riesgos Laborales',
                'norma' => 'Ley 1562 de 2012',
                'area' => 'SST',
                'fecha_publicacion' => '2012-07-11',
                'impacto' => 'Crítico',
                'descripcion' => 'Modifica el Sistema de Riesgos Laborales y dicta otras disposiciones en salud ocupacional.',
                'accion_requerida' => 'Afiliación y reporte de novedades al sistema.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'http://www.secretariasenado.gov.co/senado/basedoc/ley_1562_2012.html',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Reglamento Técnico de Trabajo Seguro en Alturas',
                'norma' => 'Resolución 1409 de 2012',
                'area' => 'SST',
                'fecha_publicacion' => '2012-07-23',
                'impacto' => 'Alto',
                'descripcion' => 'Establece el reglamento de seguridad para protección contra caídas en alturas.',
                'accion_requerida' => 'Implementar programa de prevención de caídas.',
                'codigos_ciiu_aplicables' => json_encode(['F4111', 'F4112', 'F4210', 'TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=48801',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Riesgo Psicosocial en el Trabajo',
                'norma' => 'Resolución 2646 de 2008',
                'area' => 'SST',
                'fecha_publicacion' => '2008-07-17',
                'impacto' => 'Alto',
                'descripcion' => 'Factores de riesgo psicosocial en el trabajo y determinantes de salud mental.',
                'accion_requerida' => 'Identificación, evaluación e intervención de factores de riesgo.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=31607',
                'estado' => 'vigente'
            ],

            // --- ÁREA: AMBIENTAL ---
            [
                'titulo' => 'Decreto Único Reglamentario Sector Ambiental',
                'norma' => 'Decreto 1076 de 2015',
                'area' => 'Ambiental',
                'fecha_publicacion' => '2015-05-26',
                'impacto' => 'Alto',
                'descripcion' => 'Compila las normas del sector ambiente en Colombia.',
                'accion_requerida' => 'Cumplimiento de guías sectoriales ambientales.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=78153',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Ley de Plásticos de un Solo Uso',
                'norma' => 'Ley 2232 de 2022',
                'area' => 'Ambiental',
                'fecha_publicacion' => '2022-07-07',
                'impacto' => 'Medio',
                'descripcion' => 'Prohibición gradual de plásticos de un solo uso.',
                'accion_requerida' => 'Sustitución de materiales plásticos desechables.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'http://www.secretariasenado.gov.co/senado/basedoc/ley_2232_2022.html',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Vertimientos de Aguas Residuales',
                'norma' => 'Resolución 0631 de 2015',
                'area' => 'Ambiental',
                'fecha_publicacion' => '2015-04-17',
                'impacto' => 'Alto',
                'descripcion' => 'Parámetros y valores límites máximos permitidos en vertimientos puntuales.',
                'accion_requerida' => 'Monitoreo de vertimientos y permisos ambientales.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=76131',
                'estado' => 'vigente'
            ],

            // --- ÁREA: TRIBUTARIA ---
            [
                'titulo' => 'Estatuto Tributario Nacional',
                'norma' => 'Decreto 624 de 1989',
                'area' => 'Tributaria',
                'fecha_publicacion' => '1989-03-30',
                'impacto' => 'Crítico',
                'descripcion' => 'Regula las obligaciones tributarias en Colombia.',
                'accion_requerida' => 'Declaración y pago oportuno de impuestos.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'http://www.secretariasenado.gov.co/senado/basedoc/estatuto_tributario.html',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Facturación Electrónica',
                'norma' => 'Resolución 000042 de 2020',
                'area' => 'Tributaria',
                'fecha_publicacion' => '2020-05-05',
                'impacto' => 'Alto',
                'descripcion' => 'Obligatoriedad de factura electrónica para contribuyentes.',
                'accion_requerida' => 'Habilitación de software de facturación electrónica.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=97712',
                'estado' => 'vigente'
            ],

            // --- ÁREA: PRIVACIDAD ---
            [
                'titulo' => 'Protección de Datos Personales',
                'norma' => 'Ley 1581 de 2012',
                'area' => 'Privacidad',
                'fecha_publicacion' => '2012-10-17',
                'impacto' => 'Alto',
                'descripcion' => 'Régimen de Habeas Data — Protección de datos personales.',
                'accion_requerida' => 'Implementar política de tratamiento de datos personales.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html',
                'estado' => 'vigente'
            ],

            // --- ÁREA: LABORAL ---
            [
                'titulo' => 'Código Sustantivo del Trabajo',
                'norma' => 'CST',
                'area' => 'Laboral',
                'fecha_publicacion' => '1950-06-07',
                'impacto' => 'Crítico',
                'descripcion' => 'Regula las relaciones laborales entre empleadores y trabajadores.',
                'accion_requerida' => 'Garantizar salarios mínimos, prestaciones y derechos laborales.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'http://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Reducción de la Jornada Laboral',
                'norma' => 'Ley 2101 de 2021',
                'area' => 'Laboral',
                'fecha_publicacion' => '2021-07-15',
                'impacto' => 'Alto',
                'descripcion' => 'Reducción gradual de la jornada laboral máxima en Colombia.',
                'accion_requerida' => 'Ajuste de contratos y horarios según la reducción progresiva.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'http://www.secretariasenado.gov.co/senado/basedoc/ley_2101_2021.html',
                'estado' => 'vigente'
            ],
            [
                'titulo' => 'Derecho a la Desconexión Laboral',
                'norma' => 'Ley 2191 de 2022',
                'area' => 'Laboral',
                'fecha_publicacion' => '2022-01-06',
                'impacto' => 'Medio',
                'descripcion' => 'Derecho a no ser contactado fuera de la jornada laboral.',
                'accion_requerida' => 'Implementar política interna de desconexión digital.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'http://www.secretariasenado.gov.co/senado/basedoc/ley_2191_2022.html',
                'estado' => 'vigente'
            ],

            // --- ÁREA: CALIDAD ---
            [
                'titulo' => 'Sistema de Gestión de Calidad (Sector Público)',
                'norma' => 'Decreto 1499 de 2017',
                'area' => 'Calidad',
                'fecha_publicacion' => '2017-09-11',
                'impacto' => 'Medio',
                'descripcion' => 'Actualiza el Sistema de Gestión en las entidades públicas.',
                'accion_requerida' => 'Implementar modelo integrado de calidad MECI-NTCGP.',
                'codigos_ciiu_aplicables' => json_encode(['TODOS']),
                'url_oficial' => 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=83433',
                'estado' => 'vigente'
            ]
        ];

        DB::table('alertas')->insert($alertas);
    }
}
