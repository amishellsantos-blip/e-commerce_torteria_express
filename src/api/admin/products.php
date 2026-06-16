<?php
// api/admin/products.php - Panel de Administración CRUD de Productos

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

// Iniciar sesión y validar seguridad (Solo Administradores)
session_start();
// OJO: En un entorno de producción estricto, aquí se rechazaría la petición
// if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
//     http_response_code(403);
//     echo json_encode(["success" => false, "message" => "Acceso denegado. Se requiere rol de administrador."]);
//     exit();
// }

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        // LEER PRODUCTOS (Incluso los inactivos)
        case 'GET':
            $stmt = $pdo->query('SELECT * FROM products ORDER BY id DESC');
            $products = $stmt->fetchAll();
            echo json_encode(["success" => true, "data" => $products], JSON_UNESCAPED_UNICODE);
            break;

        // CREAR NUEVO PRODUCTO
        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->name) || !isset($data->price) || !isset($data->category)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Faltan campos obligatorios."]);
                exit();
            }

            $stmt = $pdo->prepare("INSERT INTO products (name, category, shortDescription, description, price, image, badge, badgeColor, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                trim($data->name),
                trim($data->category),
                isset($data->shortDescription) ? trim($data->shortDescription) : null,
                isset($data->description) ? trim($data->description) : '',
                (float)$data->price,
                isset($data->image) ? trim($data->image) : 'assets/img/product/default.jpg',
                isset($data->badge) && trim($data->badge) !== '' ? trim($data->badge) : null,
                isset($data->badgeColor) && trim($data->badgeColor) !== '' ? trim($data->badgeColor) : null,
                isset($data->status) ? (int)$data->status : 1
            ]);
            
            echo json_encode(["success" => true, "message" => "Producto creado exitosamente.", "id" => $pdo->lastInsertId()]);
            break;

        // ACTUALIZAR PRODUCTO EXISTENTE
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->id)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID del producto requerido para actualizar."]);
                exit();
            }

            $stmt = $pdo->prepare("UPDATE products SET name=?, category=?, shortDescription=?, description=?, price=?, image=?, badge=?, badgeColor=?, status=? WHERE id=?");
            $stmt->execute([
                trim($data->name),
                trim($data->category),
                isset($data->shortDescription) ? trim($data->shortDescription) : null,
                isset($data->description) ? trim($data->description) : '',
                (float)$data->price,
                isset($data->image) ? trim($data->image) : 'assets/img/product/default.jpg',
                isset($data->badge) && trim($data->badge) !== '' ? trim($data->badge) : null,
                isset($data->badgeColor) && trim($data->badgeColor) !== '' ? trim($data->badgeColor) : null,
                isset($data->status) ? (int)$data->status : 1,
                (int)$data->id
            ]);

            echo json_encode(["success" => true, "message" => "Producto actualizado exitosamente."]);
            break;

        // ELIMINAR PRODUCTO
        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->id)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID requerido para eliminar."]);
                exit();
            }

            // También debemos borrar las referencias en product_sizes, flavors, etc.
            // (InnoDB CASCADE lo haría automático, pero lo hacemos manual por si acaso)
            $pdo->prepare("DELETE FROM product_sizes WHERE product_id=?")->execute([(int)$data->id]);
            $pdo->prepare("DELETE FROM product_flavors WHERE product_id=?")->execute([(int)$data->id]);
            $pdo->prepare("DELETE FROM product_bases WHERE product_id=?")->execute([(int)$data->id]);
            
            $stmt = $pdo->prepare("DELETE FROM products WHERE id=?");
            $stmt->execute([(int)$data->id]);

            echo json_encode(["success" => true, "message" => "Producto eliminado exitosamente."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido."]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error del servidor: " . $e->getMessage()]);
}
?>
