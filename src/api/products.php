<?php
// products.php - Archivo encargado de extraer todas las tortas y enviarlas al frontend

// Configurar las cabeceras para que el navegador entienda que es un archivo JSON con soporte UTF-8
header('Content-Type: application/json; charset=utf-8');
// Permitir que cualquier origen (frontend) pueda leer estos datos (CORS)
header('Access-Control-Allow-Origin: *');

// Importar la conexión a la base de datos
require 'db.php';

try {
    // Preparar y ejecutar la consulta para traer todos los productos de la tabla principal
    $stmt = $pdo->query('SELECT * FROM products');
    // Guardar todos los resultados en un arreglo de PHP
    $products = $stmt->fetchAll();

    // Arreglo donde guardaremos los productos ya formateados
    $final_products = [];

    // Recorrer cada producto uno por uno
    foreach ($products as $p) {
        $product_id = $p['id'];
        
        // Formatear los valores al tipo correcto para que JavaScript no tenga problemas
        $p['id'] = (int)$p['id'];                  // Convertir ID a número entero
        $p['price'] = (float)$p['price'];          // Convertir precio a decimal
        $p['rating'] = $p['rating'] !== null ? (float)$p['rating'] : null;
        $p['reviewsCount'] = $p['reviewsCount'] !== null ? (int)$p['reviewsCount'] : null;

        // Limpiar datos nulos de la respuesta para ahorrar memoria
        if ($p['sizeLabel'] === null) unset($p['sizeLabel']);
        if ($p['baseLabel'] === null) unset($p['baseLabel']);
        if ($p['flavorLabel'] === null) unset($p['flavorLabel']);

        // Extraer los Tamaños disponibles (Sizes) desde la tabla product_sizes
        $stmtSizes = $pdo->prepare('SELECT name, priceOffset FROM product_sizes WHERE product_id = ?');
        $stmtSizes->execute([$product_id]);
        $sizes = $stmtSizes->fetchAll();
        // Si tiene tamaños, agregarlos al producto
        if (count($sizes) > 0) {
            foreach ($sizes as &$s) {
                // Formatear el costo adicional del tamaño a decimal
                $s['priceOffset'] = (float)$s['priceOffset'];
            }
            $p['sizes'] = $sizes;
        }

        // Extraer los Sabores disponibles (Flavors)
        $stmtFlavors = $pdo->prepare('SELECT name FROM product_flavors WHERE product_id = ?');
        $stmtFlavors->execute([$product_id]);
        $flavors = $stmtFlavors->fetchAll();
        // Si tiene sabores, guardarlos como una simple lista de nombres
        if (count($flavors) > 0) {
            $p['flavors'] = array_column($flavors, 'name');
        }

        // Extraer las Bases (ej. Bizcocho vainilla, chocolate)
        $stmtBases = $pdo->prepare('SELECT name FROM product_bases WHERE product_id = ?');
        $stmtBases->execute([$product_id]);
        $bases = $stmtBases->fetchAll();
        // Si tiene bases, guardarlas como una lista
        if (count($bases) > 0) {
            $p['bases'] = array_column($bases, 'name');
        }

        // Agregar el producto ya limpio al arreglo final
        $final_products[] = $p;
    }

    // Convertir todo el arreglo a formato JSON y enviarlo a la pantalla (frontend)
    // Usamos JSON_UNESCAPED_UNICODE para que las ñ y tildes se vean como letras reales y no como códigos (\u00f1)
    echo json_encode($final_products, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    // Si algo sale mal, cambiar el estado HTTP a 500 (Error de Servidor)
    http_response_code(500);
    // Enviar el mensaje de error en formato JSON
    echo json_encode(["error" => "Error al obtener los productos: " . $e->getMessage()]);
}
?>
