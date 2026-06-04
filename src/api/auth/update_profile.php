<?php
// api/auth/update_profile.php - Actualizar perfil de usuario
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require dirname(__DIR__) . '/db.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No has iniciado sesión."]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['name']) || empty(trim($input['name']))) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "El nombre es obligatorio."]);
    exit();
}

$name = trim($input['name']);
$phone = isset($input['phone']) ? trim($input['phone']) : null;

try {
    $stmt = $pdo->prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?');
    $stmt->execute([$name, $phone, $_SESSION['user_id']]);

    // Actualizar también la sesión si el nombre cambia
    $_SESSION['user_name'] = $name;

    echo json_encode(["success" => true, "message" => "Perfil actualizado exitosamente.", "data" => ["name" => $name, "phone" => $phone]], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error del servidor al actualizar."]);
}
?>
