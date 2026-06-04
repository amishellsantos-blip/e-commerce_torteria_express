<?php
namespace App\Controllers;

use App\Models\ProductModel;
use Exception;
use PDO;

class ProductController {
    private $model;

    public function __construct(PDO $pdo) {
        // Inicializamos el modelo pasando la conexión PDO
        require_once __DIR__ . '/../models/ProductModel.php';
        $this->model = new ProductModel($pdo);
    }

    public function index() {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');

        try {
            $products = $this->model->getAllProducts();
            echo json_encode($products, JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al obtener los productos: " . $e->getMessage()]);
        }
    }
}
