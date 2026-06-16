<?php
// api/auth/profile.php - Obtener perfil de usuario
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../config/database.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No has iniciado sesión."]);
    exit();
}

try {
    $stmt = $pdo->prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode(["success" => true, "data" => $user], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Usuario no encontrado."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error del servidor."]);
}
?>
