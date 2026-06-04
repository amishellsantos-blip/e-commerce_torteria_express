<?php
// users.php - Endpoint para obtener todos los usuarios y la cantidad de pedidos que han realizado

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require '../db.php';

// Iniciar sesión y limpiar buffer si es necesario
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    // Verificar si el usuario está logueado
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "No autorizado. Inicie sesión primero."]);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $user_role = $_SESSION['user_role'];

    // Verificar que sea administrador
    if ($user_role !== 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Acceso denegado. Se requieren permisos de administrador."]);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Consulta avanzada: Left join para traer a TODOS los usuarios (incluso si no tienen pedidos)
        // Agrupando por ID de usuario para poder usar COUNT()
        $stmt = $pdo->query('
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.phone, 
                u.role, 
                u.created_at,
                COUNT(o.id) as total_orders
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        ');
        
        $users = $stmt->fetchAll();

        // Convertir strings a enteros donde corresponda
        foreach ($users as &$user) {
            $user['id'] = (int)$user['id'];
            $user['total_orders'] = (int)$user['total_orders'];
        }

        echo json_encode(["success" => true, "data" => $users]);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método no permitido."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
