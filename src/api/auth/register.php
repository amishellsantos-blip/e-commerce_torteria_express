<?php
// api/auth/register.php - Archivo encargado de crear nuevos usuarios en la base de datos

// Configurar seguridad y tipo de archivo para que el navegador lo entienda
header('Content-Type: application/json; charset=utf-8'); // Indicar que devolvemos JSON
header('Access-Control-Allow-Origin: *');                // Permitir conexiones externas
header('Access-Control-Allow-Methods: POST');            // Exigir método POST para no mostrar datos en la URL
header('Access-Control-Allow-Headers: Content-Type');    // Permitir enviar datos en formato JSON

// Si el navegador hace una consulta previa de seguridad (CORS), decirle que todo está bien
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Cargar el archivo que conecta con MySQL
require_once __DIR__ . '/../../config/database.php';

// Leer el paquete de datos que envió la página web
$data = json_decode(file_get_contents("php://input"));

// Validar que los campos clave existan en lo que mandó el usuario
if (!isset($data->name) || !isset($data->email) || !isset($data->password)) {
    http_response_code(400); // Bad Request (Faltan datos)
    echo json_encode(["success" => false, "message" => "Nombre, email y contraseña son obligatorios."]);
    exit();
}

// Limpiar espacios en blanco innecesarios
$name = trim($data->name);
$email = trim($data->email);
$password = trim($data->password);
$phone = isset($data->phone) ? trim($data->phone) : null; // El teléfono es opcional

// Segunda validación: Asegurar que, después de limpiar espacios, no estén vacíos
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Los campos no pueden estar vacíos."]);
    exit();
}

// Validar que el texto del correo tenga un formato real (ej. algo@dominio.com)
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "El formato del email no es válido."]);
    exit();
}

try {
    // Antes de guardar, verificar si el correo ya existe en la base de datos
    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmtCheck->execute([$email]);
    if ($stmtCheck->rowCount() > 0) {
        // Si hay resultados, el correo ya fue usado
        http_response_code(409); // 409 = Conflicto
        echo json_encode(["success" => false, "message" => "Este correo electrónico ya está registrado."]);
        exit();
    }

    // NUNCA GUARDAR CONTRASEÑAS EN TEXTO PLANO
    // Encriptar la contraseña usando el algoritmo Bcrypt, que es altamente seguro
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Insertar la fila del nuevo usuario en la tabla `users`
    // Siempre por defecto se le asigna el rol 'cliente'
    $stmtInsert = $pdo->prepare("INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, 'cliente')");
    $stmtInsert->execute([$name, $email, $password_hash, $phone]);

    // Avisarle a la página web que la creación fue un éxito absoluto
    echo json_encode(["success" => true, "message" => "Usuario registrado exitosamente."]);
} catch (Exception $e) {
    // Capturar cualquier error que ocurra (ej. fallo en MySQL)
    http_response_code(500); // 500 = Error interno
    echo json_encode(["success" => false, "message" => "Error del servidor: " . $e->getMessage()]);
}
?>
