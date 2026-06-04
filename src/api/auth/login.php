<?php
// api/auth/login.php - Archivo encargado de verificar credenciales e iniciar sesión

// Configuraciones de cabeceras de red
header('Content-Type: application/json; charset=utf-8'); // Indicar que devolvemos JSON
header('Access-Control-Allow-Origin: *');                // Permitir peticiones desde cualquier origen
header('Access-Control-Allow-Methods: POST');            // Solo aceptar método POST (más seguro)
header('Access-Control-Allow-Headers: Content-Type');    // Permitir cabeceras de tipo de contenido

// Si es una petición OPTIONS (verificación previa del navegador CORS), responder OK y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Cargar el archivo de conexión a la base de datos
require __DIR__ . '/../db.php';

// Obtener los datos JSON enviados desde el formulario HTML usando JavaScript (fetch)
$data = json_decode(file_get_contents("php://input"));

// Verificar que realmente enviaron el correo y la contraseña
if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400); // 400 = Petición incorrecta (Bad Request)
    echo json_encode(["success" => false, "message" => "Email y contraseña son requeridos."]);
    exit();
}

// Quitar espacios vacíos al inicio y al final de los textos
$email = trim($data->email);
$password = trim($data->password);

try {
    // Buscar en la base de datos al usuario que tenga este correo exacto
    $stmt = $pdo->prepare("SELECT id, name, email, password_hash, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Validar si el usuario existe y si la contraseña ingresada coincide con la contraseña encriptada (Hash)
    if ($user && password_verify($password, $user['password_hash'])) {
        // Contraseña correcta: Iniciar la sesión de PHP (para recordar al usuario en el servidor si es necesario)
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];

        // Enviar respuesta exitosa al Frontend con los datos del usuario (pero NUNCA enviar la contraseña)
        echo json_encode([
            "success" => true,
            "message" => "Inicio de sesión exitoso.",
            "user" => [
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $user['email'],
                "role" => $user['role']
            ]
        ]);
    } else {
        // Si el correo no existe o la contraseña no hace match matemático
        http_response_code(401); // 401 = No autorizado
        echo json_encode(["success" => false, "message" => "Credenciales incorrectas."]);
    }
} catch (Exception $e) {
    // Manejo de errores de base de datos
    http_response_code(500); // 500 = Error interno del servidor
    echo json_encode(["success" => false, "message" => "Error del servidor: " . $e->getMessage()]);
}
?>
