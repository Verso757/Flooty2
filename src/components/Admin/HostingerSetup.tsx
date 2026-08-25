import React, { useState } from 'react';
import { Database, Server, FolderUp, Download, Copy, Check, Link2, ShieldAlert, FileCode } from 'lucide-react';

export const HostingerSetup: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPhp, setCopiedPhp] = useState(false);
  const [hostingerUrl, setHostingerUrl] = useState<string>(
    localStorage.getItem('flotacheck_hostinger_url') || 'https://tudominio.com/api/index.php'
  );
  const [isSaved, setIsSaved] = useState(false);

  const sqlSchema = `-- ===================================================
-- ESTRUCTURA DE BASE DE DATOS MYSQL PARA HOSTINGER
-- Nombre de Base de Datos: flotacheck_db
-- Sistema de Asignación de Camiones a Rutas
-- ===================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rol ENUM('operador', 'mecanico', 'administrador') NOT NULL,
  email VARCHAR(100),
  pin_admin VARCHAR(10) DEFAULT '1234'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA DE CAMIONES / UNIDADES CON NÚMERO ECONÓMICO ÚNICO
CREATE TABLE IF NOT EXISTS vehiculos (
  id VARCHAR(50) PRIMARY KEY,
  numero_economico VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  placa VARCHAR(20) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  kilometraje INT DEFAULT 0,
  estatus ENUM('activa', 'bloqueada', 'mantenimiento') DEFAULT 'activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TABLA DE RUTAS OPERATIVAS CON CAMIÓN ASIGNADO
CREATE TABLE IF NOT EXISTS rutas (
  id VARCHAR(50) PRIMARY KEY,
  codigo_ruta VARCHAR(20) UNIQUE NOT NULL,
  nombre_ruta VARCHAR(100) NOT NULL,
  zona VARCHAR(100),
  vehiculo_asignado_id VARCHAR(50),
  estatus ENUM('activa', 'sin_unidad', 'suspendida') DEFAULT 'activa',
  notas TEXT,
  FOREIGN KEY (vehiculo_asignado_id) REFERENCES vehiculos(id) ON SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- HISTORIAL DE CAMBIOS DE CAMIÓN EN RUTAS
CREATE TABLE IF NOT EXISTS historial_asignaciones_rutas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ruta_id VARCHAR(50) NOT NULL,
  vehiculo_anterior_id VARCHAR(50),
  vehiculo_nuevo_id VARCHAR(50) NOT NULL,
  motivo_cambio TEXT NOT NULL,
  autorizado_por VARCHAR(100) NOT NULL,
  fecha DATETIME NOT NULL,
  FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INSPECCIONES PRE-OPERACIONALES DE RUTA
CREATE TABLE IF NOT EXISTS inspecciones (
  id VARCHAR(50) PRIMARY KEY,
  ruta_id VARCHAR(50),
  codigo_ruta VARCHAR(20),
  vehiculo_id VARCHAR(50) NOT NULL,
  numero_economico VARCHAR(20),
  operador_id VARCHAR(50) NOT NULL,
  nombre_operador VARCHAR(100) NOT NULL,
  fecha_hora DATETIME NOT NULL,
  tiene_fallas TINYINT(1) DEFAULT 0,
  sincronizado_servidor TINYINT(1) DEFAULT 1,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TICKETS DE TALLER / REPARACIONES
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(50) PRIMARY KEY,
  folio VARCHAR(20) UNIQUE NOT NULL,
  vehiculo_id VARCHAR(50) NOT NULL,
  numero_economico VARCHAR(20),
  codigo_ruta VARCHAR(20),
  nombre_unidad VARCHAR(100) NOT NULL,
  pregunta_falla VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  severidad ENUM('baja', 'media', 'critica') NOT NULL,
  estatus ENUM('pendiente', 'en_progreso', 'resuelto', 'cancelado') DEFAULT 'pendiente',
  mecanico_asignado VARCHAR(100) DEFAULT 'Sin asignar',
  foto_url TEXT,
  comentarios_resolucion TEXT,
  fecha_creacion DATETIME NOT NULL,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DATOS INICIALES: UNIDADES / CAMIONES CON NÚMERO ÚNICO
INSERT INTO vehiculos (id, numero_economico, nombre, tipo, placa, modelo, kilometraje, estatus) VALUES
('v-507', '507', 'Camión 507', 'Camión Pesado Carga', 'MX-507-A', 'Freightliner M2 106 2022', 148500, 'activa'),
('v-101', '101', 'Camión 101', 'Camión Mediano', 'MX-101-B', 'International Durastar 2021', 98400, 'activa'),
('v-304', '304', 'Camión 304', 'Camión Pesado', 'MX-304-C', 'Kenworth T370 2023', 62100, 'activa'),
('v-12',  '12',  'Camión 12',  'Camión Pesado', 'MX-012-D', 'Freightliner M2 2020', 182300, 'bloqueada'),
('v-07',  '07',  'Camión 07 (Respaldo)', 'Camión Mediano', 'MX-007-E', 'Isuzu Forward 800 2022', 45200, 'activa'),
('v-89',  '89',  'Camión 89 (Respaldo)', 'Camión Mediano', 'MX-089-F', 'Hino Serie 500 2021', 78900, 'activa')
ON DUPLICATE KEY UPDATE id=id;

-- DATOS INICIALES: RUTAS ASIGNADAS A CAMIONES (EJ. RUTA 125 CON CAMIÓN 507)
INSERT INTO rutas (id, codigo_ruta, nombre_ruta, zona, vehiculo_asignado_id, estatus) VALUES
('r-125', '125', 'Ruta 125', 'Sector Industrial - Norte', 'v-507', 'activa'),
('r-101', '101', 'Ruta 101', 'Centro - Corredor Poniente', 'v-101', 'activa'),
('r-402', '402', 'Ruta 402', 'Zona Metropolitana Sur', 'v-304', 'activa'),
('r-88',  '88',  'Ruta 88',  'Periférico / Aeropuerto', 'v-12', 'activa'),
('r-210', '210', 'Ruta 210', 'Circuito Comercial Oriente', NULL, 'sin_unidad')
ON DUPLICATE KEY UPDATE id=id;
`;

  const phpBackendCode = `<?php
/**
 * FlotaCheck PHP API - Conexión MySQL y Carga de Fotografías
 * Subir este archivo a tu servidor Hostinger en: public_html/api/index.php
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de MySQL Hostinger
$db_host = 'localhost';
$db_user = 'tu_usuario_mysql'; // Cambiar por tu usuario Hostinger
$db_pass = 'tu_password_mysql'; // Cambiar por tu contraseña Hostinger
$db_name = 'flotacheck_db';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión MySQL: ' . $e->getMessage()]);
    exit();
}

// Subida de Fotografías
$uploadDir = __DIR__ . '/../uploads/fotos_inspeccion/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$action = $_GET['action'] ?? 'ping';

if ($action === 'ping') {
    echo json_encode(['success' => true, 'message' => 'API FlotaCheck Hostinger lista y conectada']);
    exit();
}

if ($action === 'upload_photo') {
    if (!isset($_FILES['photo'])) {
        echo json_encode(['success' => false, 'error' => 'No se recibió ninguna fotografía']);
        exit();
    }

    $file = $_FILES['photo'];
    $filename = 'foto_' . time() . '_' . rand(1000, 9999) . '.jpg';
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
        $fullUrl = $protocol . "://" . $_SERVER['HTTP_HOST'] . "/uploads/fotos_inspeccion/" . $filename;
        echo json_encode(['success' => true, 'photo_url' => $fullUrl]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar la fotografía en el servidor']);
    }
    exit();
}

echo json_encode(['success' => false, 'error' => 'Acción no válida']);
`;

  const handleCopy = (text: string, type: 'sql' | 'php') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedPhp(true);
      setTimeout(() => setCopiedPhp(false), 2000);
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('flotacheck_hostinger_url', hostingerUrl.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900">Conexión con Hostinger MySQL</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Guía y scripts para sincronizar Rutas, Camiones y Chequeos pre-operacionales directamente con tu base de datos MySQL en Hostinger.
        </p>
      </div>

      {/* Step 1: Config Backend URL */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 font-mono">
            1
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dirección de la API en Hostinger</h3>
            <p className="text-xs text-slate-500">Ingresa la URL pública de tu script `index.php` en Hostinger</p>
          </div>
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              required
              placeholder="https://tudominio.com/api/index.php"
              value={hostingerUrl}
              onChange={(e) => setHostingerUrl(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Link2 className="w-4 h-4" />
              <span>{isSaved ? '¡Guardado!' : 'Guardar URL'}</span>
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
            <FolderUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Las fotografías tomadas en inspecciones se guardarán en la carpeta{' '}
              <strong className="text-slate-900 font-mono">public_html/uploads/fotos_inspeccion/</strong> en tu hosting.
            </span>
          </div>
        </form>
      </div>

      {/* Step 2: SQL Script */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 font-mono">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Estructura SQL (phpMyAdmin en Hostinger)</h3>
              <p className="text-xs text-slate-500">Incluye tablas de `rutas`, `vehiculos` con número económico e historial de cambios</p>
            </div>
          </div>

          <button
            onClick={() => handleCopy(sqlSchema, 'sql')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-800">
          <pre>{sqlSchema}</pre>
        </div>
      </div>

      {/* Step 3: PHP Script */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 font-mono">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Script Backend PHP (`public_html/api/index.php`)</h3>
              <p className="text-xs text-slate-500">
                Sube este archivo PHP a la carpeta public_html/api de tu Hostinger y edita tus credenciales de MySQL.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleCopy(phpBackendCode, 'php')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            {copiedPhp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPhp ? '¡Copiado!' : 'Copiar PHP'}</span>
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-800">
          <pre>{phpBackendCode}</pre>
        </div>
      </div>
    </div>
  );
};
