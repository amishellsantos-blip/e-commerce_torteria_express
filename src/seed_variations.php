<?php
require 'api/db.php';

try {
    // Limpiar tablas de atributos
    $pdo->exec('SET FOREIGN_KEY_CHECKS=0;');
    $pdo->exec('TRUNCATE TABLE product_sizes;');
    $pdo->exec('TRUNCATE TABLE product_flavors;');
    $pdo->exec('TRUNCATE TABLE product_bases;');
    $pdo->exec('SET FOREIGN_KEY_CHECKS=1;');

    echo "Limpiando tablas de atributos...\n";

    // Diccionario de actualizaciones de productos
    $updates = [
        'Torta artesanal de 3quesos con fruta' => ['base_price' => 7000, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 38000]],
        'Torta artesanal de almendras' => ['base_price' => 8000, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 52000]],
        'Torta artesanal quesadillo' => ['base_price' => 4000, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 22000]],
        'Torta artesanal de piña coco' => ['base_price' => 4000, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 22000]],
        'Torta artesanal de ahuyama' => ['base_price' => 3800, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 20200]],
        'Torta artesanal de 3quesos' => ['base_price' => 3800, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 20200]],
        'Torta 3quesos con Arándanos' => ['base_price' => 4000, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 22000]],
        'Torta artesanal choco arequipe' => ['base_price' => 7000, 'sizes' => ['Porción' => 0, 'Entera' => 37000]],
        'Torta artesanal con toppings' => ['base_price' => 7000, 'sizes' => ['Porción' => 0, 'Entera (8 sabores)' => 35000]],
        'Torta artesanal de vainilla y arequipe' => ['base_price' => 7000, 'sizes' => ['Porción' => 0, 'Entera' => 33000]],
        'Torta rey chocolate' => ['base_price' => 7500, 'sizes' => ['Porción' => 0, 'Entera' => 36500]],
        'Torta artesanal de naranja' => ['base_price' => 3800, 'sizes' => ['Porción' => 0, 'Entera (12 porciones)' => 20200]],
        'Torta artesanal de maracuya' => ['base_price' => 4000, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 22000]],
        'Torta artesanal de zanahoria' => ['base_price' => 4000, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 22000]],
        'Torta artesanal de chocolate' => ['base_price' => 3800, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 20200]],
        'Torta artesanal de avena' => ['base_price' => 3800, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 22200]],
        'Torta artesanal de piña' => ['base_price' => 3800, 'sizes' => ['Porción' => 0, 'Entera (8 porciones)' => 20200]],
        
        // Bebidas y postres con precio variable
        'Avena cubana' => ['base_price' => 4500, 'sizes' => ['Vaso' => 0, 'Litro' => 15500]],
        'Arequipe artesanal' => ['base_price' => 2500, 'sizes' => ['Pequeño 40g' => 0, 'Mediano 105g' => 1000, 'Grande 135g' => 2000], 'size_label' => 'Presentación'],
        'Capuccino' => ['base_price' => 5000, 'sizes' => ['Tradicional' => 0, 'Vainilla' => 500], 'size_label' => 'Sabor'],
        'Galletas' => ['base_price' => 4000, 'sizes' => ['Frutos secos' => 0, 'Red Velvet' => 1000, 'Chip Chocolate' => 1000, 'Pistacho' => 1000], 'size_label' => 'Sabor'],
        
        // Sabores fijos (sin diferencia de precio)
        'Frappé' => ['flavors' => ['Milo', 'Oreo', 'Café']],
        'Pasteles hojaldrados' => ['flavors' => ['Pollo', 'Carne', 'Mixto (carne pollo)', 'Pollo y champiñones', 'Pollo, maíz y queso', 'Pollo cabano', 'Pollo butifarra', 'Hawaiano', 'Arequipe', 'Bocadillo y queso']],
        'Deditos' => ['flavors' => ['Queso', 'Bocadillo y queso']],
        'Deditos de queso o bocadillo y queso' => ['flavors' => ['Queso', 'Bocadillo y queso']],
        
        // Bases
        'Jugos naturales' => ['bases' => ['En Agua', 'En Leche']]
    ];

    $stmtUpdatePrice = $pdo->prepare('UPDATE products SET price = ?, sizeLabel = ? WHERE id = ?');
    $stmtInsertSize = $pdo->prepare('INSERT INTO product_sizes (product_id, name, priceOffset) VALUES (?, ?, ?)');
    $stmtInsertFlavor = $pdo->prepare('INSERT INTO product_flavors (product_id, name) VALUES (?, ?)');
    $stmtInsertBase = $pdo->prepare('INSERT INTO product_bases (product_id, name) VALUES (?, ?)');

    $stmtGetProd = $pdo->prepare('SELECT id FROM products WHERE name = ?');

    foreach ($updates as $name => $data) {
        $stmtGetProd->execute([$name]);
        $prod = $stmtGetProd->fetch();
        if (!$prod) {
            echo "Advertencia: Producto '$name' no encontrado.\n";
            continue;
        }
        $pid = $prod['id'];

        // Actualizar precio base si es necesario
        if (isset($data['base_price'])) {
            $label = isset($data['size_label']) ? $data['size_label'] : 'Tamaño';
            $stmtUpdatePrice->execute([$data['base_price'], $label, $pid]);
        }

        // Insertar Sizes
        if (isset($data['sizes'])) {
            foreach ($data['sizes'] as $sizeName => $offset) {
                $stmtInsertSize->execute([$pid, $sizeName, $offset]);
            }
        }

        // Insertar Flavors
        if (isset($data['flavors'])) {
            foreach ($data['flavors'] as $flavorName) {
                $stmtInsertFlavor->execute([$pid, $flavorName]);
            }
        }

        // Insertar Bases
        if (isset($data['bases'])) {
            foreach ($data['bases'] as $baseName) {
                $stmtInsertBase->execute([$pid, $baseName]);
            }
        }
        
        echo "Atributos agregados para: $name\n";
    }

    echo "¡Variaciones agregadas y precios base ajustados con éxito!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
