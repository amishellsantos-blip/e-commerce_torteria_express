<?php
namespace App\Models;

use PDO;

class ProductModel {
    private $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getAllProducts() {
        $stmt = $this->pdo->query('SELECT * FROM products');
        $products = $stmt->fetchAll();
        $final_products = [];

        foreach ($products as $p) {
            $product_id = $p['id'];
            $p['id'] = (int)$p['id'];
            $p['price'] = (float)$p['price'];
            $p['rating'] = $p['rating'] !== null ? (float)$p['rating'] : null;
            $p['reviewsCount'] = $p['reviewsCount'] !== null ? (int)$p['reviewsCount'] : null;

            if ($p['sizeLabel'] === null) unset($p['sizeLabel']);
            if ($p['baseLabel'] === null) unset($p['baseLabel']);
            if ($p['flavorLabel'] === null) unset($p['flavorLabel']);

            // Tamaños
            $stmtSizes = $this->pdo->prepare('SELECT name, priceOffset FROM product_sizes WHERE product_id = ?');
            $stmtSizes->execute([$product_id]);
            $sizes = $stmtSizes->fetchAll();
            if (count($sizes) > 0) {
                foreach ($sizes as &$s) {
                    $s['priceOffset'] = (float)$s['priceOffset'];
                }
                $p['sizes'] = $sizes;
            }

            // Sabores
            $stmtFlavors = $this->pdo->prepare('SELECT name FROM product_flavors WHERE product_id = ?');
            $stmtFlavors->execute([$product_id]);
            $flavors = $stmtFlavors->fetchAll();
            if (count($flavors) > 0) {
                $p['flavors'] = array_column($flavors, 'name');
            }

            // Bases
            $stmtBases = $this->pdo->prepare('SELECT name FROM product_bases WHERE product_id = ?');
            $stmtBases->execute([$product_id]);
            $bases = $stmtBases->fetchAll();
            if (count($bases) > 0) {
                $p['bases'] = array_column($bases, 'name');
            }

            $final_products[] = $p;
        }

        return $final_products;
    }
}
