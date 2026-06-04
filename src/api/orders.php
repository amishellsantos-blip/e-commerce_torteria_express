<?php
// api/orders.php - Manejo de Pedidos y Caja

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/db.php';

session_start();

// En un entorno de producción, exigiríamos sesión obligatoria:
// if (!isset($_SESSION['user_id'])) {
//     http_response_code(401);
//     echo json_encode(["success" => false, "message" => "Debe iniciar sesión para realizar esta acción."]);
//     exit();
// }

$method = $_SERVER['REQUEST_METHOD'];
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1; // Fallback al usuario 1 (para pruebas locales si falla la sesión)
$user_role = isset($_SESSION['user_role']) ? $_SESSION['user_role'] : 'cliente';

try {
    switch ($method) {
        
        // LEER PEDIDOS
        case 'GET':
            if ($user_role === 'admin') {
                // Administrador ve TODOS los pedidos con información del cliente
                $stmt = $pdo->query('
                    SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone 
                    FROM orders o 
                    JOIN users u ON o.user_id = u.id 
                    ORDER BY o.created_at DESC
                ');
                $orders = $stmt->fetchAll();
            } else {
                // Cliente solo ve sus propios pedidos
                $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
                $stmt->execute([$user_id]);
                $orders = $stmt->fetchAll();
            }

            // Para cada orden, buscar sus items
            foreach ($orders as &$order) {
                $stmtItems = $pdo->prepare('
                    SELECT oi.*, p.name as product_name, p.image as product_image
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = ?
                ');
                $stmtItems->execute([$order['id']]);
                $order['items'] = $stmtItems->fetchAll();
            }

            echo json_encode(["success" => true, "data" => $orders], JSON_UNESCAPED_UNICODE);
            break;

        // CREAR NUEVO PEDIDO (Checkout)
        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->items) || count($data->items) === 0) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "El carrito está vacío."]);
                exit();
            }

            // Iniciar transacción SQL para asegurar que si algo falla, no se guarde nada a medias
            $pdo->beginTransaction();

            $total_amount = (float)$data->total_amount;
            $payment_method = isset($data->payment_method) ? trim($data->payment_method) : 'Contra entrega';
            $shipping_address = isset($data->shipping_address) ? trim($data->shipping_address) : 'Recogida en local';
            $shipping_notes = isset($data->shipping_notes) ? trim($data->shipping_notes) : '';

            // 1. Insertar orden principal
            $stmtOrder = $pdo->prepare("INSERT INTO orders (user_id, total_amount, payment_method, shipping_address, shipping_notes, status) VALUES (?, ?, ?, ?, ?, 'pendiente')");
            $stmtOrder->execute([$user_id, $total_amount, $payment_method, $shipping_address, $shipping_notes]);
            $order_id = $pdo->lastInsertId();

            // 2. Insertar cada producto del carrito en order_items
            $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, variation_details) VALUES (?, ?, ?, ?, ?)");
            
            foreach ($data->items as $item) {
                // Serializar las variaciones (tamaño, sabor) a texto JSON
                $variations = isset($item->options) ? json_encode($item->options, JSON_UNESCAPED_UNICODE) : null;
                
                $stmtItem->execute([
                    $order_id,
                    (int)$item->product->id,
                    (int)$item->quantity,
                    (float)$item->finalPrice,
                    $variations
                ]);
            }

            // Confirmar transacción
            $pdo->commit();

            echo json_encode([
                "success" => true, 
                "message" => "Pedido registrado exitosamente.", 
                "order_id" => $order_id
            ]);
            break;

        // ACTUALIZAR ESTADO DEL PEDIDO (Panel Administrador)
        case 'PUT':
            if ($user_role !== 'admin') {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Acceso denegado."]);
                exit();
            }

            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->id) || !isset($data->status)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID y nuevo estado son requeridos."]);
                exit();
            }

            $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([trim($data->status), (int)$data->id]);

            echo json_encode(["success" => true, "message" => "Estado del pedido actualizado."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido."]);
            break;
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error del servidor: " . $e->getMessage()]);
}
?>
