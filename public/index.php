<?php
// public/index.php - Front Controller

// Habilitar errores para desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Cargar archivo de configuración de base de datos
require_once __DIR__ . '/../src/config/database.php';

// Obtener la ruta de la petición
$request = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($request);
$path = $parsedUrl['path'] ?? '/';

// === SISTEMA DE ENRUTAMIENTO (ROUTER) ===

// 1. Ruta para obtener todos los productos (API Pública)
if ($path === '/api/products.php') {
    require_once __DIR__ . '/../src/controllers/ProductController.php';
    $controller = new \App\Controllers\ProductController($pdo);
    $controller->index();
    exit;
}

// 2. Ruta para otras APIs que aún no migramos a MVC
// Por ahora las redirigimos a donde estaban
if (strpos($path, '/api/') === 0) {
    $apiFile = __DIR__ . '/../src' . $path;
    if (file_exists($apiFile)) {
        require_once $apiFile;
        exit;
    }
}

// 3. Servir el Frontend (Single Page Application o Archivos Estáticos)
if ($path === '/' || $path === '/index.php') {
    // Si entran a la raíz, cargar el index.html del frontend
    require __DIR__ . '/index.html';
    exit;
}

// 4. Si la ruta no coincide con nada, devolver 404
http_response_code(404);
echo "404 Not Found";
