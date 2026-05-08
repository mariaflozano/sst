-- Diccionario de datos SG-SST - Script de creación MySQL

CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    trabajadores INT,
    nivel_riesgo VARCHAR(50),
    codigo_ciiu VARCHAR(10),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    telefono VARCHAR(30),
    email VARCHAR(100),
    sitio_web VARCHAR(100),
    arl_nombre VARCHAR(100),
    arl_nit VARCHAR(30),
    arl_telefono VARCHAR(30),
    arl_direccion VARCHAR(255),
    rep_legal_nombre VARCHAR(100),
    rep_legal_cedula VARCHAR(30),
    rep_legal_cargo VARCHAR(100),
    logo_url VARCHAR(255),
    rep_legal_firma_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sucursales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(100),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    telefono VARCHAR(30),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE trabajadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    documento VARCHAR(30),
    cargo VARCHAR(100),
    fecha_ingreso DATE,
    estado VARCHAR(20),
    tipo_sangre VARCHAR(5),
    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_telefono VARCHAR(30),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE ausentismos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trabajador_id INT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    dias_incapacidad INT,
    causa VARCHAR(50),
    diagnostico VARCHAR(100),
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id)
);

CREATE TABLE accidentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    trabajador_id INT,
    sucursal_id INT,
    fecha_evento DATE,
    hora_evento TIME,
    lugar_exacto VARCHAR(255),
    tipo_accidente VARCHAR(50),
    tipo_evento VARCHAR(30),
    descripcion TEXT,
    tipo_lesion VARCHAR(100),
    parte_cuerpo VARCHAR(100),
    clasificacion VARCHAR(50),
    dias_incapacidad INT,
    jefe_inmediato VARCHAR(100),
    reportado_arl BOOLEAN,
    fecha_reporte_arl DATE,
    numero_radicado_arl VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
);

CREATE TABLE investigaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accidente_id INT NOT NULL,
    descripcion TEXT,
    conclusiones TEXT,
    recomendaciones TEXT,
    fecha_investigacion DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accidente_id) REFERENCES accidentes(id)
);

CREATE TABLE capacitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    tema VARCHAR(255),
    fecha DATE,
    hora TIME,
    responsable VARCHAR(100),
    modalidad VARCHAR(50),
    evidencia_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE asistencias_capacitacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capacitacion_id INT NOT NULL,
    trabajador_id INT NOT NULL,
    asistencia BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones(id),
    FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id)
);

CREATE TABLE auditorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    tipo VARCHAR(30),
    objeto VARCHAR(255),
    auditor_lider VARCHAR(100),
    fecha_programada DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE hallazgos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auditoria_id INT NOT NULL,
    tipo_hallazgo VARCHAR(50),
    descripcion TEXT,
    requisito_incumplido VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auditoria_id) REFERENCES auditorias(id)
);

CREATE TABLE planes_accion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hallazgo_id INT NOT NULL,
    plan_accion TEXT,
    responsable VARCHAR(100),
    fecha_compromiso DATE,
    estado VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hallazgo_id) REFERENCES hallazgos(id)
);

CREATE TABLE matriz_legal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    norma VARCHAR(255),
    titulo VARCHAR(255),
    observaciones TEXT,
    area VARCHAR(100),
    cumplimiento VARCHAR(50),
    evidencia_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    tipo VARCHAR(50),
    titulo VARCHAR(255),
    descripcion TEXT,
    fecha DATE,
    leida BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE formatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    titulo VARCHAR(255),
    categoria VARCHAR(50),
    tipo VARCHAR(10),
    descripcion TEXT,
    url_archivo VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
