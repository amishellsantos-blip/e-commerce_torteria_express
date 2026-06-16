<?php
// db.php - Archivo encargado de establecer la conexión con la base de datos MySQL

// Credenciales de conexión al servidor de producción
$host = 'localhost';
$db   = 'torteria_express';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';         // Codificación para aceptar tildes, eñes y emojis sin errores

// Construcción de la cadena de conexión (Data Source Name)
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Opciones de seguridad y formato para PDO
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Si hay un error, lanzar una excepción fatal
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Devolver los datos como un arreglo asociativo (clave => valor)
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Apagar la emulación para mayor seguridad contra inyecciones SQL
];

// Intentar conectar a la base de datos
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Si la conexión falla (ej. MySQL está apagado), mostrar el error
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}